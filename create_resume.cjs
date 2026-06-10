// ── Resume creation script for theresumeio.com ──────────────────────────────
// Fills all 7 builder steps with real Vikash Raj SWE resume data.
const { chromium } = require('./node_modules/playwright');
const fs = require('fs');

const PROD = 'https://theresumeio.com';
const OUT  = '/tmp/resume_creation';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

let n = 0;
const ss = async (page, label) => {
  await page.screenshot({ path: `${OUT}/${String(++n).padStart(2,'0')}_${label}.png` });
  console.log(`  📸 ${label}`);
};

// Fill nth visible TEXT input (excludes range, checkbox, radio, hidden)
const fillNth = async (page, idx, val) => {
  const inputs = await page.locator('input:not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):visible').all();
  if (inputs[idx]) { await inputs[idx].click({ timeout: 3000 }); await inputs[idx].fill(val, { timeout: 3000 }); }
  else console.log(`    ⚠️  fillNth(${idx}) — only ${inputs.length} inputs visible`);
};

// Fill the LAST visible text input (for newly-opened accordions)
const fillLast = async (page, val) => {
  const inputs = await page.locator('input:not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):visible').all();
  const last = inputs[inputs.length - 1];
  if (last) { await last.click({ timeout: 3000 }); await last.fill(val, { timeout: 3000 }); }
};

