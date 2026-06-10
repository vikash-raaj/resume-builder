const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = '/tmp/qa_screenshots';
const REPORT = [];

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

function log(section, status, msg, detail = '') {
  const entry = { section, status, msg, detail };
  REPORT.push(entry);
  const icon = status === 'OK' ? 'OK' : status === 'WARN' ? 'WARN' : 'ERR';
  console.log(`[${icon}] [${section}] ${msg}${detail ? ' — ' + detail : ''}`);
}

async function go(page, url) {
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2500);
}

async function screenshot(page, name) {
  const fp = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: fp, fullPage: true });
  return fp;
}

async function clickNext(pg) {
  const btns = await pg.$$('button');
  for (const btn of btns) {
    const t = (await btn.innerText()).trim().toLowerCase();
    if (t === 'next' || t === 'continue' || t === 'next step') {
      await btn.click();
      await pg.waitForTimeout(1500);
      return true;
    }
  }
  return false;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push({ page: page.url(), text: msg.text() });
  });

  // ── 1. LANDING PAGE ────────────────────────────────────────────────────
  console.log('\n=== 1. LANDING PAGE ===');
  await go(page, BASE_URL);
  await screenshot(page, '01_landing_top');

  const title = await page.title();
  log('Landing', 'OK', `Page title: "${title}"`);

  const h1 = await page.$('h1');
  if (h1) {
    const txt = (await h1.innerText()).trim().substring(0, 100);
    log('Landing', 'OK', `Hero h1 found: "${txt}"`);
  } else {
    log('Landing', 'WARN', 'No h1 heading found on landing page');
  }

  // Scroll to pricing
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await screenshot(page, '01_landing_pricing');
  await page.evaluate(() => window.scrollTo(0, 0));

  const pageText = await page.innerText('body');
  log('Landing', pageText.includes('$0') || pageText.includes('Free') ? 'OK' : 'WARN',
    pageText.includes('$0') ? 'Free $0 plan text visible' : pageText.includes('Free') ? 'Free plan text visible' : 'Free plan text not found');
  log('Landing', pageText.includes('$9') || pageText.includes('9/mo') ? 'OK' : 'WARN',
    pageText.includes('$9') ? 'Pro $9 plan visible' : pageText.includes('9/mo') ? 'Pro 9/mo visible' : 'Pro plan price not found');
  log('Landing', pageText.includes('Start Pro Free Trial') ? 'OK' : 'WARN',
    pageText.includes('Start Pro Free Trial') ? '"Start Pro Free Trial" text present' : '"Start Pro Free Trial" text NOT found — check Pro CTA button copy');

  const signInBtn = await page.$('button:has-text("Sign In"), a:has-text("Sign In"), button:has-text("Log In")');
  log('Landing', signInBtn ? 'OK' : 'WARN', signInBtn ? 'Sign In button visible in nav' : 'Sign In button not found');

  // ── 2. AUTH MODAL ───────────────────────────────────────────────────────
  console.log('\n=== 2. AUTH MODAL ===');
  if (signInBtn) {
    await signInBtn.click();
    await page.waitForTimeout(1500);
    await screenshot(page, '02_auth_modal');
    const modal = await page.$('[class*="modal" i], dialog, [role="dialog"]');
    if (modal) {
      log('Auth', 'OK', 'Auth modal opens on Sign In click');
      const emailInput = await page.$('input[type="email"]');
      const passInput = await page.$('input[type="password"]');
      log('Auth', emailInput ? 'OK' : 'WARN', emailInput ? 'Email input present' : 'Email input missing');
      log('Auth', passInput ? 'OK' : 'WARN', passInput ? 'Password input present' : 'Password input missing');
      const signUpLink = await page.$('text=Sign Up') || await page.$('text=Create account') || await page.$('text=Register');
      log('Auth', signUpLink ? 'OK' : 'WARN', signUpLink ? 'Sign Up option visible in modal' : 'Sign Up link not found');
    } else {
      log('Auth', 'WARN', 'No modal found after clicking Sign In — may navigate to /login page');
      const authUrl = page.url();
      if (authUrl.includes('login') || authUrl.includes('auth') || authUrl.includes('signin')) {
        log('Auth', 'OK', `Navigated to auth page: ${authUrl}`);
      }
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  } else {
    log('Auth', 'WARN', 'Skipped — no Sign In button found on landing');
  }

  // ── 3. DASHBOARD (logged out) ───────────────────────────────────────────
  console.log('\n=== 3. DASHBOARD (logged out) ===');
  await go(page, `${BASE_URL}/dashboard`);
  await screenshot(page, '03_dashboard_loggedout');
  const dashUrl = page.url();
  const dashText = await page.innerText('body');
  const showsAuthPrompt = dashText.toLowerCase().includes('sign in') || dashText.toLowerCase().includes('log in') || dashText.toLowerCase().includes('login') || dashText.toLowerCase().includes('please');
  const redirectedAway = dashUrl !== `${BASE_URL}/dashboard` && dashUrl !== `${BASE_URL}/dashboard/`;
  log('Dashboard', showsAuthPrompt || redirectedAway ? 'OK' : 'WARN',
    redirectedAway ? `Redirected to: ${dashUrl}` : showsAuthPrompt ? 'AuthPrompt shown for logged-out user' : 'On /dashboard but no auth prompt detected',
    `URL: ${dashUrl}`
  );

  // Check for resume cards elements (logged out state may show placeholder)
  const hasCompleteness = dashText.toLowerCase().includes('complete') || dashText.toLowerCase().includes('score');
  const hasUpgrade = dashText.toLowerCase().includes('upgrade') && dashText.toLowerCase().includes('resume');
  log('Dashboard', 'OK', `Completeness score text: ${hasCompleteness}`, `Upgrade banner text: ${hasUpgrade}`);

  // ── 4. RESUME BUILDER ───────────────────────────────────────────────────
  console.log('\n=== 4. RESUME BUILDER ===');
  await go(page, `${BASE_URL}/builder`);
  await screenshot(page, '04_builder_step1');
  const builderUrl = page.url();

  const nameField = await page.$('input[placeholder*="Name" i], input[name*="name" i], input[placeholder*="full" i], input[placeholder*="First" i]');
  const emailField = await page.$('input[type="email"], input[placeholder*="email" i]');
  const phoneField = await page.$('input[type="tel"], input[placeholder*="phone" i], input[name*="phone" i]');
  const photoArea = await page.$('input[type="file"], [class*="photo" i], [class*="avatar" i], label:has-text("Photo"), button:has-text("Photo"), [class*="upload" i]');

  log('Builder/Step1', nameField ? 'OK' : 'WARN', nameField ? 'Name field present' : 'Name field not found', `Builder URL: ${builderUrl}`);
  log('Builder/Step1', emailField ? 'OK' : 'WARN', emailField ? 'Email field present' : 'Email field not found');
  log('Builder/Step1', phoneField ? 'OK' : 'WARN', phoneField ? 'Phone field present' : 'Phone field not found');
  log('Builder/Step1', photoArea ? 'OK' : 'WARN', photoArea ? 'Photo upload area present' : 'Photo upload area not found');

  // Step indicators
  const stepIndicators = await page.$$('[class*="step" i][class*="indicator" i], [class*="wizard" i], [class*="stepper" i], nav[class*="step" i]');
  log('Builder', stepIndicators.length > 0 ? 'OK' : 'WARN', `Step nav indicators: ${stepIndicators.length} found`);

  // ── Step 2: Experience
  const moved2 = await clickNext(page);
  if (moved2) {
    await screenshot(page, '04_builder_step2_experience');
    const s2Text = await page.innerText('body');
    log('Builder/Step2', s2Text.toLowerCase().includes('experience') ? 'OK' : 'WARN',
      s2Text.toLowerCase().includes('experience') ? 'Experience step loaded' : 'Experience step content not found');

    const aiPanel = await page.$('[class*="ai" i]:not(input):not(button), button:has-text("Generate with AI"), button:has-text("AI"), text=AI Writing Assistant');
    const bulletLib = await page.$('text=Bullet Library, [class*="bullet" i][class*="lib" i]');
    log('Builder/Step2', aiPanel ? 'OK' : 'WARN', aiPanel ? 'AI Writing Panel found in Experience' : 'AI Writing Panel not visible in Experience');
    log('Builder/Step2', bulletLib ? 'OK' : 'WARN', bulletLib ? 'Bullet Library Panel found' : 'Bullet Library Panel not found');

    // ── Step 3: Education
    const moved3 = await clickNext(page);
    if (moved3) {
      await screenshot(page, '04_builder_step3_education');
      const s3Text = await page.innerText('body');
      log('Builder/Step3', s3Text.toLowerCase().includes('education') || s3Text.toLowerCase().includes('school') ? 'OK' : 'WARN',
        s3Text.toLowerCase().includes('education') ? 'Education step loaded' : 'Education content not found');

      // ── Step 4: Skills
      const moved4 = await clickNext(page);
      if (moved4) {
        await screenshot(page, '04_builder_step4_skills');
        const s4Text = await page.innerText('body');
        log('Builder/Step4', s4Text.toLowerCase().includes('skill') ? 'OK' : 'WARN',
          s4Text.toLowerCase().includes('skill') ? 'Skills step loaded' : 'Skills content not found');
        const tagInput = await page.$('[class*="tag" i], input[placeholder*="skill" i], input[placeholder*="add" i]');
        log('Builder/Step4', tagInput ? 'OK' : 'WARN', tagInput ? 'Tag/skill input present' : 'Skill tag input not found');

        // ── Step 5: Summary
        const moved5 = await clickNext(page);
        if (moved5) {
          await screenshot(page, '04_builder_step5_summary');
          const s5Text = await page.innerText('body');
          log('Builder/Step5', s5Text.toLowerCase().includes('summary') || s5Text.toLowerCase().includes('profile') ? 'OK' : 'WARN',
            s5Text.toLowerCase().includes('summary') ? 'Summary step loaded' : 'Summary content not found');
          const aiPanel5 = await page.$('button:has-text("Generate"), button:has-text("AI"), [class*="ai" i][class*="assist" i], text=AI');
          log('Builder/Step5', aiPanel5 ? 'OK' : 'WARN', aiPanel5 ? 'AI panel visible in Summary' : 'AI panel not found in Summary');

          // ── Step 6: Finish It (Templates)
          const moved6 = await clickNext(page);
          if (moved6) {
            await screenshot(page, '04_builder_step6_finish');
            const s6Text = await page.innerText('body');

            const templateNames = ['Riga', 'Modern', 'Classic', 'Minimal', 'Executive', 'Tech'];
            let foundTemplates = 0;
            for (const name of templateNames) {
              if (s6Text.includes(name)) foundTemplates++;
            }
            log('Builder/Step6', foundTemplates >= 6 ? 'OK' : 'WARN',
              `Template names found: ${foundTemplates}/6 — ${templateNames.filter(n => s6Text.includes(n)).join(', ') || 'none'}`);

            // Color swatches
            const swatches = await page.$$('[class*="swatch" i], [class*="color-btn" i], [class*="colorOption" i], [class*="color-circle" i], [class*="pallette" i]');
            log('Builder/Step6', swatches.length >= 12 ? 'OK' : 'WARN', `Color swatches: ${swatches.length} found (expected 12+)`);

            // JD Tailoring accordion
            const hasJD = s6Text.toLowerCase().includes('job description') || s6Text.toLowerCase().includes('tailor');
            log('Builder/Step6', hasJD ? 'OK' : 'WARN', hasJD ? 'Job Description Tailoring section found' : 'JD Tailoring not found');
            const accordion = await page.$('details, [class*="accordion" i], [class*="collaps" i]');
            log('Builder/Step6', accordion ? 'OK' : 'WARN', accordion ? 'Accordion element found for JD Tailoring' : 'Accordion element not found');

            // ── Step 7: Download
            const moved7 = await clickNext(page);
            if (moved7) {
              await screenshot(page, '04_builder_step7_download');
              const s7Text = await page.innerText('body');
              log('Builder/Step7', s7Text.toLowerCase().includes('download') ? 'OK' : 'WARN',
                s7Text.toLowerCase().includes('download') ? 'Download button/text found' : 'Download not found');
              log('Builder/Step7', s7Text.toLowerCase().includes('version') ? 'OK' : 'WARN',
                s7Text.toLowerCase().includes('version') ? 'Version History text found' : 'Version History not found');
              log('Builder/Step7', s7Text.toLowerCase().includes('share') ? 'OK' : 'WARN',
                s7Text.toLowerCase().includes('share') ? 'Share Link text found' : 'Share not found');
              log('Builder/Step7', s7Text.toUpperCase().includes('ATS') ? 'OK' : 'WARN',
                s7Text.toUpperCase().includes('ATS') ? 'ATS Score text found' : 'ATS Score not found');
              log('Builder/Step7', s7Text.toLowerCase().includes('language') || s7Text.toLowerCase().includes('english') ? 'OK' : 'WARN',
                s7Text.toLowerCase().includes('language') ? 'Language selector found' : 'Language selector not found');

              // Test ATS button click
              const atsBtn = await page.$('button:has-text("ATS"), button[class*="ats" i]');
              if (atsBtn) {
                await atsBtn.click();
                await page.waitForTimeout(1200);
                const atsModal = await page.$('[class*="modal" i], [role="dialog"]');
                log('Builder/Step7', atsModal ? 'OK' : 'WARN',
                  atsModal ? 'ATS Score button opens modal/dialog' : 'ATS Score button clicked — no modal appeared (may be inline or broken)');
                await screenshot(page, '04_builder_step7_ats_modal');
                await page.keyboard.press('Escape');
                await page.waitForTimeout(500);
              }
            } else {
              log('Builder/Step7', 'WARN', 'Could not reach Step 7 (Download) — Next button not found on Step 6');
            }
          } else {
            log('Builder/Step6', 'WARN', 'Could not reach Step 6 (Finish It) — Next button not found on Step 5');
          }
        } else {
          log('Builder/Step5', 'WARN', 'Could not reach Step 5 (Summary) — Next button not found on Step 4');
        }
      } else {
        log('Builder/Step4', 'WARN', 'Could not reach Step 4 (Skills) — Next button not found on Step 3');
      }
    } else {
      log('Builder/Step3', 'WARN', 'Could not reach Step 3 (Education) — Next button not found on Step 2');
    }
  } else {
    log('Builder', 'WARN', 'Could not navigate past Step 1 — Next button not found');
  }

  // ── 5. COVER LETTER ─────────────────────────────────────────────────────
  console.log('\n=== 5. COVER LETTER ===');
  // Try both routes
  let clLoaded = false;
  for (const route of ['/cover-letter-builder', '/cover-letters']) {
    await go(page, `${BASE_URL}${route}`);
    const clUrl = page.url();
    const clText = await page.innerText('body');
    if (clText.toLowerCase().includes('cover letter') || clText.toLowerCase().includes('cover-letter')) {
      await screenshot(page, '05_cover_letter');
      log('CoverLetter', 'OK', `Cover Letter page loaded at ${route}`, `URL: ${clUrl}`);
      const hasAI = clText.toLowerCase().includes('ai') || clText.toLowerCase().includes('generate');
      log('CoverLetter', hasAI ? 'OK' : 'WARN', hasAI ? 'AI generate functionality text found' : 'AI generate not found');
      const aiPanelEl = await page.$('[class*="purple" i], [class*="ai" i][class*="panel" i], button:has-text("Generate"), [class*="generate" i]');
      log('CoverLetter', aiPanelEl ? 'OK' : 'WARN', aiPanelEl ? 'AI panel/generate element found' : 'AI panel element not detected');
      clLoaded = true;
      break;
    }
  }
  if (!clLoaded) {
    await screenshot(page, '05_cover_letter_notfound');
    log('CoverLetter', 'WARN', 'Cover Letter page not found at /cover-letter-builder or /cover-letters');
  }

  // ── 6. JOB TRACKER ──────────────────────────────────────────────────────
  console.log('\n=== 6. JOB TRACKER ===');
  await go(page, `${BASE_URL}/job-tracker`);
  await screenshot(page, '06_job_tracker');
  const jtText = await page.innerText('body');
  const jtUrl = page.url();
  const kanbanCols = ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'];
  let foundCols = 0;
  const missingCols = [];
  for (const col of kanbanCols) {
    if (jtText.includes(col)) foundCols++;
    else missingCols.push(col);
  }
  log('JobTracker', foundCols >= 5 ? 'OK' : 'WARN',
    `Kanban columns: ${foundCols}/5 found${missingCols.length ? ' — missing: ' + missingCols.join(', ') : ''}`,
    `URL: ${jtUrl}`
  );
  const hasAddJob = jtText.toLowerCase().includes('add job') || jtText.toLowerCase().includes('add card') || jtText.includes('+');
  log('JobTracker', hasAddJob ? 'OK' : 'WARN', hasAddJob ? 'Add job/card button text found' : 'Add job button not detected');

  // ── 7. INTERVIEW PREP ───────────────────────────────────────────────────
  console.log('\n=== 7. INTERVIEW PREP ===');
  await go(page, `${BASE_URL}/interview-practice`);
  await screenshot(page, '07_interview_prep');
  const ipText = await page.innerText('body');
  const ipUrl = page.url();

  const hasSTAR = ipText.includes('STAR') || (ipText.toLowerCase().includes('situation') && ipText.toLowerCase().includes('action') && ipText.toLowerCase().includes('result'));
  log('InterviewPrep', hasSTAR ? 'OK' : 'WARN', hasSTAR ? 'STAR method content found' : 'STAR method not found', `URL: ${ipUrl}`);

  const tabs = await page.$$('[role="tab"]');
  log('InterviewPrep', tabs.length >= 4 ? 'OK' : 'WARN', `Tabs with role="tab": ${tabs.length} found (expected 4+)`);

  const expandable = await page.$$('details, [class*="accordion" i]');
  const questionCards = await page.$$('[class*="question" i], [class*="card" i]');
  log('InterviewPrep', questionCards.length > 0 ? 'OK' : 'WARN', `Question cards: ${questionCards.length} found`);
  log('InterviewPrep', expandable.length > 0 ? 'OK' : 'WARN',
    expandable.length > 0 ? `Expandable elements: ${expandable.length}` : 'No accordion/expandable elements found');

  // ── 8. LINKEDIN OPTIMIZER ───────────────────────────────────────────────
  console.log('\n=== 8. LINKEDIN OPTIMIZER ===');
  await go(page, `${BASE_URL}/linkedin-optimization`);
  await screenshot(page, '08_linkedin');
  const liText = await page.innerText('body');
  const liUrl = page.url();
  log('LinkedIn', liText.toLowerCase().includes('score') || liText.includes('%') ? 'OK' : 'WARN',
    liText.toLowerCase().includes('score') ? 'Score text found' : liText.includes('%') ? 'Percentage shown' : 'Score/% not found', `URL: ${liUrl}`);
  const progressBar = await page.$('[role="progressbar"], [class*="progress" i], [class*="score-bar" i]');
  log('LinkedIn', progressBar ? 'OK' : 'WARN', progressBar ? 'Progress/score bar element found' : 'Progress bar element not found');
  const checkboxes = await page.$$('input[type="checkbox"]');
  log('LinkedIn', checkboxes.length > 0 ? 'OK' : 'WARN', `Checkboxes (tips): ${checkboxes.length} found`);
  log('LinkedIn', liText.toLowerCase().includes('keyword') ? 'OK' : 'WARN',
    liText.toLowerCase().includes('keyword') ? 'Keywords section found' : 'Keywords not found');

  // ── 9. SALARY INSIGHTS ──────────────────────────────────────────────────
  console.log('\n=== 9. SALARY INSIGHTS ===');
  await go(page, `${BASE_URL}/salary-insights`);
  await screenshot(page, '09_salary');
  const salText = await page.innerText('body');
  const salUrl = page.url();
  log('Salary', salText.toLowerCase().includes('salary') || salText.includes('$') ? 'OK' : 'WARN',
    salText.toLowerCase().includes('salary') ? 'Salary content found' : 'Salary/$ not found', `URL: ${salUrl}`);
  const svgChart = await page.$('svg');
  const canvasChart = await page.$('canvas');
  log('Salary', (svgChart || canvasChart) ? 'OK' : 'WARN',
    svgChart ? 'SVG chart found' : canvasChart ? 'Canvas chart found' : 'No chart (SVG/canvas) found');
  const salTabs = await page.$$('[role="tab"]');
  log('Salary', salTabs.length >= 2 ? 'OK' : 'WARN', `Tabs: ${salTabs.length} found (expected market tabs)`);

  // ── 10. APPLICATION KIT ─────────────────────────────────────────────────
  console.log('\n=== 10. APPLICATION KIT ===');
  await go(page, `${BASE_URL}/application-kit`);
  await screenshot(page, '10_application_kit');
  const akText = await page.innerText('body');
  const akUrl = page.url();
  log('AppKit', akText.toLowerCase().includes('step') || akText.match(/\bstep\s+[123]\b/i) ? 'OK' : 'WARN',
    'Step progress text/content check', `URL: ${akUrl}`);
  log('AppKit', akText.toLowerCase().includes('resume') ? 'OK' : 'WARN',
    akText.toLowerCase().includes('resume') ? 'Resume selector/content found' : 'Resume content not found');
  log('AppKit', akText.toLowerCase().includes('cover letter') ? 'OK' : 'WARN',
    akText.toLowerCase().includes('cover letter') ? 'Cover letter selector found' : 'Cover letter not found');

  // ── 11. RESUME EXAMPLES ─────────────────────────────────────────────────
  console.log('\n=== 11. RESUME EXAMPLES ===');
  await go(page, `${BASE_URL}/resume-examples`);
  await screenshot(page, '11_resume_examples');
  const reText = await page.innerText('body');
  const reUrl = page.url();
  const cards = await page.$$('[class*="card" i], [class*="example" i], article');
  const filterBtns = await page.$$('[class*="chip" i], [class*="filter" i] button, [class*="tag" i] button, [class*="industry" i]');
  const searchBox = await page.$('input[type="search"], input[placeholder*="search" i]');
  log('Examples', cards.length >= 12 ? 'OK' : 'WARN', `Example cards: ${cards.length} found (expected 12+)`, `URL: ${reUrl}`);
  log('Examples', filterBtns.length > 0 ? 'OK' : 'WARN', `Industry filter chips/buttons: ${filterBtns.length} found`);
  log('Examples', searchBox ? 'OK' : 'WARN', searchBox ? 'Search box present' : 'Search box not found');

  // ── 12. PAYMENT SUCCESS ─────────────────────────────────────────────────
  console.log('\n=== 12. PAYMENT SUCCESS ===');
  await go(page, `${BASE_URL}/payment-success`);
  await screenshot(page, '12_payment_success');
  const psText = await page.innerText('body');
  const psUrl = page.url();
  const spinnerEl = await page.$('[class*="spinner" i], [class*="loading" i], [class*="loader" i]');
  const hasSuccessContent = psText.toLowerCase().includes('success') || psText.toLowerCase().includes('activat') ||
    psText.toLowerCase().includes('congrat') || psText.toLowerCase().includes('welcome') || psText.toLowerCase().includes('pro');
  log('PaymentSuccess',
    (spinnerEl || hasSuccessContent) ? 'OK' : 'WARN',
    spinnerEl ? 'Loading spinner present' : hasSuccessContent ? 'Success/activation content found' : 'No spinner or success content found',
    `URL: ${psUrl}`
  );

  // ── 13. SIDEBAR & NAV ───────────────────────────────────────────────────
  console.log('\n=== 13. SIDEBAR & NAV ===');
  await go(page, `${BASE_URL}/dashboard`);
  await screenshot(page, '13_sidebar_nav');
  const sidebarText = await page.innerText('body');

  const hasUpgradePro = (sidebarText.toLowerCase().includes('upgrade') && sidebarText.toLowerCase().includes('pro')) ||
    (sidebarText.includes('$9') && sidebarText.toLowerCase().includes('pro'));
  log('Sidebar', hasUpgradePro ? 'OK' : 'WARN',
    hasUpgradePro ? '"Upgrade to Pro" / $9 text found on page' : '"Upgrade to Pro" with price not found in sidebar');

  const navExpected = [
    ['Dashboard', ['Dashboard']],
    ['Builder/Resume', ['Builder', 'Resume Builder', 'My Resumes']],
    ['Cover Letters', ['Cover Letter', 'Cover letter']],
    ['Job Tracker', ['Job Tracker', 'Job tracker']],
    ['Interview Prep', ['Interview', 'Practice']],
    ['LinkedIn', ['LinkedIn', 'Linkedin']],
    ['Salary', ['Salary']],
    ['Application Kit', ['Application Kit', 'Application']],
    ['Resume Examples', ['Examples', 'Resume Example']],
  ];
  for (const [name, keywords] of navExpected) {
    const found = keywords.some(k => sidebarText.includes(k));
    log('Sidebar', found ? 'OK' : 'WARN', found ? `Nav item "${name}" text found` : `Nav item "${name}" text MISSING`);
  }

  // ── CLEANUP & SUMMARY ───────────────────────────────────────────────────
  await browser.close();

  console.log('\n=== CONSOLE ERRORS ===');
  // Deduplicate errors
  const uniqueErrors = [...new Map(consoleErrors.map(e => [e.text, e])).values()];
  if (uniqueErrors.length === 0) {
    console.log('[OK] No console errors detected');
    REPORT.push({ section: 'ConsoleErrors', status: 'OK', msg: 'No console errors detected', detail: '' });
  } else {
    console.log(`[WARN] ${uniqueErrors.length} unique console errors:`);
    uniqueErrors.forEach(e => {
      const msg = e.text.substring(0, 250);
      console.log(`  [ERR] ${msg} — Page: ${e.page}`);
      REPORT.push({ section: 'ConsoleErrors', status: 'ERR', msg, detail: e.page });
    });
  }

  const reportData = { timestamp: new Date().toISOString(), findings: REPORT, consoleErrors: uniqueErrors };
  fs.writeFileSync('/tmp/qa_report.json', JSON.stringify(reportData, null, 2));

  const okCount = REPORT.filter(r => r.status === 'OK').length;
  const warnCount = REPORT.filter(r => r.status === 'WARN').length;
  const errCount = REPORT.filter(r => r.status === 'ERR').length;
  console.log(`\n=== SUMMARY: ${okCount} OK, ${warnCount} WARN, ${errCount} ERR ===`);
  console.log('Report: /tmp/qa_report.json');
  console.log('Screenshots: /tmp/qa_screenshots/');
})();
