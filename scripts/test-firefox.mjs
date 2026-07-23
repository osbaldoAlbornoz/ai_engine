import { firefox } from 'playwright';

(async () => {
  console.log('Launching Firefox...');
  const browser = await firefox.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  let reloadCount = 0;

  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) {
      reloadCount++;
      console.log(`Navigated to ${frame.url()} (Load #${reloadCount})`);
    }
  });

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  console.log('Visiting URL...');
  await page.goto('http://127.0.0.1:3000/compare/asus-sff-ready-rtx-5060-vs-xfx-swift-oc-white-rx-9060-xt');

  console.log('Waiting 10 seconds to observe behavior...');
  await new Promise(r => setTimeout(r, 10000));

  console.log(`Total reloads observed: ${reloadCount}`);

  await browser.close();
})();
