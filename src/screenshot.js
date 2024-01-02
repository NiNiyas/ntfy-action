const playwright = require("playwright");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");
const core = require("@actions/core");

async function screenshot(URL) {
  const isSiteReachable = await checkSiteReachable(URL);
  if (!isSiteReachable) {
    core.warning(
      "The specified site is not reachable. Please ensure that the repository is not private."
    );
    return null;
  }
  core.info("Screengrabbing...");
  const browser = await playwright.chromium.launch({
    executablePath: "/usr/bin/google-chrome",
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(URL);
  await page.screenshot({
    path: "/tmp/screenshot.png",
  });
  await browser.close();
}

async function checkSiteReachable(URL) {
  try {
    const response = await axios.head(URL);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function uploadFile(filePath) {
  try {
    const fileStream = fs.createReadStream(filePath);
    const formData = new FormData();
    formData.append("files[]", fileStream, path.basename(filePath));

    const siteUrl = "https://uguu.se/upload";
    const isSiteReachable = await checkSiteReachable("https://uguu.se");
    if (!isSiteReachable) {
      core.warning("uguu.se is not reachable.");
      return null;
    }

    const response = await axios.post(siteUrl, formData, {
      headers: formData.getHeaders(),
    });

    if (response.data.success) {
      const { filename, url } = response.data.files[0];
      return { filename, url };
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

module.exports = {
  screenshot,
  uploadFile,
};
