const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // Set viewport to a wide resolution
  await page.setViewport({ width: 1920, height: 1080 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  console.log("Navigating to localhost:3000...");
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  console.log("Taking initial screenshot...");
  await page.screenshot({ path: 'debug_start.png' });
  
  // Wait for onboarding form to load
  try {
    await page.waitForSelector('input[type="date"]', { timeout: 5000 });
    console.log("Filling form...");
    await page.type('input[type="date"]', '2000-01-01');
    const numberInputs = await page.$$('input[type="number"]');
    await numberInputs[0].type('150');
    await numberInputs[1].type('68');
    await page.click('button[type="submit"]');
    
    console.log("Form submitted. Waiting for cockpit to load...");
    await new Promise(r => setTimeout(r, 4000));
    
    await page.screenshot({ path: 'debug_cockpit.png' });
    
    console.log("Looking for LAUNCH text in DOM...");
    // Find an element containing "LAUNCH" and click it
    const launchClicked = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('div'));
      for (const el of elements) {
        if (el.textContent === 'LAUNCH') {
          el.click();
          return true;
        }
      }
      return false;
    });
    
    if (launchClicked) {
      console.log("Launch clicked! Waiting 3 seconds for altitude to increase...");
      await new Promise(r => setTimeout(r, 3000));
      await page.screenshot({ path: 'debug_glitch.png' });
    } else {
      console.log("Could not find LAUNCH button.");
    }
    
  } catch (err) {
    console.error("Error during interaction:", err);
  }
  
  await browser.close();
  console.log("Done.");
})();
