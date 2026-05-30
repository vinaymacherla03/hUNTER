import { chromium } from 'playwright';

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://www.aitacs.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for a second in case a loader appears
    await page.waitForTimeout(2000);

    const html = await page.evaluate(() => {
      // Find anything that feels like a loader
      const loaders = Array.from(document.querySelectorAll('*')).filter(el => {
        const cls = typeof el.className === 'string' ? el.className.toLowerCase() : '';
        const id = el.id ? el.id.toLowerCase() : '';
        return (cls.includes('load') || cls.includes('spin') || id.includes('load') || cls.includes('preloader') || id.includes('preloader'));
      });
      return loaders.map(el => el.outerHTML).slice(0, 5); // top 5
    });

    console.log(JSON.stringify(html, null, 2));
    await browser.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