// Type into nth contenteditable rich-text editor
const fillRTE = async (page, idx, text) => {
  const editors = await page.locator('[contenteditable="true"]').all();
  if (editors[idx]) {
    await editors[idx].click({ timeout: 3000 });
    await page.waitForTimeout(300);
    // Select all & delete first, then type
    await page.keyboard.press('Control+a');
    await editors[idx].fill(text, { timeout: 4000 }).catch(async () => {
      await editors[idx].click();
      await page.keyboard.type(text, { delay: 5 });
    });
  }
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

  // ── Open prod builder ──────────────────────────────────────────────────
  console.log('\n▶ Opening builder on theresumeio.com...');
  await page.goto(`${PROD}/builder`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(2500);
  await ss(page, 'step1_open');

  // ── Step 1 — Personal Info ─────────────────────────────────────────────
  // Input order: 0=FirstName, 1=LastName, 2=JobTitle, 3=Address, 4=City,
  //              5=PostalCode, 6=Phone, 7=Email
  // After expanding: +Country(8), +Website(9), +LinkedIn(10)
  console.log('\n▶ Step 1 — Personal Info');
  for (const [i, v] of [
    [0, 'Vikash'], [1, 'Raj'], [2, 'Senior Software Engineer'],
    [3, '123 Mission Street, Apt 4B'], [4, 'San Francisco'], [5, '94105'],
  ]) { await fillNth(page, i, v); console.log(`  ✓ [${i}] "${v}"`); }

  await page.getByPlaceholder('+91 9876543210').fill('+1 415 555 0192').catch(() => {});
  await page.getByPlaceholder('name@email.com').fill('vikash.raj@gmail.com').catch(() => {});
  console.log('  ✓ Phone & Email');

  // Expand hidden fields
  await page.locator('button:has-text("Add more"), span:has-text("Add more")').first()
    .click({ timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(600);

  // After expand: Country(8), Website(9), LinkedIn(10)
  await fillNth(page, 9, 'github.com/vikashraj');     // Website
  await fillNth(page, 10, 'linkedin.com/in/vikashraj'); // LinkedIn
  console.log('  ✓ Website & LinkedIn');
  await ss(page, 'step1_personal');

  // ── Step 2 — Experience ────────────────────────────────────────────────
  console.log('\n▶ Step 2 — Experience');
  await page.locator('button:has-text("Next to Experience")').click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  // ── Job 1: Google ──────────────────────────────────────────────────────
  await page.locator('text=Add Employment').click({ timeout: 6000 });
  await page.waitForTimeout(1000);

  await page.getByPlaceholder('e.g. Independent Practice').first().fill('Senior Software Engineer');
  await page.getByPlaceholder('e.g. High Court').first().fill('Google');
  await page.getByPlaceholder('Sep 2024').first().fill('Mar 2021');
  await page.getByPlaceholder('Dec 2024').first().fill('Jun 2024');
  await page.getByPlaceholder('Patna').first().fill('Mountain View, CA');
  console.log('  ✓ Google fields');

  // Description is a rich-text editor (contenteditable)
  await fillRTE(page, 0,
    '• Led design and implementation of microservices serving 50M+ daily active users\n' +
    '• Reduced API latency by 40% through query optimisation and Redis caching\n' +
    '• Mentored 6 engineers and delivered Search, Notifications, and Feed ranking features on schedule\n' +
    '• Conducted 200+ code reviews per quarter, raising team-wide code quality scores by 25%'
  );
  console.log('  ✓ Google description');
  await ss(page, 'step2_job1_google');

  // ── Job 2: Salesforce ──────────────────────────────────────────────────
  // When Add Employment is clicked, job 1 accordion closes. Only job 2 inputs are visible.
  await page.locator('text=Add Employment').click({ timeout: 6000 });
  await page.waitForTimeout(1200);

  // Use .last() to target the newly-opened accordion's inputs
  await page.getByPlaceholder('e.g. Independent Practice').last().fill('Software Engineer II');
  await page.getByPlaceholder('e.g. High Court').last().fill('Salesforce');
  await page.getByPlaceholder('Sep 2024').last().fill('Jun 2019');
  await page.getByPlaceholder('Dec 2024').last().fill('Feb 2021');
  await page.getByPlaceholder('Patna').last().fill('San Francisco, CA');
  console.log('  ✓ Salesforce fields');

  // For the second RTE editor (last visible contenteditable)
  const rteCount = await page.locator('[contenteditable="true"]').count();
  await fillRTE(page, rteCount - 1,
    '• Built Einstein AI recommendation engine deployed to 10,000+ enterprise clients\n' +
    '• Developed REST APIs handling 2M+ requests/day with 99.9% uptime\n' +
    '• Reduced CI/CD pipeline time by 60% using parallelised test execution'
  );
  console.log('  ✓ Salesforce description');
  await ss(page, 'step2_job2_salesforce');

  // ── Step 3 — Education ─────────────────────────────────────────────────
  console.log('\n▶ Step 3 — Education');
  await page.locator('button:has-text("Next to Education")').click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  await page.locator('text=Add Education').click({ timeout: 6000 });
  await page.waitForTimeout(800);

  // Education inputs: School(0), Degree(1), City(2), Field of Study(3)
  // Graduation Date is a <select> dropdown
  await fillNth(page, 0, 'Indian Institute of Technology (IIT Bombay)');
  await fillNth(page, 1, 'B.Tech in Computer Science & Engineering');
  await fillNth(page, 2, 'Mumbai, India');   // City
  await fillNth(page, 3, 'Computer Science'); // Field of Study

  // Graduation year dropdown
  await page.locator('select').first().selectOption({ label: '2019' }).catch(() =>
    page.locator('select').first().selectOption('2019').catch(() => {})
  );
  console.log('  ✓ Education filled');
  await ss(page, 'step3_education');

  // ── Step 4 — Skills ────────────────────────────────────────────────────
  console.log('\n▶ Step 4 — Skills');
  await page.locator('button:has-text("Next to Skills")').click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  const skills = ['Python', 'TypeScript', 'React', 'Node.js', 'Go', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'System Design', 'GraphQL'];

  for (const skill of skills) {
    // Click "+ Add Skill" link
    await page.locator('text=Add Skill').click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    // After opening, fill the last text input (skill name field)
    // Exclude range inputs (level slider), checkboxes, and the toggle buttons
    const textInputs = await page.locator(
      'input[type="text"]:visible, input:not([type]):visible'
    ).all();
    const last = textInputs[textInputs.length - 1];
    if (last) {
      await last.click({ timeout: 2000 });
      await last.fill(skill, { timeout: 2000 });
      console.log(`  ✓ ${skill}`);
    } else {
      console.log(`  ✗ ${skill} — no text input found (${textInputs.length} inputs)`);
    }
  }
  await ss(page, 'step4_skills');

  // ── Step 5 — Summary (About) ───────────────────────────────────────────
  console.log('\n▶ Step 5 — Summary');
  await page.locator('button:has-text("Next to About")').click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  // Summary also uses a rich text editor
  const summaryText =
    'Senior Software Engineer with 5+ years of experience building scalable distributed systems at Google and Salesforce. ' +
    'Specialised in backend architecture, API design, and cloud infrastructure. ' +
    'Proven track record of shipping products used by 50M+ users, leading high-performing teams, and driving a culture of quality and delivery speed.';

  await fillRTE(page, 0, summaryText);
  // Fallback: regular textarea
  await page.locator('textarea').first().fill(summaryText, { timeout: 3000 }).catch(() => {});
  console.log('  ✓ Summary written');
  await ss(page, 'step5_summary');

  // ── Step 6 — Finish It ─────────────────────────────────────────────────
  console.log('\n▶ Step 6 — Finish It');
  await page.locator('button:has-text("Next to Finish It")').click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await ss(page, 'step6_default');

  // Select Modern template
  await page.locator('button:has-text("Modern")').first().click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);
  console.log('  ✓ Modern template');

  // Pick colour swatch 4 (dark indigo — professional)
  const colorBtns = await page.$$('button[style*="background"]');
  console.log(`  ${colorBtns.length} colour swatches found`);
  if (colorBtns[3]) { await colorBtns[3].click(); await page.waitForTimeout(400); console.log('  ✓ Colour #4 selected'); }
  await ss(page, 'step6_template_set');

  // ── Step 7 — Download ──────────────────────────────────────────────────
  console.log('\n▶ Step 7 — Download');
  await page.locator('button:has-text("Next to Download")').click({ timeout: 8000 });
  await page.waitForTimeout(2500);
  await ss(page, 'step7_download');
  await page.screenshot({ path: `${OUT}/${String(++n).padStart(2,'0')}_final_fullpage.png`, fullPage: true });
  console.log('  📸 final_fullpage');

  // Content verification
  const body = await page.innerText('body').catch(() => '');
  const checks = [
    ['Vikash Raj (name)', body.includes('Vikash') && body.includes('Raj')],
    ['Senior Software Engineer', body.includes('Senior Software Engineer')],
    ['Google', body.includes('Google')],
    ['Salesforce', body.includes('Salesforce')],
    ['IIT Bombay', body.includes('IIT') || body.includes('Indian Institute')],
    ['Email', body.includes('vikash.raj@gmail.com')],
    ['Summary text', body.includes('50M+') || body.includes('distributed systems')],
    ['Skills', body.includes('Python') || body.includes('TypeScript')],
  ];
  console.log('\n  ── Resume content checks ──');
  checks.forEach(([k, v]) => console.log(`    ${v ? '✅' : '❌'} ${k}`));

  // Save
  await page.locator('button:has-text("Save")').first().click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await ss(page, 'final_saved');

  await browser.close();
  const files = fs.readdirSync(OUT);
  console.log(`\n✅ Done — ${files.length} screenshots in /tmp/resume_creation/`);
})();
