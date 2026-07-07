const { Given, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');

setDefaultTimeout(120 * 1000);

// Target URL (hard-coded to the review environment as required)
const REVIEW_URL = 'https://experienceleague-review.adobe.com/';

// ─────────────────────────────────────────────────────────────────────────────
// Given
// ─────────────────────────────────────────────────────────────────────────────
Given('user launches the Experience League review home page', async function () {
  if (!this.page) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();
    this.browser = browser;
    this.context = context;
    this.page = page;
  }
  await this.page.goto(REVIEW_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log(`✓ Navigated to Experience League review home page: ${REVIEW_URL}`);

  await this.page.waitForTimeout(5000);
  await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await this.page.waitForTimeout(2000);
  console.log('✓ Page fully loaded and scrolled to bottom');
});

// ─────────────────────────────────────────────────────────────────────────────
// Header steps
// ─────────────────────────────────────────────────────────────────────────────
Then('user collects all links present in the header navigation', async function () {
  this.headerLinks = await collectLinks(this.page, 'header');
  console.log(`✓ Collected ${this.headerLinks.length} link(s) from the header`);
  if (this.headerLinks.length === 0) {
    console.log('⚠️  No links found in the header — the header block may not have loaded yet.');
  }
});

Then('user checks each header link for a 404 response', async function () {
  console.log(`\n🔍 Checking ${this.headerLinks.length} header link(s) for 404 responses…`);
  this.header404Links = await checkLinksFor404(this.context, this.headerLinks);
});

Then('user reports all header links returning 404', async function () {
  await reportResults(this.page, this.header404Links, this.headerLinks, 'HEADER', 'screenshots/header-404-report.png');

});

// ─────────────────────────────────────────────────────────────────────────────
// Footer steps
// ─────────────────────────────────────────────────────────────────────────────
Then('user collects all links present in the footer', async function () {
  this.footerLinks = await collectLinks(this.page, 'footer');
  console.log(`✓ Collected ${this.footerLinks.length} link(s) from the footer`);
  if (this.footerLinks.length === 0) {
    console.log('⚠️  No links found in the footer — the footer block may not have loaded yet.');
  }
});

Then('user checks each footer link for a 404 response', async function () {
  console.log(`\n🔍 Checking ${this.footerLinks.length} footer link(s) for 404 responses…`);
  this.footer404Links = await checkLinksFor404(this.context, this.footerLinks);
});

Then('user reports all footer links returning 404', async function () {
  await reportResults(this.page, this.footer404Links, this.footerLinks, 'FOOTER', 'screenshots/footer-404-report.png');

});

// ─────────────────────────────────────────────────────────────────────────────
// Helper: collect all <a href> links from a given section ('header' | 'footer')
// ─────────────────────────────────────────────────────────────────────────────
async function collectLinks(page, section) {
  // Try progressively broader selectors to cover all known EL header/footer markup variations
  const selectorSets = {
    header: [
      'header nav a',
      'header a',
      '[data-block-name="gnav"] a',
      '.gnav a',
      '.global-navigation a',
      'div[class*="header"] a',
    ],
    footer: [
      'footer a',
      '[data-block-name="footer"] a',
      '.footer a',
      'div[class*="footer"] a',
    ],
  };

  const selectors = selectorSets[section] || [];
  let rawLinks = [];

  for (const sel of selectors) {
    const count = await page.locator(sel).count();
    if (count > 0) {
      rawLinks = await page.locator(sel).evaluateAll((anchors) =>
        anchors.map((a) => ({
          label: (a.innerText || a.getAttribute('aria-label') || a.getAttribute('title') || '').trim(),
          href: a.getAttribute('href') || '',
        }))
      );
      console.log(`ℹ️  Using selector "${sel}" — found ${rawLinks.length} raw link(s)`);
      break;
    }
  }

  // Normalise, deduplicate and filter out non-navigable hrefs
  const seen = new Set();
  const links = [];

  for (const { label, href } of rawLinks) {
    const normalised = normaliseUrl(href);
    if (!normalised) continue;           // skip empty / mailto / tel / javascript
    if (seen.has(normalised)) continue;  // skip duplicates
    seen.add(normalised);
    links.push({ label: label || '(no label)', href: normalised });
  }

  return links;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: resolve a raw href to an absolute URL (or null if not checkable)
// ─────────────────────────────────────────────────────────────────────────────
function normaliseUrl(href) {
  if (!href) return null;
  const trimmed = href.trim();
  if (
    trimmed === '#' ||
    trimmed === '/' ||
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('#')
  ) {
    return null;
  }
  try {
    // Relative URLs → absolute using REVIEW_URL as the base
    const url = new URL(trimmed, REVIEW_URL);
    return url.href;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: check each link by sending an HTTP GET and recording 404s
// Uses a fresh Playwright page (not the main tab) so the UI is undisturbed.
// ─────────────────────────────────────────────────────────────────────────────
async function checkLinksFor404(context, links) {
  const brokenLinks = [];
  let checked = 0;

  for (const { label, href } of links) {
    checked++;
    process.stdout.write(`  [${checked}/${links.length}] ${href} … `);

    let statusCode = null;
    let errorMsg = null;

    try {
      const checkPage = await context.newPage();
      const response = await checkPage.goto(href, {
        waitUntil: 'commit',   // just wait for the HTTP response headers
        timeout: 30000,
      });
      statusCode = response ? response.status() : null;
      await checkPage.close();
    } catch (err) {
      errorMsg = err.message.split('\n')[0]; // first line only
    }

    if (statusCode === 404) {
      process.stdout.write(`❌ 404\n`);
      brokenLinks.push({ label, href, status: 404 });
    } else if (errorMsg) {
      process.stdout.write(`⚠️  ERROR (${errorMsg})\n`);
      brokenLinks.push({ label, href, status: `ERROR: ${errorMsg}` });
    } else {
      process.stdout.write(`✓ ${statusCode}\n`);
    }
  }

  return brokenLinks;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: print a structured report and save a screenshot
// ─────────────────────────────────────────────────────────────────────────────
async function reportResults(page, brokenLinks, allLinks, sectionLabel, screenshotPath) {
  const divider = '═'.repeat(72);
  console.log(`\n${divider}`);
  console.log(`  ${sectionLabel} LINK 404 REPORT`);
  console.log(divider);
  console.log(`  Total links checked : ${allLinks.length}`);
  console.log(`  Broken (404/error)  : ${brokenLinks.length}`);
  console.log(divider);

  if (brokenLinks.length === 0) {
    console.log('  ✅  No 404 or broken links found in the ' + sectionLabel.toLowerCase() + '.');
  } else {
    console.log('  ❌  The following links are broken:\n');
    brokenLinks.forEach(({ label, href, status }, idx) => {
      console.log(`  ${idx + 1}. Label  : ${label}`);
      console.log(`     URL    : ${href}`);
      console.log(`     Status : ${status}`);
      console.log('');
    });
  }
  console.log(`${divider}\n`);

  // Save screenshot of the current page state for the report
  try {
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✓ Screenshot saved as ${screenshotPath}`);
  } catch (err) {
    console.log(`ℹ️  Could not save screenshot: ${err.message}`);
  }
}
