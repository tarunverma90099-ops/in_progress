/**
 * Responsive + accessibility audit for the landing page.
 *
 * Checks for horizontal overflow at every breakpoint, undersized tap targets,
 * unnamed interactive elements, heading structure and duplicate ids, then
 * captures viewport screenshots of key sections and the mobile nav.
 *
 *   npm run audit:responsive -- http://localhost:3100
 */
import { mkdir } from "node:fs/promises";
import { launchBrowser, settlePage } from "./browser.mjs";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const outDir = "screenshots/responsive";

const BREAKPOINTS = [
  { name: "xs-320", width: 320, height: 720 },
  { name: "sm-390", width: 390, height: 844 },
  { name: "md-768", width: 768, height: 1024 },
  { name: "lg-1024", width: 1024, height: 768 },
  { name: "xl-1440", width: 1440, height: 900 },
  { name: "2xl-1920", width: 1920, height: 1080 },
];

await mkdir(outDir, { recursive: true });
const browser = await launchBrowser();

const report = [];

for (const breakpoint of BREAKPOINTS) {
  const page = await browser.newPage();
  await page.setViewport({ width: breakpoint.width, height: breakpoint.height });
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle0", timeout: 60_000 });
  await settlePage(page);

  const result = await page.evaluate(() => {
    const viewportWidth = window.innerWidth;

    // --- horizontal overflow ------------------------------------------------
    // Nodes inside a clipping ancestor (decorative glow blobs, the marquee
    // track) are expected to extend past the viewport without causing scroll.
    const hasClippingAncestor = (node) => {
      let parent = node.parentElement;
      while (parent && parent !== document.body) {
        const overflow = getComputedStyle(parent).overflowX;
        if (["hidden", "clip", "auto", "scroll"].includes(overflow)) return true;
        parent = parent.parentElement;
      }
      return false;
    };

    const overflowing = [];
    for (const node of document.querySelectorAll("body *")) {
      const rect = node.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      if (node.closest(".sr-only")) continue;
      if (rect.right <= viewportWidth + 1.5 && rect.left >= -1.5) continue;
      if (getComputedStyle(node).position === "fixed") continue;
      if (hasClippingAncestor(node)) continue;
      overflowing.push({
        tag: node.tagName.toLowerCase(),
        cls: (node.className || "").toString().slice(0, 70),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
      });
    }

    // --- tap targets --------------------------------------------------------
    const smallTargets = [];
    for (const node of document.querySelectorAll("a[href], button, input, select, [role='tab']")) {
      const rect = node.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      if (node.closest(".sr-only")) continue;
      // WCAG 2.2 target size (minimum): 24x24 CSS px. The skip link is a
      // visually-hidden affordance, so it is measured only when focused.
      if (rect.height < 24 || rect.width < 24) {
        smallTargets.push({
          tag: node.tagName.toLowerCase(),
          text: (node.textContent || "").trim().slice(0, 34),
          h: Math.round(rect.height),
          w: Math.round(rect.width),
        });
      }
    }

    // --- accessible names ---------------------------------------------------
    const unnamed = [];
    for (const node of document.querySelectorAll("a[href], button, [role='tab']")) {
      const name =
        node.getAttribute("aria-label") ||
        (node.textContent || "").trim() ||
        node.querySelector("img")?.getAttribute("alt");
      if (!name) unnamed.push(node.outerHTML.slice(0, 90));
    }

    // --- structure ----------------------------------------------------------
    const ids = [...document.querySelectorAll("[id]")].map((n) => n.id);
    const duplicateIds = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
    const headings = [...document.querySelectorAll("h1,h2,h3,h4")].map((h) =>
      Number(h.tagName[1]),
    );
    const headingJumps = [];
    for (let i = 1; i < headings.length; i += 1) {
      if (headings[i] - headings[i - 1] > 1) {
        headingJumps.push(`${headings[i - 1]} → ${headings[i]}`);
      }
    }

    return {
      viewportWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      overflowing: overflowing.slice(0, 8),
      overflowCount: overflowing.length,
      smallTargets: smallTargets.slice(0, 8),
      smallTargetCount: smallTargets.length,
      unnamed,
      duplicateIds,
      headingJumps: [...new Set(headingJumps)],
      h1Count: headings.filter((h) => h === 1).length,
    };
  });

  report.push({ breakpoint: breakpoint.name, ...result });

  // Key-section viewport screenshots at mobile and tablet widths.
  if (["sm-390", "md-768"].includes(breakpoint.name)) {
    for (const id of ["features", "product", "audiences", "customers", "faq", "get-started"]) {
      await page.evaluate((sectionId) => {
        const node = document.getElementById(sectionId);
        if (node) window.scrollTo(0, node.offsetTop - 12);
      }, id);
      await new Promise((resolve) => setTimeout(resolve, 700));
      await page.screenshot({ path: `${outDir}/${breakpoint.name}-${id}.png` });
    }
  }

  // Mobile nav drawer (open state).
  if (breakpoint.name === "sm-390") {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.click('button[aria-controls="mobile-nav"]');
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page.screenshot({ path: `${outDir}/sm-390-nav-open.png` });
  }

  await page.close();
}

await browser.close();

console.log(JSON.stringify(report, null, 2));
