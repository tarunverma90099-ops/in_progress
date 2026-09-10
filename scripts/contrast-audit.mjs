/**
 * Automated WCAG AA contrast pass.
 *
 * Tailwind v4 defines its palette in `oklch()`, so computed colours come back
 * as `lab()`/`oklab()` strings that a hand-rolled parser gets wrong. Instead we
 * let the browser do the conversion: each computed colour is painted onto a
 * 1x1 canvas and read back as sRGB bytes.
 *
 * Elements that sit on a gradient/image background are reported separately —
 * they cannot be resolved from computed styles and need a human glance.
 *
 *   npm run audit:contrast -- http://localhost:3100 "/,/login,/college"
 */
import { launchBrowser, settlePage } from "./browser.mjs";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const paths = (process.argv[3] ?? "/,/design-system,/login,/register").split(",");

const browser = await launchBrowser();
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const summarize = (label, items, limit = 12) => {
  console.log(`\n=== ${label} — ${items.length} item(s)`);
  for (const item of items.slice(0, limit)) {
    console.log(
      `  ${String(item.ratio).padStart(5)} (needs ${item.threshold}) ${item.fontSize}px  ` +
        `"${item.text}"  ${item.cls}`,
    );
  }
  if (items.length > limit) console.log(`  … ${items.length - limit} more`);
};

for (const path of paths) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle0", timeout: 60_000 });
  await settlePage(page);

  const { issues, gradientCases, checked } = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const cache = new Map();

    /** Converts any CSS colour string to sRGB bytes using the browser. */
    const toRgba = (color) => {
      if (cache.has(color)) return cache.get(color);
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "#000";
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const data = ctx.getImageData(0, 0, 1, 1).data;
      const value = { r: data[0], g: data[1], b: data[2], a: data[3] / 255 };
      cache.set(color, value);
      return value;
    };

    const channel = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const luminance = ({ r, g, b }) =>
      0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    const ratio = (fg, bg) => {
      const l1 = luminance(fg);
      const l2 = luminance(bg);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };
    const blend = (fg, bg) => ({
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a),
      a: 1,
    });

    /** Nearest painted ancestor background, compositing translucency. */
    const resolveBackground = (node) => {
      const layers = [];
      let current = node;
      let blockedByGradient = false;
      while (current && current !== document.documentElement) {
        const style = getComputedStyle(current);
        if (style.backgroundImage !== "none") blockedByGradient = true;
        const parsed = toRgba(style.backgroundColor);
        if (parsed.a > 0) {
          layers.push(parsed);
          if (parsed.a === 1) break;
        }
        current = current.parentElement;
      }
      let result = { r: 255, g: 255, b: 255, a: 1 };
      for (const layer of layers.reverse()) result = blend(layer, result);
      return { background: result, blockedByGradient };
    };

    const issues = [];
    const gradientCases = [];
    let checked = 0;

    for (const node of document.querySelectorAll("body *")) {
      if (node.closest("script, style, noscript, svg, canvas")) continue;
      // Decorative product mocks are exposed to assistive tech as one labelled
      // image (role="img"), so their 8–10px chrome labels are not real copy.
      if (node.closest('[role="img"]')) continue;
      // Visually-hidden text (sr-only) is never painted for sighted users.
      if (node.closest(".sr-only")) continue;

      const text = [...node.childNodes]
        .filter((child) => child.nodeType === 3)
        .map((child) => child.textContent.trim())
        .filter(Boolean)
        .join(" ")
        .trim();
      if (text.length < 2) continue;

      const style = getComputedStyle(node);
      if (style.visibility === "hidden" || style.display === "none") continue;
      if (Number(style.opacity) < 0.5) continue;
      // Gradient-clipped text has no single colour to measure.
      if (style.webkitTextFillColor === "rgba(0, 0, 0, 0)") continue;

      const rect = node.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      const { background, blockedByGradient } = resolveBackground(node);
      const fgRaw = toRgba(style.color);
      const fg = fgRaw.a < 1 ? blend(fgRaw, background) : fgRaw;
      const value = ratio(fg, background);

      const fontSize = parseFloat(style.fontSize);
      const weight = Number(style.fontWeight) || 400;
      const isLarge = fontSize >= 24 || (fontSize >= 18.66 && weight >= 700);
      const threshold = isLarge ? 3 : 4.5;

      checked += 1;
      const record = {
        text: text.slice(0, 40),
        ratio: Number(value.toFixed(2)),
        threshold,
        fontSize: Math.round(fontSize),
        color: style.color,
        cls: (node.className || "").toString().slice(0, 52),
      };

      if (blockedByGradient) {
        if (value < threshold) gradientCases.push(record);
      } else if (value < threshold) {
        issues.push(record);
      }
    }

    return { issues, gradientCases, checked };
  });

  summarize(`${path} · solid backgrounds (${checked} text nodes checked)`, issues);
  if (gradientCases.length) {
    summarize(`${path} · over gradients/images`, gradientCases, 8);
  }
}

await browser.close();
