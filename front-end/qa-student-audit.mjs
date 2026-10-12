import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:5173';

const ROUTES = [
  { name: 'Dashboard', path: '/student/dashboard' },
  { name: 'Explore Courses', path: '/student/explore' },
  { name: 'Course Details', path: '/student/course/crs-1' },
  { name: 'Checkout', path: '/student/checkout' },
  { name: 'Payment Success', path: '/student/payment-success' },
  { name: 'My Learning', path: '/student/my-learning' },
  { name: 'Course Progress', path: '/student/course-progress' },
  { name: 'Learning Player', path: '/student/player' },
  { name: 'Quiz', path: '/student/quiz' },
  { name: 'Certificates', path: '/student/certificates' },
  { name: 'Profile', path: '/student/profile' },
];

function isWhiteOrTransparent(color) {
  if (!color) return true;
  const c = color.replace(/\s+/g, '').toLowerCase();
  return (
    c === 'rgb(255,255,255)' ||
    c === 'rgba(255,255,255,1)' ||
    c === 'transparent' ||
    c === 'rgba(0,0,0,0)'
  );
}

function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
}

function isLight(rgb) {
  if (!rgb) return true; // Assume light if transparent
  // Relative luminance estimation
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 > 180;
}

async function runAudit() {
  console.log('====================================================');
  console.log('Starting Student Portal Automated Browser QA Audit');
  console.log(`Connecting Edge browser: ${EDGE_PATH}`);
  console.log('====================================================\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const auditReport = {
    timestamp: new Date().toISOString(),
    routesChecked: 0,
    totalInteractiveElements: 0,
    totalHoversTested: 0,
    totalClicksTested: 0,
    contrastPassCount: 0,
    contrastFailCount: 0,
    consoleErrors: [],
    issues: []
  };

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore routine favicon or harmless analytics errors
      if (!text.includes('favicon.ico')) {
        auditReport.consoleErrors.push(`[Console Error] ${text}`);
      }
    }
  });

  page.on('pageerror', (err) => {
    auditReport.consoleErrors.push(`[Page Crash/Exception] ${err.message}`);
  });

  // Step 1: Initialize local storage with mock student session
  console.log('Navigating to root and setting up Student auth session...');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('nexuspay_auth_token', 'mock_student_jwt_token_2026');
    localStorage.setItem('auth_token', 'mock_student_jwt_token_2026');
    localStorage.setItem('nexuspay_student_token', 'mock_student_jwt_token_2026');
    localStorage.setItem('user_role', 'Student');
    localStorage.setItem('user_name', 'Vujja Punith Sai');
    localStorage.setItem('user_email', 's20240010260@iiits.in');
  });

  // Step 2: Loop through each route
  for (const route of ROUTES) {
    console.log(`\n----------------------------------------------------`);
    console.log(`Auditing: ${route.name} (${route.path})`);
    console.log(`----------------------------------------------------`);

    try {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle0', timeout: 15000 });
    } catch {
      // If networkidle0 times out, wait 2 seconds
      await new Promise(r => setTimeout(r, 2000));
    }

    auditReport.routesChecked++;

    // Evaluate all buttons and interactive controls on this page
    const elementsData = await page.evaluate(() => {
      const getEffectiveBgColor = (el) => {
        let current = el;
        while (current && current !== document.body) {
          const bg = window.getComputedStyle(current).backgroundColor;
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
            return bg;
          }
          current = current.parentElement;
        }
        return 'rgb(255, 255, 255)'; // default body white
      };

      const nodes = Array.from(document.querySelectorAll('button, a[role="button"], input[type="button"], input[type="submit"], [role="tab"]'));
      return nodes.map((node, index) => {
        const style = window.getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        const text = (node.innerText || node.getAttribute('aria-label') || node.getAttribute('title') || node.value || '').trim();
        const effectiveBg = style.backgroundColor === 'rgba(0, 0, 0, 0)' || style.backgroundColor === 'transparent'
          ? getEffectiveBgColor(node.parentElement)
          : style.backgroundColor;

        return {
          index,
          tag: node.tagName.toLowerCase(),
          text: text.slice(0, 40),
          visible: rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0,
          color: style.color,
          backgroundColor: style.backgroundColor,
          effectiveBg,
          className: node.className || '',
          disabled: node.disabled || false
        };
      });
    });

    console.log(`Found ${elementsData.length} interactive controls on ${route.name}.`);
    auditReport.totalInteractiveElements += elementsData.length;

    let pageContrastFailures = 0;

    for (const el of elementsData) {
      if (!el.visible) continue;

      // Check contrast / white-on-white
      const textColorRgb = parseRgb(el.color);
      const bgRgb = parseRgb(el.effectiveBg);

      const isTextWhite = textColorRgb && textColorRgb.r > 240 && textColorRgb.g > 240 && textColorRgb.b > 240;
      const isBgWhiteOrLight = bgRgb && isLight(bgRgb);

      let hasContrastBug = false;
      let reason = '';

      if (isTextWhite && isBgWhiteOrLight) {
        hasContrastBug = true;
        reason = `White text (${el.color}) on light/white background (${el.effectiveBg})`;
      } else if (textColorRgb && bgRgb && Math.abs(textColorRgb.r - bgRgb.r) < 20 && Math.abs(textColorRgb.g - bgRgb.g) < 20 && Math.abs(textColorRgb.b - bgRgb.b) < 20) {
        hasContrastBug = true;
        reason = `Low contrast: text color matches background color (${el.color} vs ${el.effectiveBg})`;
      }

      if (hasContrastBug) {
        pageContrastFailures++;
        auditReport.contrastFailCount++;
        const bug = {
          route: route.path,
          element: `"${el.text}" <${el.tag}>`,
          classes: el.className,
          reason
        };
        auditReport.issues.push(bug);
        console.error(`  [CONTRAST BUG] ${bug.element} at ${route.path}: ${reason}`);
      } else {
        auditReport.contrastPassCount++;
      }
    }

    // Step 2b: Interaction test (hover and click test on tabs / filters / buttons)
    const interactiveHandles = await page.$$('button, a[role="button"], [role="tab"]');
    console.log(`Testing hovers and safe clicks across ${interactiveHandles.length} elements...`);

    let testedClicksOnPage = 0;
    for (let i = 0; i < Math.min(interactiveHandles.length, 12); i++) {
      const handle = interactiveHandles[i];
      try {
        const isInteractable = await handle.evaluate((btn) => {
          const rect = btn.getBoundingClientRect();
          const s = window.getComputedStyle(btn);
          return rect.width > 0 && rect.height > 0 && s.display !== 'none' && !btn.disabled;
        });

        if (!isInteractable) continue;

        // Hover
        await handle.hover();
        auditReport.totalHoversTested++;

        const hoverStyles = await handle.evaluate((btn) => {
          const s = window.getComputedStyle(btn);
          return { color: s.color, bg: s.backgroundColor, text: btn.innerText.slice(0, 30) };
        });

        const hoverTextRgb = parseRgb(hoverStyles.color);
        const hoverBgRgb = parseRgb(hoverStyles.bg);
        if (hoverTextRgb && hoverBgRgb && isLight(hoverBgRgb) && hoverTextRgb.r > 240 && hoverTextRgb.g > 240 && hoverTextRgb.b > 240) {
          auditReport.issues.push({
            route: route.path,
            element: `"${hoverStyles.text}"`,
            reason: `Turns white on hover! Text: ${hoverStyles.color}, Bg: ${hoverStyles.bg}`
          });
          console.error(`  [HOVER BUG] Button "${hoverStyles.text}" turns white on hover!`);
        }

        // Safe Click for tab pills, category pills, or toggles
        const canClick = await handle.evaluate((btn) => {
          const text = btn.innerText.toLowerCase();
          const isNavOrSubmit = text.includes('pay') || text.includes('submit') || text.includes('logout') || text.includes('delete') || text.includes('enroll');
          return !isNavOrSubmit;
        });

        if (canClick) {
          await handle.click();
          testedClicksOnPage++;
          auditReport.totalClicksTested++;
          await new Promise(r => setTimeout(r, 100));

          // Check style after click
          const postClickStyles = await handle.evaluate((btn) => {
            const s = window.getComputedStyle(btn);
            return { color: s.color, bg: s.backgroundColor, text: btn.innerText.slice(0, 30) };
          });

          const postTextRgb = parseRgb(postClickStyles.color);
          const postBgRgb = parseRgb(postClickStyles.bg);
          if (postTextRgb && postBgRgb && isLight(postBgRgb) && postTextRgb.r > 240 && postTextRgb.g > 240 && postTextRgb.b > 240) {
            auditReport.issues.push({
              route: route.path,
              element: `"${postClickStyles.text}"`,
              reason: `Turns white on click! Text: ${postClickStyles.color}, Bg: ${postClickStyles.bg}`
            });
            console.error(`  [CLICK BUG] Button "${postClickStyles.text}" turns white after click!`);
          }
        }
      } catch (err) {
        // Continue if detached or moved
      }
    }

    console.log(`Completed interactions on ${route.name}: Tested ${testedClicksOnPage} safe clicks. Contrast Failures: ${pageContrastFailures}`);

    // Specific Page Assertions:
    if (route.name === 'Checkout') {
      const checkoutCheck = await page.evaluate(() => {
        const cardInput = document.querySelector('input[placeholder*="1234"]');
        const payBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Pay'));
        return {
          cardValue: cardInput ? cardInput.value : null,
          payBtnFound: !!payBtn,
          payBtnText: payBtn ? payBtn.innerText : null,
          payBtnBg: payBtn ? window.getComputedStyle(payBtn).backgroundColor : null,
          payBtnColor: payBtn ? window.getComputedStyle(payBtn).color : null
        };
      });
      console.log('  [CHECKOUT AUDIT]:', checkoutCheck);
      if (checkoutCheck.cardValue !== '') {
        console.warn('  [CHECKOUT WARNING]: Card input was expected to be empty, found:', checkoutCheck.cardValue);
      }
    }

    if (route.name === 'Quiz') {
      const quizCheck = await page.evaluate(() => {
        const circles = Array.from(document.querySelectorAll('button')).filter(b => /^[0-9]+$/.test(b.innerText.trim()));
        const questionText = document.querySelector('h2, h3')?.innerText || '';
        return {
          numberButtonsCount: circles.length,
          questionRendered: !!questionText
        };
      });
      console.log('  [QUIZ AUDIT]:', quizCheck);
    }
  }

  // Step 3: Viewport Responsive Check
  console.log('\n----------------------------------------------------');
  console.log('Testing Mobile Viewport (375x667)...');
  console.log('----------------------------------------------------');
  await page.setViewport({ width: 375, height: 667 });
  await page.goto(`${BASE_URL}/student/dashboard`, { waitUntil: 'networkidle0' });
  const mobileOverflowCount = await page.evaluate(() => {
    const docW = document.documentElement.clientWidth;
    return Array.from(document.querySelectorAll('*')).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.right > docW + 1 && el.scrollWidth > docW + 1;
    }).length;
  });
  console.log(`Mobile Dashboard Horizontal Overflow Elements: ${mobileOverflowCount} (Status: ${mobileOverflowCount === 0 ? 'PASS' : 'FAIL'})`);

  await browser.close();

  console.log('\n====================================================');
  console.log('QA AUDIT SUMMARY');
  console.log('====================================================');
  console.log(`Routes Audited:               ${auditReport.routesChecked} / ${ROUTES.length}`);
  console.log(`Total Interactive Elements:   ${auditReport.totalInteractiveElements}`);
  console.log(`Hovers Tested:                ${auditReport.totalHoversTested}`);
  console.log(`Clicks Tested:                ${auditReport.totalClicksTested}`);
  console.log(`Contrast Check Passed:        ${auditReport.contrastPassCount}`);
  console.log(`Contrast Check Failed:        ${auditReport.contrastFailCount}`);
  console.log(`Console Errors Discovered:    ${auditReport.consoleErrors.length}`);
  console.log(`Total Issues Discovered:      ${auditReport.issues.length}`);
  console.log('====================================================\n');

  if (auditReport.issues.length > 0) {
    console.log('Issues details:', JSON.stringify(auditReport.issues, null, 2));
  }
}

runAudit().catch(err => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
