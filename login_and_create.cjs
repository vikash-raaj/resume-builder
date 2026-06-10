const { chromium } = require('./node_modules/playwright');
const fs = require('fs');

const PROD = 'https://theresumeio.com';
const EMAIL = 'vikashraj.sfdc@gmail.com';
const PASS  = process.env.RP;
const OUT   = '/tmp/resume_login';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

let n = 0;
const ss = async (page, label) => {
  await page.screenshot({ path: `${OUT}/${String(++n).padStart(2,'0')}_${label}.png` });
  console.log(`  📸 ${label}`);
};

const fillNth = async (page, idx, val) => {
  const inputs = await page.locator('input:not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):visible').all();
  if (inputs[idx]) { await inputs[idx].click({ timeout: 3000 }); await inputs[idx].fill(val, { timeout: 3000 }); }
};

const fillRTE = async (page, idx, text) => {
  const editors = await page.locator('[contenteditable="true"]').all();
  if (editors[idx]) {
    await editors[idx].click({ timeout: 3000 });
    await page.waitForTimeout(300);
    await page.keyboard.press('Control+a');
    await editors[idx].fill(text, { timeout: 4000 }).catch(async () => {
      await editors[idx].click();
      await page.keyboard.type(text, { delay: 5 });
    });
  }
};

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // ── 1. Land on homepage ────────────────────────────────────────────────
  console.log('\n▶ Opening theresumeio.com...');
  await page.goto(PROD, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(2000);
  await ss(page, 'homepage');

  // ── 2. Open Sign In modal ──────────────────────────────────────────────
  console.log('\n▶ Signing in...');
  await page.locator('button:has-text("Sign In"), a:has-text("Sign In"), button:has-text("Log In")').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await ss(page, 'signin_modal');

  // Fill email + password
  await page.locator('input[type="email"]').first().fill(EMAIL, { timeout: 5000 });
  await page.locator('input[type="password"]').first().fill(PASS, { timeout: 5000 });
  console.log('  ✓ Credentials entered');

  // Submit
  await page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Log In")').first().click({ timeout: 6000 });
  await page.waitForTimeout(3000);
  await ss(page, 'after_login');
  console.log(`  ✓ Logged in — URL: ${page.url()}`);

  // ── 3. Go to Dashboard → New Resume ───────────────────────────────────
  console.log('\n▶ Creating new resume...');
  await page.goto(`${PROD}/dashboard`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2000);
  await ss(page, 'dashboard');

  // Click "New Resume"
  await page.locator('button:has-text("New Resume"), button:has-text("Create")').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  // Name the resume in modal
  const modal = page.locator('input[placeholder*="Resume" i], input[placeholder*="name" i], input[placeholder*="Google" i]').first();
  await modal.fill('Senior SWE Resume — Modern', { timeout: 5000 });
  console.log('  ✓ Resume named');
  await page.locator('button:has-text("Create Resume"), button[type="submit"]').first().click({ timeout: 6000 });
  await page.waitForTimeout(2500);
  await ss(page, 'builder_opened');

  // ── 4. Step 1 — Personal Info ──────────────────────────────────────────
  console.log('\n▶ Step 1 — Personal Info');
  for (const [i, v] of [
    [0,'Vikash'],[1,'Raj'],[2,'Senior Software Engineer'],
    [3,'123 Mission Street, Apt 4B'],[4,'San Francisco'],[5,'94105'],
  ]) { await fillNth(page, i, v); }

  await page.getByPlaceholder('+91 9876543210').fill('+1 415 555 0192').catch(() => {});
  await page.getByPlaceholder('name@email.com').fill('vikashraj.sfdc@gmail.com').catch(() => {});

  // Expand hidden fields → Website + LinkedIn
  await page.locator('button:has-text("Add more"), span:has-text("Add more")').first().click({ timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(600);
  await fillNth(page, 9, 'github.com/vikashraj');
  await fillNth(page, 10, 'linkedin.com/in/vikashraj');
  console.log('  ✓ Personal info filled');
  await ss(page, 'step1_personal');

  // ── 5. Step 2 — Experience ─────────────────────────────────────────────
  console.log('\n▶ Step 2 — Experience');
  await page.locator('button:has-text("Next to Experience")').click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  // Job 1 — Google
  await page.locator('text=Add Employment').click({ timeout: 6000 });
  await page.waitForTimeout(1000);

  await page.getByPlaceholder('e.g. Independent Practice').first().fill('Senior Software Engineer');
  await page.getByPlaceholder('e.g. High Court').first().fill('Google');
  await page.getByPlaceholder('Sep 2024').first().fill('Mar 2021');
  await page.getByPlaceholder('Dec 2024').first().fill('Jun 2024');
  await page.getByPlaceholder('Patna').first().fill('Mountain View, CA');
  await fillRTE(page, 0,
    '• Led design and implementation of microservices serving 50M+ daily active users\n' +
    '• Reduced API latency by 40% through query optimisation and Redis caching\n' +
    '• Mentored 6 engineers and shipped Search, Notifications, and Feed ranking features on schedule\n' +
    '• Conducted 200+ code reviews per quarter, raising team code quality scores by 25%'
  );
  console.log('  ✓ Google');
  await ss(page, 'step2_google');

  // Job 2 — Salesforce (new accordion opens, job 1 closes)
  await page.locator('text=Add Employment').click({ timeout: 6000 });
  await page.waitForTimeout(1200);

  await page.getByPlaceholder('e.g. Independent Practice').last().fill('Software Engineer II');
  await page.getByPlaceholder('e.g. High Court').last().fill('Salesforce');
  await page.getByPlaceholder('Sep 2024').last().fill('Jun 2019');
  await page.getByPlaceholder('Dec 2024').last().fill('Feb 2021');
  await page.getByPlaceholder('Patna').last().fill('San Francisco, CA');
  const rteCount = await page.locator('[contenteditable="true"]').count();
  await fillRTE(page, rteCount - 1,
    '• Built Einstein AI recommendation engine deployed to 10,000+ enterprise clients\n' +
    '• Developed REST APIs handling 2M+ requests/day with 99.9% uptime\n' +
    '• Reduced CI/CD pipeline time by 60% using parallelised test execution'
  );
  console.log('  ✓ Salesforce');
  await ss(page, 'step2_salesforce');

  // ── 6. Step 3 — Education ──────────────────────────────────────────────
  console.log('\n▶ Step 3 — Education');
  await page.locator('button:has-text("Next to Education")').click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  await page.locator('text=Add Education').click({ timeout: 6000 });
  await page.waitForTimeout(800);

  await fillNth(page, 0, 'Indian Institute of Technology (IIT Bombay)');
  await fillNth(page, 1, 'B.Tech in Computer Science & Engineering');
  await fillNth(page, 2, 'Mumbai, India');
  await fillNth(page, 3, 'Computer Science');
  await page.locator('select').first().selectOption({ label: '2019' }).catch(() => {});
  console.log('  ✓ Education');
  await ss(page, 'step3_education');

  // ── 7. Step 4 — Skills ─────────────────────────────────────────────────
  console.log('\n▶ Step 4 — Skills');
  await page.locator('button:has-text("Next to Skills")').click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  for (const skill of ['Python','TypeScript','React','Node.js','Go','PostgreSQL','Redis','Docker','Kubernetes','AWS','System Design','GraphQL']) {
    await page.locator('text=Add Skill').click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(400);
    const textInputs = await page.locator('input[type="text"]:visible, input:not([type]):visible').all();
    const last = textInputs[textInputs.length - 1];
    if (last) { await last.click({ timeout: 2000 }); await last.fill(skill, { timeout: 2000 }); }
    console.log(`  ✓ ${skill}`);
  }
  await ss(page, 'step4_skills');

  // ── 8. Step 5 — Summary ────────────────────────────────────────────────
  console.log('\n▶ Step 5 — Summary');
  await page.locator('button:has-text("Next to About")').click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  await fillRTE(page, 0,
    'Senior Software Engineer with 5+ years of experience building scalable distributed systems at Google and Salesforce. ' +
    'Specialised in backend architecture, API design, and cloud infrastructure. ' +
    'Proven track record of shipping products used by 50M+ users while leading teams and driving a culture of quality and delivery speed.'
  );
  await page.locator('textarea').first().fill(
    'Senior Software Engineer with 5+ years of experience building scalable distributed systems at Google and Salesforce. ' +
    'Specialised in backend architecture, API design, and cloud infrastructure. ' +
    'Proven track record of shipping products used by 50M+ users while leading teams and driving a culture of quality and delivery speed.'
  , { timeout: 3000 }).catch(() => {});
  console.log('  ✓ Summary');
  await ss(page, 'step5_summary');

  // ── 9. Step 6 — Finish It — pick Modern template ───────────────────────
  console.log('\n▶ Step 6 — Finish It (Modern template)');
  await page.locator('button:has-text("Next to Finish It")').click({ timeout: 8000 });
  await page.waitForTimeout(1200);

  await page.locator('button:has-text("Modern")').first().click({ timeout: 5000 });
  await page.waitForTimeout(500);
  console.log('  ✓ Modern template selected');

  // Pick blue colour swatch (#2563EB — the default brand blue)
  const colorBtns = await page.$$('button[style*="background"]');
  console.log(`  ${colorBtns.length} colour swatches`);
  if (colorBtns[0]) { await colorBtns[0].click(); await page.waitForTimeout(400); }
  await ss(page, 'step6_modern_template');

  // ── 10. Step 7 — Download & Save ──────────────────────────────────────
  console.log('\n▶ Step 7 — Download');
  await page.locator('button:has-text("Next to Download")').click({ timeout: 8000 });
  await page.waitForTimeout(2500);

  // Save to Firestore (user is logged in now)
  await page.locator('button:has-text("Save")').first().click({ timeout: 5000 });
  await page.waitForTimeout(2000);
  console.log('  ✓ Saved to account');

  await page.screenshot({ path: `${OUT}/${String(++n).padStart(2,'0')}_final_fullpage.png`, fullPage: true });
  console.log('  📸 final_fullpage');
  await ss(page, 'saved_resume');

  // Stay open so user can see
  console.log('\n✅ Resume created and saved! Browser will stay open for 30 seconds...');
  await page.waitForTimeout(30000);
  await browser.close();
})();
