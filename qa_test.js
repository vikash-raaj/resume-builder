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
  const icon = status === 'OK' ? '✅' : status === 'WARN' ? '⚠️' : '❌';
  console.log(`${icon} [${section}] ${msg}${detail ? ' — ' + detail : ''}`);
}

async function screenshot(page, name) {
  const fp = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: fp, fullPage: true });
  return fp;
}

async function waitAndCheck(page, selector, label) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

async function collectConsoleErrors(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  return errors;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push({ page: page.url(), text: msg.text() });
  });

  // ── 1. LANDING PAGE ────────────────────────────────────────────────────
  console.log('\n=== 1. LANDING PAGE ===');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await screenshot(page, '01_landing');

  const title = await page.title();
  log('Landing', 'OK', `Page title: "${title}"`);

  const heroText = await page.$('h1, [class*="hero"] h2, [class*="Hero"] h1');
  if (heroText) {
    const txt = await heroText.innerText();
    log('Landing', 'OK', 'Hero heading found', txt.substring(0, 80));
  } else {
    log('Landing', 'WARN', 'No obvious h1/hero heading found');
  }

  // Pricing section
  const pricingSection = await page.$('[id*="pric"], [class*="pric"], [class*="Pric"], section:has-text("Pricing")');
  if (pricingSection) {
    log('Landing', 'OK', 'Pricing section found');
  } else {
    log('Landing', 'WARN', 'Pricing section not found');
  }

  const freeCard = await page.$('text=$0, text=Free');
  const proCard = await page.$('text=$9, text=Pro');
  if (freeCard) log('Landing', 'OK', 'Free plan ($0) card visible');
  else log('Landing', 'WARN', 'Free plan card not clearly found');

  if (proCard) log('Landing', 'OK', 'Pro plan ($9) card visible');
  else log('Landing', 'WARN', 'Pro plan card not clearly found');

  // Check "Start Pro Free Trial" button text
  const proBtn = await page.$('button:has-text("Start Pro Free Trial"), a:has-text("Start Pro Free Trial")');
  if (proBtn) log('Landing', 'OK', 'Pro button says "Start Pro Free Trial"');
  else {
    const anyProBtn = await page.$('button:has-text("Pro"), a:has-text("Pro")');
    if (anyProBtn) {
      const btnTxt = await anyProBtn.innerText();
      log('Landing', 'WARN', `Pro button found but text is: "${btnTxt}" (expected "Start Pro Free Trial")`);
    } else {
      log('Landing', 'WARN', '"Start Pro Free Trial" button not found');
    }
  }

  // Sign In / Sign Up buttons
  const signInBtn = await page.$('button:has-text("Sign In"), a:has-text("Sign In"), button:has-text("Login"), a:has-text("Login")');
  log('Landing', signInBtn ? 'OK' : 'WARN', signInBtn ? 'Sign In button visible' : 'Sign In button not found');

  // ── 2. AUTH MODAL ───────────────────────────────────────────────────────
  console.log('\n=== 2. AUTH MODAL ===');
  if (signInBtn) {
    await signInBtn.click();
    await page.waitForTimeout(1000);
    await screenshot(page, '02_auth_modal');

    const modal = await page.$('[class*="modal"], [class*="Modal"], dialog, [role="dialog"]');
    if (modal) {
      log('Auth', 'OK', 'Auth modal opens on Sign In click');
      const emailInput = await page.$('input[type="email"]');
      const passInput = await page.$('input[type="password"]');
      log('Auth', emailInput ? 'OK' : 'WARN', emailInput ? 'Email field in modal' : 'Email field missing');
      log('Auth', passInput ? 'OK' : 'WARN', passInput ? 'Password field in modal' : 'Password field missing');
    } else {
      log('Auth', 'WARN', 'No modal dialog found after clicking Sign In');
    }
    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }

  // ── 3. DASHBOARD (logged out) ───────────────────────────────────────────
  console.log('\n=== 3. DASHBOARD (logged out) ===');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await screenshot(page, '03_dashboard_loggedout');
  const url3 = page.url();
  if (url3.includes('/dashboard')) {
    const authPrompt = await page.$('[class*="AuthPrompt"], [class*="auth-prompt"], [class*="login"], text=Sign in to, text=Please log in');
    if (authPrompt) log('Dashboard', 'OK', 'AuthPrompt shown when logged out');
    else log('Dashboard', 'WARN', 'On /dashboard but no AuthPrompt detected — may be showing empty state');
  } else {
    log('Dashboard', 'WARN', `Redirected away from /dashboard to: ${url3}`);
  }

  // ── 4. RESUME BUILDER ───────────────────────────────────────────────────
  console.log('\n=== 4. RESUME BUILDER ===');
  await page.goto(`${BASE_URL}/builder`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await screenshot(page, '04_builder_step1');

  // Step 1 — Personal Info
  const step1Fields = {
    'Full Name': 'input[placeholder*="Name"], input[name*="name"], input[id*="name"]',
    'Email': 'input[type="email"], input[placeholder*="email"], input[name*="email"]',
    'Phone': 'input[type="tel"], input[placeholder*="phone"], input[name*="phone"]',
    'Photo upload': 'input[type="file"], [class*="photo"], [class*="Photo"], [class*="avatar"], button:has-text("Photo"), label:has-text("Photo")',
  };
  for (const [field, sel] of Object.entries(step1Fields)) {
    const el = await page.$(sel);
    log('Builder/Step1', el ? 'OK' : 'WARN', el ? `${field} field present` : `${field} field missing`);
  }

  // Navigate to Step 2 (Experience)
  const nextBtn = await page.$('button:has-text("Next"), button:has-text("next"), [class*="next"]');
  if (nextBtn) {
    await nextBtn.click();
    await page.waitForTimeout(1000);
    await screenshot(page, '04_builder_step2_experience');
    const aiPanel = await page.$('[class*="AI"], [class*="ai"], [class*="writing"], text=AI Writing, text=Generate with AI');
    const bulletLib = await page.$('[class*="Bullet"], [class*="bullet"], text=Bullet Library, text=bullet library');
    log('Builder/Step2', aiPanel ? 'OK' : 'WARN', aiPanel ? 'AI Writing Panel visible in Experience' : 'AI Writing Panel not found in Experience');
    log('Builder/Step2', bulletLib ? 'OK' : 'WARN', bulletLib ? 'Bullet Library Panel visible' : 'Bullet Library Panel not found');

    // Step 3 — Education
    const next2 = await page.$('button:has-text("Next"), button:has-text("next")');
    if (next2) {
      await next2.click();
      await page.waitForTimeout(1000);
      await screenshot(page, '04_builder_step3_education');
      const eduFields = await page.$('input[placeholder*="school"], input[placeholder*="degree"], input[placeholder*="School"], input[placeholder*="Degree"], [class*="education"], [class*="Education"]');
      log('Builder/Step3', eduFields ? 'OK' : 'WARN', eduFields ? 'Education fields present' : 'Education fields not found');

      // Step 4 — Skills
      const next3 = await page.$('button:has-text("Next"), button:has-text("next")');
      if (next3) {
        await next3.click();
        await page.waitForTimeout(1000);
        await screenshot(page, '04_builder_step4_skills');
        const skillInput = await page.$('[class*="tag"], [class*="Tag"], [class*="skill"], input[placeholder*="skill"], input[placeholder*="Skill"]');
        log('Builder/Step4', skillInput ? 'OK' : 'WARN', skillInput ? 'Skills tag input present' : 'Skills input not found');

        // Step 5 — Summary
        const next4 = await page.$('button:has-text("Next"), button:has-text("next")');
        if (next4) {
          await next4.click();
          await page.waitForTimeout(1000);
          await screenshot(page, '04_builder_step5_summary');
          const aiPanel5 = await page.$('[class*="AI"], [class*="ai"], text=AI, text=Generate');
          log('Builder/Step5', aiPanel5 ? 'OK' : 'WARN', aiPanel5 ? 'AI Writing Panel visible in Summary' : 'AI Writing Panel not found in Summary');

          // Step 6 — Finish It / Templates
          const next5 = await page.$('button:has-text("Next"), button:has-text("next")');
          if (next5) {
            await next5.click();
            await page.waitForTimeout(1000);
            await screenshot(page, '04_builder_step6_finish');

            // Count template buttons
            const templateBtns = await page.$$('[class*="template"], [class*="Template"], button[class*="template"]');
            const templateNames = ['Riga', 'Modern', 'Classic', 'Minimal', 'Executive', 'Tech'];
            let foundTemplates = 0;
            for (const name of templateNames) {
              const el = await page.$(`text=${name}`);
              if (el) foundTemplates++;
            }
            log('Builder/Step6', foundTemplates >= 6 ? 'OK' : 'WARN', `Template buttons: found ${foundTemplates}/6 named templates`);

            // Color swatches
            const swatches = await page.$$('[class*="swatch"], [class*="color"], [class*="Color"], input[type="color"]');
            log('Builder/Step6', swatches.length >= 12 ? 'OK' : 'WARN', `Color swatches: ${swatches.length} found (expected 12+)`);

            // Job Description Tailoring accordion
            const jdAccordion = await page.$('text=Job Description, text=Tailoring, [class*="accordion"], details');
            log('Builder/Step6', jdAccordion ? 'OK' : 'WARN', jdAccordion ? 'Job Description Tailoring accordion present' : 'JD Tailoring accordion not found');

            // Step 7 — Download
            const next6 = await page.$('button:has-text("Next"), button:has-text("next")');
            if (next6) {
              await next6.click();
              await page.waitForTimeout(1000);
              await screenshot(page, '04_builder_step7_download');
              const downloadBtn = await page.$('button:has-text("Download"), a:has-text("Download PDF"), button:has-text("PDF")');
              const versionBtn = await page.$('button:has-text("Version"), text=Version History');
              const shareBtn = await page.$('button:has-text("Share"), text=Share Link');
              const atsBtn = await page.$('button:has-text("ATS"), text=ATS Score');
              const langSel = await page.$('select, [class*="language"], [class*="Language"]');
              log('Builder/Step7', downloadBtn ? 'OK' : 'WARN', downloadBtn ? 'Download PDF button present' : 'Download PDF button missing');
              log('Builder/Step7', versionBtn ? 'OK' : 'WARN', versionBtn ? 'Version History button present' : 'Version History button missing');
              log('Builder/Step7', shareBtn ? 'OK' : 'WARN', shareBtn ? 'Share Link button present' : 'Share Link button missing');
              log('Builder/Step7', atsBtn ? 'OK' : 'WARN', atsBtn ? 'ATS Score button present' : 'ATS Score button missing');
              log('Builder/Step7', langSel ? 'OK' : 'WARN', langSel ? 'Language selector present' : 'Language selector missing');
            }
          }
        }
      }
    }
  } else {
    log('Builder', 'WARN', 'Next button not found on step 1 — cannot navigate steps');
  }

  // ── 5. COVER LETTER BUILDER ─────────────────────────────────────────────
  console.log('\n=== 5. COVER LETTER BUILDER ===');
  // Try both possible routes
  await page.goto(`${BASE_URL}/cover-letter-builder`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  let clUrl = page.url();
  if (clUrl.includes('404') || clUrl === BASE_URL + '/') {
    await page.goto(`${BASE_URL}/cover-letters`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    clUrl = page.url();
  }
  await screenshot(page, '05_cover_letter');
  const aiGenBtn = await page.$('[class*="purple"], button:has-text("Generate"), button:has-text("AI"), text=AI generate, [class*="ai-panel"], [class*="AI"]');
  log('CoverLetter', aiGenBtn ? 'OK' : 'WARN', aiGenBtn ? 'AI Generate button/panel visible' : 'AI generate button not clearly found', `URL: ${clUrl}`);

  // ── 6. JOB TRACKER ──────────────────────────────────────────────────────
  console.log('\n=== 6. JOB TRACKER ===');
  await page.goto(`${BASE_URL}/job-tracker`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await screenshot(page, '06_job_tracker');
  const kanbanCols = ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'];
  let foundCols = 0;
  for (const col of kanbanCols) {
    const el = await page.$(`text=${col}`);
    if (el) foundCols++;
  }
  log('JobTracker', foundCols >= 5 ? 'OK' : 'WARN', `Kanban columns: ${foundCols}/5 found`, `URL: ${page.url()}`);

  // ── 7. INTERVIEW PREP ───────────────────────────────────────────────────
  console.log('\n=== 7. INTERVIEW PREP ===');
  await page.goto(`${BASE_URL}/interview-practice`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await screenshot(page, '07_interview_prep');
  const starMethod = await page.$('text=STAR, [class*="star"], [class*="STAR"]');
  const tabs = await page.$$('[role="tab"], [class*="tab"]');
  log('InterviewPrep', starMethod ? 'OK' : 'WARN', starMethod ? 'STAR method reference found' : 'STAR method not found');
  log('InterviewPrep', tabs.length >= 4 ? 'OK' : 'WARN', `Category tabs: ${tabs.length} found (expected 4+)`, `URL: ${page.url()}`);

  // ── 8. LINKEDIN OPTIMIZER ───────────────────────────────────────────────
  console.log('\n=== 8. LINKEDIN OPTIMIZER ===');
  await page.goto(`${BASE_URL}/linkedin-optimization`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await screenshot(page, '08_linkedin');
  const scoreBar = await page.$('[class*="score"], [class*="Score"], [class*="progress"], [role="progressbar"]');
  const tips = await page.$$('[class*="tip"], [class*="checklist"], input[type="checkbox"]');
  const kwSidebar = await page.$('[class*="keyword"], [class*="Keyword"], text=Keywords');
  log('LinkedIn', scoreBar ? 'OK' : 'WARN', scoreBar ? 'Score bar found' : 'Score bar not found');
  log('LinkedIn', tips.length > 0 ? 'OK' : 'WARN', `Checkable tips: ${tips.length} found`);
  log('LinkedIn', kwSidebar ? 'OK' : 'WARN', kwSidebar ? 'Keyword sidebar found' : 'Keyword sidebar not found', `URL: ${page.url()}`);

  // ── 9. SALARY INSIGHTS ──────────────────────────────────────────────────
  console.log('\n=== 9. SALARY INSIGHTS ===');
  await page.goto(`${BASE_URL}/salary-insights`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await screenshot(page, '09_salary');
  const roleList = await page.$('[class*="role"], [class*="job-list"], ul li, [class*="Role"]');
  const chartEl = await page.$('svg, canvas, [class*="chart"], [class*="Chart"], [class*="bar"]');
  const marketTabs = await page.$$('[role="tab"], [class*="tab"]');
  log('Salary', roleList ? 'OK' : 'WARN', roleList ? 'Role list found' : 'Role list not found');
  log('Salary', chartEl ? 'OK' : 'WARN', chartEl ? 'Chart element found' : 'Salary bar chart not found');
  log('Salary', marketTabs.length >= 2 ? 'OK' : 'WARN', `Market tabs: ${marketTabs.length} found`, `URL: ${page.url()}`);

  // ── 10. APPLICATION KIT ─────────────────────────────────────────────────
  console.log('\n=== 10. APPLICATION KIT ===');
  await page.goto(`${BASE_URL}/application-kit`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await screenshot(page, '10_application_kit');
  const steps = await page.$$('[class*="step"], [class*="Step"], [class*="progress"]');
  const resumeSel = await page.$('[class*="resume"], select, [class*="dropdown"]');
  const coverSel = await page.$('[class*="cover"], [class*="Cover"]');
  log('AppKit', steps.length > 0 ? 'OK' : 'WARN', `Progress steps: ${steps.length} found (expected 3-step progress)`);
  log('AppKit', resumeSel ? 'OK' : 'WARN', resumeSel ? 'Resume selector found' : 'Resume selector not found');
  log('AppKit', coverSel ? 'OK' : 'WARN', coverSel ? 'Cover letter selector found' : 'Cover letter selector not found', `URL: ${page.url()}`);

  // ── 11. RESUME EXAMPLES ─────────────────────────────────────────────────
  console.log('\n=== 11. RESUME EXAMPLES ===');
  await page.goto(`${BASE_URL}/resume-examples`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await screenshot(page, '11_resume_examples');
  const exampleCards = await page.$$('[class*="card"], [class*="Card"], [class*="example"], article');
  const filterChips = await page.$$('[class*="chip"], [class*="filter"], [class*="tag"], button[class*="industry"]');
  const searchBox = await page.$('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]');
  log('Examples', exampleCards.length >= 12 ? 'OK' : 'WARN', `Example cards: ${exampleCards.length} found (expected 12+)`);
  log('Examples', filterChips.length > 0 ? 'OK' : 'WARN', `Industry filter chips: ${filterChips.length} found`);
  log('Examples', searchBox ? 'OK' : 'WARN', searchBox ? 'Search box present' : 'Search box not found', `URL: ${page.url()}`);

  // ── 12. PAYMENT SUCCESS ─────────────────────────────────────────────────
  console.log('\n=== 12. PAYMENT SUCCESS ===');
  await page.goto(`${BASE_URL}/payment-success`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await screenshot(page, '12_payment_success');
  const spinner = await page.$('[class*="spinner"], [class*="loading"], [class*="Loader"], svg[class*="spin"]');
  const successMsg = await page.$('text=success, text=activated, text=Congrats, text=Welcome, text=Pro');
  const payUrl = page.url();
  log('PaymentSuccess', (spinner || successMsg) ? 'OK' : 'WARN',
    spinner ? 'Loading spinner shown' : (successMsg ? 'Activation/success message shown' : 'No spinner or success content found'),
    `URL: ${payUrl}`
  );

  // ── 13. SIDEBAR NAV ─────────────────────────────────────────────────────
  console.log('\n=== 13. SIDEBAR ===');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await screenshot(page, '13_sidebar');
  const upgradeBtn = await page.$('text=Upgrade to Pro, [class*="upgrade"], [class*="Upgrade"]');
  log('Sidebar', upgradeBtn ? 'OK' : 'WARN', upgradeBtn ? '"Upgrade to Pro" button visible in sidebar' : 'Upgrade to Pro button not found in sidebar');

  const navItems = [
    ['Dashboard', 'a[href*="dashboard"], a:has-text("Dashboard")'],
    ['Builder', 'a[href*="builder"], a:has-text("Builder"), a:has-text("Resume")'],
    ['Cover Letter', 'a[href*="cover"], a:has-text("Cover")'],
    ['Job Tracker', 'a[href*="job"], a:has-text("Job")'],
    ['Interview', 'a[href*="interview"], a:has-text("Interview")'],
    ['LinkedIn', 'a[href*="linkedin"], a:has-text("LinkedIn")'],
    ['Salary', 'a[href*="salary"], a:has-text("Salary")'],
    ['App Kit', 'a[href*="application"], a:has-text("Application")'],
    ['Examples', 'a[href*="example"], a:has-text("Example")'],
  ];
  let foundNav = 0;
  for (const [name, sel] of navItems) {
    const el = await page.$(sel);
    if (el) foundNav++;
    else log('Sidebar', 'WARN', `Nav item missing: ${name}`);
  }
  if (foundNav === navItems.length) log('Sidebar', 'OK', `All ${navItems.length} nav items found`);
  else log('Sidebar', 'WARN', `Only ${foundNav}/${navItems.length} nav items found`);

  // ── FINAL CONSOLE ERRORS SUMMARY ────────────────────────────────────────
  await browser.close();

  console.log('\n=== CONSOLE ERRORS ===');
  if (consoleErrors.length === 0) {
    console.log('✅ No console errors detected');
  } else {
    consoleErrors.forEach(e => console.log(`❌ [${e.page}] ${e.text}`));
  }

  // Write JSON report
  const report = {
    timestamp: new Date().toISOString(),
    findings: REPORT,
    consoleErrors,
  };
  fs.writeFileSync('/tmp/qa_report.json', JSON.stringify(report, null, 2));
  console.log('\nReport saved to /tmp/qa_report.json');
  console.log('Screenshots saved to /tmp/qa_screenshots/');
})();
