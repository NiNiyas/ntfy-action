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
  core.info("Capturing screenshot...");
  const browser = await playwright.chromium.launch({
    executablePath: "/usr/bin/google-chrome",
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(URL);
  await page.screenshot({
    path: "/tmp/screenshot.png",
    fullPage: true
    
  });
  core.info("Screenshot captured successfully!");
  await browser.close();
}

async function getJobID(REPOSITORY, RUN_ID) {
  const jobUrl = `https://api.github.com/repos/${REPOSITORY}/actions/runs/${RUN_ID}/jobs`;
  const isSiteReachable = await checkSiteReachable(jobUrl);
  if (!isSiteReachable) {
    core.warning(
      "Fetching job id failed. Please ensure that the repository is not private."
    );
    return null;
  }
  try {
    const response = await axios.get(jobUrl, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });
    const {jobs} = response.data;
    if (jobs.length > 0) {
      return jobs[0].id;
    } else {
      return null;
    }
  } catch (error) {
    core.error(error);
    return null;
  }
}

async function checkSiteReachable(URL) {
  try {
    const response = await axios.head(URL);
    return response.status === 200;
  } catch (error) {
    core.error(error);
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

    core.info("Uploading image to uguu.se...");
    const response = await axios.post(siteUrl, formData, {
      headers: formData.getHeaders(),
    });

    if (response.data.success) {
      return response.data.files[0];
    } else {
      return null;
    }
  } catch (error) {
    core.error(error);
  }
}

module.exports = {
  screenshot,
  uploadFile,
  getJobID,
};
