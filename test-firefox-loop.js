const { firefox } = require('playwright');

(async () => {
  const browser = await firefox.launch({ headless: true });
  const page = await browser.newPage();
  
  let getCount = 0;
  const urlCounts = {};
  
  const fs = require('fs');
  const logFile = 'firefox-loop.log';
  fs.writeFileSync(logFile, ''); // clear log
  
  page.on('response', response => {
    if (response.url().includes('localhost:3000')) {
      fs.appendFileSync(logFile, `[Response] ${response.status()} - ${response.url()} (${response.request().resourceType()})\n`);
      if (response.request().method() === 'GET') {
        getCount++;
        const url = response.url();
        urlCounts[url] = (urlCounts[url] || 0) + 1;
      }
    }
  });

  page.on('console', msg => {
    fs.appendFileSync(logFile, `[Console ${msg.type()}] ${msg.text()}\n`);
  });

  page.on('pageerror', err => {
    fs.appendFileSync(logFile, `[Page Error] ${err.message}\n`);
  });

  console.log("Navigating to product page in Firefox...");
  await page.goto('http://localhost:3000/product/fe8ba9fe-e34f-4aef-9281-c03f1e632afc');
  
  console.log("Waiting 5 seconds to observe if reload loop occurs...");
  await page.waitForTimeout(5000);
  
  console.log(`\nTest completed. Total GET requests to localhost observed: ${getCount}`);
  console.log("Top requested URLs:");
  Object.entries(urlCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([url, count]) => console.log(`${count}x: ${url}`));

  if (getCount > 100) {
    console.log("Warning: High number of requests detected, possible loop.");
  } else {
    console.log("Success: Request count is normal, no loop detected in Firefox.");
  }

  await browser.close();
})();
