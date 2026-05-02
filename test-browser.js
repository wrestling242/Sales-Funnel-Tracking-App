const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));
  
  await page.goto('http://localhost:3000');
  
  // Wait for the app to load
  await page.waitForSelector('button');
  
  // Find the AI Analyst button (contains BrainCircuit icon or text)
  // We'll just evaluate and click it
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const aiButton = buttons.find(b => b.textContent.includes('AI Analyst') || b.innerHTML.includes('lucide-brain-circuit'));
    if (aiButton) {
      console.log('Found AI Analyst button, clicking...');
      aiButton.click();
    } else {
      console.log('AI Analyst button not found');
    }
  });
  
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
