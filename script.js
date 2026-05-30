// script.js
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.aitacs.com/', { waitUntil: 'networkidle' });
  
  // Try to find the loading indicator
  // Usually it has a low z-index or a class with loader/loading/etc.
  const html = await page.evaluate(() => {
    // Just grab all HTML and we'll look for keywords. Or better, just grab something that looks like a loader.
    const loaderElements = Array.from(document.querySelectorAll('*')).filter(el => {
      const cls = el.className;
      return typeof cls === 'string' && (cls.toLowerCase().includes('load') || cls.toLowerCase().includes('spin'));
    });
    return loaderElements.map(el => el.outerHTML);
  });

  console.log(JSON.stringify(html, null, 2));
  await browser.close();
})();
