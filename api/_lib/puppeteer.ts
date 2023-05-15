import puppeteer from "puppeteer-core";
import chrome from "chrome-aws-lambda";

import type { Page } from "puppeteer-core";

let _page: Page | null;

async function getPage() {
  if (_page) return _page;

  const options = {
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
  };
  const browser = await puppeteer.launch(options);

  _page = await browser.newPage();

  return _page;
}

export async function getScreenshot({
  url,
  width = 1920,
  height = 1080,
}: {
  url: string;
  width?: number;
  height?: number;
}) {
  const page = await getPage();

  await page.goto(url);
  await page.setViewport({
    width: Number(width),
    height: Number(height),
    deviceScaleFactor: 2,
  });

  return page.screenshot();
}
