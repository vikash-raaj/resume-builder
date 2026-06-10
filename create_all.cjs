const { chromium } = require('./node_modules/playwright');
const fs = require('fs');

const PROD  = 'https://theresumeio.com';
const EMAIL = 'vikashr370@gmail.com';
const PASS  = process.env.RP;
const OUT   = '/tmp/create_resume';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

let n = 0;
const ss = (page, label) =>
  page.screenshot({ path: `${OUT}/${String(++n).padStart(2,'0')}_${label}.png` })
      .then(() => console.log(`  📸 ${label}`));

const fillNth = async (page, idx, val) => {
  const inputs = await page.locator(
    'input:not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):visible'
  ).all();
  if (inputs[idx]) { await inputs[idx].click({ timeout: 3000 }); await inputs[idx].fill(val, { timeout: 3000 }); }
};

const fillRTE = async (page, idx, text) => {
  const eds = await page.locator('[contenteditable="true"]').all();
  if (!eds[idx]) return;
  await eds[idx].click({ timeout: 3000 });
  await page.waitForTimeout(200);
  await page.keyboard.press('Control+a');
  await eds[idx].fill(text, { timeout: 4000 }).catch(async () => {
    await eds[idx].click();
    await page.keyboard.type(text, { delay: 4 });
  });
};

