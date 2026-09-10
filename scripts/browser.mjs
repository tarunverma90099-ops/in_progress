/**
 * Shared headless-browser launcher for the design-QA scripts.
 *
 * Resolution order:
 *   1. CHROME_PATH — point this at any local Chrome/Chromium build.
 *   2. @sparticuz/chromium — a Chromium build shipped as an npm package, which
 *      works in sandboxes where the browser CDNs (storage.googleapis.com,
 *      cdn.playwright.dev) are unreachable. It bundles the NSS/NSPR libraries
 *      that minimal Linux images miss, so we extract them once and prepend the
 *      directory to the loader path before spawning.
 *
 * The scripts are optional developer tooling — `npm run build`, `npm run lint`
 * and `npm test` never touch them.
 */
import { existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const LIB_DIR = join(tmpdir(), "track-attend-chromium-libs");

async function resolveExecutable() {
  if (process.env.CHROME_PATH) {
    return { executablePath: process.env.CHROME_PATH, args: [] };
  }

  let chromium;
  try {
    chromium = (await import("@sparticuz/chromium")).default;
  } catch {
    throw new Error(
      "No browser available. Set CHROME_PATH, or install the optional helper:\n" +
        "  npm i -D @sparticuz/chromium puppeteer-core",
    );
  }

  chromium.setGraphicsMode = false;

  // Unpack the bundled libraries alongside the binary (idempotent).
  if (!existsSync(join(LIB_DIR, "libnspr4.so"))) {
    // `/bin` is not an exported subpath, so resolve the package root instead.
    const chromiumRoot = join(
      dirname(fileURLToPath(import.meta.resolve("@sparticuz/chromium"))),
      "..",
    );
    const archive = join(chromiumRoot, "bin", "al2023.tar.br");

    execFileSync(
      "node",
      [
        "-e",
        `
        const fs = require("fs");
        const zlib = require("zlib");
        const tar = zlib.brotliDecompressSync(fs.readFileSync(process.argv[1]));
        fs.writeFileSync(process.argv[2], tar);
        `,
        archive,
        join(tmpdir(), "al2023.tar"),
      ],
      { stdio: "inherit" },
    );
    mkdirSync(LIB_DIR, { recursive: true });
    execFileSync("tar", ["-xf", join(tmpdir(), "al2023.tar"), "-C", LIB_DIR], {
      stdio: "inherit",
    });
  }

  process.env.LD_LIBRARY_PATH = [join(LIB_DIR, "lib"), process.env.LD_LIBRARY_PATH]
    .filter(Boolean)
    .join(":");

  return {
    executablePath: await chromium.executablePath(),
    args: chromium.args,
  };
}

/** Launches Chromium and returns a `puppeteer-core` browser instance. */
export async function launchBrowser() {
  const puppeteer = (await import("puppeteer-core")).default;
  const { executablePath, args } = await resolveExecutable();

  return puppeteer.launch({
    executablePath,
    args: [...args, "--no-sandbox", "--disable-dev-shm-usage"],
    headless: true,
  });
}

/**
 * Scrolls the whole page so IntersectionObserver-driven reveals fire, then
 * returns to the top. `scroll-behavior: smooth` is disabled first, otherwise
 * the sweep lags several screens behind the loop.
 */
export async function settlePage(page, pause = 60) {
  await page.evaluate(async (delay) => {
    document.documentElement.style.scrollBehavior = "auto";
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 300));
  }, pause);
}
