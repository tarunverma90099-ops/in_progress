/**
 * Design-review helper: renders the marketing surface with headless Chromium
 * and writes PNGs to `screenshots/` (git-ignored).
 *
 *   npm run screenshots            # against http://localhost:3000
 *   npm run screenshots -- http://localhost:3100
 */
import { mkdir, writeFile } from "node:fs/promises";
import { launchBrowser, settlePage } from "./browser.mjs";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const outputDir = "screenshots";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, deviceScaleFactor: 1 },
  { name: "mobile", width: 390, height: 844, deviceScaleFactor: 2 },
];

const PAGES = [
  { name: "landing", path: "/" },
  { name: "design-system", path: "/design-system" },
  { name: "login", path: "/login" },
];

await mkdir(outputDir, { recursive: true });

const browser = await launchBrowser();
const messages = [];

for (const viewport of VIEWPORTS) {
  const page = await browser.newPage();
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      messages.push(`[${viewport.name}] ${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    messages.push(`[${viewport.name}] pageerror: ${error.message}`);
  });

  await page.setViewport({
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.deviceScaleFactor,
  });

  for (const target of PAGES) {
    await page.goto(`${baseUrl}${target.path}`, {
      waitUntil: "networkidle0",
      timeout: 60_000,
    });
    await settlePage(page, 90);

    await page.screenshot({
      path: `${outputDir}/${target.name}-${viewport.name}.png`,
      fullPage: viewport.name === "desktop",
    });

    if (target.name === "landing") {
      // Footer shot: the bottom of the page is easy to forget in review.
      const footer = await page.$("footer");
      const footerBox = footer ? await footer.boundingBox() : null;
      if (footerBox) {
        await page.screenshot({
          path: `${outputDir}/landing-footer-${viewport.name}.png`,
          clip: {
            x: 0,
            y: Math.max(footerBox.y, 0),
            width: viewport.width,
            height: Math.min(footerBox.height, 2000),
          },
          captureBeyondViewport: true,
        });
      }

      // One shot per section, so a review can happen block by block.
      if (viewport.name === "desktop") {
        const sections = await page.$$("section");
        for (let index = 0; index < sections.length; index += 1) {
          const box = await sections[index].boundingBox();
          if (!box) continue;
          await page.screenshot({
            path: `${outputDir}/landing-section-${String(index).padStart(2, "0")}.png`,
            clip: {
              x: 0,
              y: Math.max(box.y, 0),
              width: viewport.width,
              height: Math.min(box.height, 2400),
            },
            captureBeyondViewport: true,
          });
        }
      }
    }
  }

  await page.close();
}

await browser.close();

if (messages.length > 0) {
  await writeFile(`${outputDir}/console-log.txt`, messages.join("\n"), "utf8");
  console.log(`\n${messages.length} console message(s):\n` + messages.slice(0, 30).join("\n"));
} else {
  console.log("\nno console errors or warnings");
}