(async () => {
  if (!PASS) { console.error('Set RP env var:  RP=<password> node create_all.cjs'); process.exit(1); }

  const browser = await chromium.launch({ headless: false, slowMo: 60 });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

  // ── Login ────────────────────────────────────────────────────────────────
  console.log('\n▶ Signing in…');
  await page.goto(PROD, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.locator('button:has-text("Sign In"), a:has-text("Sign In")').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.locator('input[type="email"]').first().fill(EMAIL);
  await page.locator('input[type="password"]').first().fill(PASS);
  await page.locator('button[type="submit"], button:has-text("Sign In")').first().click({ timeout: 6000 });
  await page.waitForTimeout(3000);
  console.log('  ✓ Logged in');

  // ── New Resume ───────────────────────────────────────────────────────────
  console.log('\n▶ Creating resume…');
  await page.goto(`${PROD}/dashboard`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.locator('button:has-text("New Resume"), button:has-text("Create")').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.locator('input[placeholder*="Resume" i], input[placeholder*="Untitled" i], input[placeholder*="name" i]')
    .first().fill('Vikash Raj — Senior SWE');
  await page.locator('button:has-text("Create Resume"), button[type="submit"]').first().click({ timeout: 6000 });
  await page.waitForTimeout(2500);

  // ── Step 1 — Personal Info ───────────────────────────────────────────────
  console.log('\n▶ Step 1 — Personal Info');
  for (const [i, v] of [[0,'Vikash'],[1,'Raj'],[2,'Senior Software Engineer'],[3,'123 Mission St, Apt 4B'],[4,'San Francisco'],[5,'94105']])
    await fillNth(page, i, v);
  await page.getByPlaceholder('+91 9876543210').fill('+1 415 555 0192').catch(() => {});
  await page.getByPlaceholder('name@email.com').fill('vikashr370@gmail.com').catch(() => {});
  await page.locator('button:has-text("Add more"), span:has-text("Add more")').first().click({ timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(500);
  await fillNth(page, 9, 'github.com/vikashraj');
  await fillNth(page, 10, 'linkedin.com/in/vikashraj');
  await ss(page, '1_personal');

  // ── Step 2 — Experience ──────────────────────────────────────────────────
  console.log('\n▶ Step 2 — Experience');
  await page.locator('button:has-text("Next to Experience")').click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  await page.locator('text=Add Employment').click({ timeout: 6000 });
  await page.waitForTimeout(800);
  await page.getByPlaceholder('e.g. Independent Practice').first().fill('Senior Software Engineer');
  await page.getByPlaceholder('e.g. High Court').first().fill('Google');
  await page.getByPlaceholder('Sep 2024').first().fill('Mar 2021');
  await page.getByPlaceholder('Dec 2024').first().fill('Jun 2024');
  await page.getByPlaceholder('Patna').first().fill('Mountain View, CA');
  await fillRTE(page, 0,
    '• Led microservices serving 50M+ daily active users across Search and Feed\n' +
    '• Reduced API latency by 40% via query optimisation and Redis caching\n' +
    '• Mentored 6 engineers; delivered 3 major features on schedule\n' +
    '• Conducted 200+ code reviews/quarter, raising team quality scores by 25%'
  );
  console.log('  ✓ Google');

  await page.locator('text=Add Employment').click({ timeout: 6000 });
  await page.waitForTimeout(1000);
  await page.getByPlaceholder('e.g. Independent Practice').last().fill('Software Engineer II');
  await page.getByPlaceholder('e.g. High Court').last().fill('Salesforce');
  await page.getByPlaceholder('Sep 2024').last().fill('Jun 2019');
  await page.getByPlaceholder('Dec 2024').last().fill('Feb 2021');
  await page.getByPlaceholder('Patna').last().fill('San Francisco, CA');
  const rteCount = await page.locator('[contenteditable="true"]').count();
  await fillRTE(page, rteCount - 1,
    '• Built Einstein AI recommendation engine for 10,000+ enterprise clients\n' +
    '• REST APIs handling 2M+ requests/day with 99.9% uptime\n' +
    '• Cut CI/CD pipeline time by 60% through parallelised test execution'
  );
  console.log('  ✓ Salesforce');
  await ss(page, '2_experience');

  // ── Step 3 — Education ───────────────────────────────────────────────────
  console.log('\n▶ Step 3 — Education');
  await page.locator('button:has-text("Next to Education")').click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.locator('text=Add Education').click({ timeout: 6000 });
  await page.waitForTimeout(700);
  await fillNth(page, 0, 'Indian Institute of Technology (IIT Bombay)');
  await fillNth(page, 1, 'B.Tech in Computer Science & Engineering');
  await fillNth(page, 2, 'Mumbai, India');
  await fillNth(page, 3, 'Computer Science');
  await page.locator('select').first().selectOption({ label: '2019' }).catch(() => {});
  await ss(page, '3_education');

  // ── Step 4 — Skills ──────────────────────────────────────────────────────
  console.log('\n▶ Step 4 — Skills');
  await page.locator('button:has-text("Next to Skills")').click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  for (const skill of ['Python','TypeScript','React','Node.js','Go','PostgreSQL','Redis','Docker','Kubernetes','AWS','System Design','GraphQL']) {
    await page.locator('text=Add Skill').click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(350);
    const ti = await page.locator('input[type="text"]:visible, input:not([type]):visible').all();
    const last = ti[ti.length - 1];
    if (last) { await last.click({ timeout: 2000 }); await last.fill(skill, { timeout: 2000 }); }
  }
  await ss(page, '4_skills');

  // ── Step 5 — Summary ─────────────────────────────────────────────────────
  console.log('\n▶ Step 5 — Summary');
  await page.locator('button:has-text("Next to About")').click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  const summary = 'Senior Software Engineer with 5+ years building scalable distributed systems at Google and Salesforce. Specialised in backend architecture, API design, and cloud infrastructure. Proven track record shipping products used by 50M+ users while leading teams and driving delivery speed.';
  await fillRTE(page, 0, summary);
  await page.locator('textarea').first().fill(summary, { timeout: 3000 }).catch(() => {});
  await ss(page, '5_summary');

  // ── Step 6 — Template ────────────────────────────────────────────────────
  console.log('\n▶ Step 6 — Modern template');
  await page.locator('button:has-text("Next to Finish It")').click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.locator('button:has-text("Modern")').first().click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(400);
  const colorBtns = await page.$$('button[style*="background"]');
  if (colorBtns[0]) { await colorBtns[0].click(); await page.waitForTimeout(300); }
  await ss(page, '6_template');

  // ── Step 7 — Save ────────────────────────────────────────────────────────
  console.log('\n▶ Step 7 — Saving…');
  await page.locator('button:has-text("Next to Download")').click({ timeout: 8000 });
  await page.waitForTimeout(2000);
  await page.locator('button:has-text("Save")').first().click({ timeout: 6000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await ss(page, '7_saved');

  console.log('\n✅ Resume saved to account! Browser stays open 20s…');
  await page.waitForTimeout(20000);
  await browser.close();
})();
