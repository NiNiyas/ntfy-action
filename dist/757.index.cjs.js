"use strict";
exports.id = 757;
exports.ids = [757];
exports.modules = {

/***/ 11757:
/***/ ((__unused_webpack___webpack_module__, __unused_webpack___webpack_exports__, __webpack_require__) => {


// EXTERNAL MODULE: ./node_modules/@actions/core/lib/core.js + 14 modules
var core = __webpack_require__(13078);
// EXTERNAL MODULE: ./node_modules/axios/lib/axios.js + 56 modules
var axios = __webpack_require__(82236);
// EXTERNAL MODULE: ./node_modules/@actions/github/lib/github.js + 21 modules
var github = __webpack_require__(50157);
// EXTERNAL MODULE: ./node_modules/playwright/index.mjs + 1 modules
var playwright = __webpack_require__(45784);
// EXTERNAL MODULE: external "node:fs"
var external_node_fs_ = __webpack_require__(73024);
// EXTERNAL MODULE: external "node:path"
var external_node_path_ = __webpack_require__(76760);
// EXTERNAL MODULE: ./node_modules/form-data/lib/form_data.js
var form_data = __webpack_require__(96454);
;// CONCATENATED MODULE: ./src/screenshot.mjs







async function screenshot(URL) {
  const isSiteReachable = await checkSiteReachable(URL);
  if (!isSiteReachable) {
    core/* warning */.$e(
      "The specified site is not reachable. Please ensure that the repository is not private."
    );
    return null;
  }
  core/* info */.pq("Capturing screenshot...");
  const browser = await playwright/* chromium */.B0.launch({
    executablePath: "/usr/bin/google-chrome",
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(URL);
  await page.screenshot({
    path: "/tmp/screenshot.png",
    fullPage: true
    
  });
  core/* info */.pq("Screenshot captured successfully!");
  await browser.close();
}

async function getJobID(REPOSITORY, RUN_ID) {
  const jobUrl = `https://api.github.com/repos/${REPOSITORY}/actions/runs/${RUN_ID}/jobs`;
  const isSiteReachable = await checkSiteReachable(jobUrl);
  if (!isSiteReachable) {
    core/* warning */.$e(
      "Fetching job id failed. Please ensure that the repository is not private."
    );
    return null;
  }
  try {
    const response = await axios/* default */.A.get(jobUrl, {
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
    core/* error */.z3(error);
    return null;
  }
}

async function checkSiteReachable(URL) {
  try {
    const response = await axios/* default */.A.head(URL);
    return response.status === 200;
  } catch (error) {
    core/* error */.z3(error);
    return false;
  }
}

async function uploadFile(filePath) {
  try {
    const fileStream = external_node_fs_.createReadStream(filePath);
    const formData = new form_data();
    formData.append("files[]", fileStream, external_node_path_.basename(filePath));

    const siteUrl = "https://uguu.se/upload";
    const isSiteReachable = await checkSiteReachable("https://uguu.se");
    if (!isSiteReachable) {
      core/* warning */.$e("uguu.se is not reachable.");
      return null;
    }

    core/* info */.pq("Uploading image to uguu.se...");
    const response = await axios/* default */.A.post(siteUrl, formData, {
      headers: formData.getHeaders(),
    });

    if (response.data.success) {
      return response.data.files[0];
    } else {
      return null;
    }
  } catch (error) {
    core/* error */.z3(error);
  }
}



;// CONCATENATED MODULE: ./src/index.mjs





async function githubmessage() {
    const context = github/* context */._;
    const payload = context.payload;
    let action_buttons;
    let message;

    switch (context.eventName) {
        case "push":
            action_buttons = [{
                    action: "view",
                    label: "Compare",
                    url: payload.compare,
                    clear: true,
                },
                {
                    action: "view",
                    label: "View Commit",
                    url: payload.head_commit.url,
                    clear: true,
                },
                {
                    action: "view",
                    label: "Visit Repository",
                    url: payload.repository.html_url,
                    clear: true,
                },
            ];

            message =
                `${payload.head_commit.committer.name} has pushed ${context.sha.slice(
          -7
        )} to ${payload.repository.full_name}.\n\n` +
                `Author: ${payload.head_commit.author.username}\n` +
                `Committer: ${payload.head_commit.committer.name}\n` +
                `Ref: ${context.ref}\n` +
                `Pushed by: ${payload.pusher.name}\n` +
                `Workflow Job Name: ${context.job}\n` +
                `Workflow Name: ${context.workflow}\n\n` +
                `Commit Message\n${payload.head_commit.message}`;

            return [action_buttons, message];

        case "release":
            action_buttons = [{
                    action: "view",
                    label: "Release URL",
                    url: payload.release.html_url,
                    clear: true,
                },
                {
                    action: "view",
                    label: "Download Tar",
                    url: payload.release.tarball_url,
                    clear: true,
                },
                {
                    action: "view",
                    label: "Download Zip",
                    url: payload.release.zipball_url,
                    clear: true,
                },
            ];

            message =
                `${payload.release.author.login} has ${payload.action} ${payload.release.tag_name} on ${payload.repository.full_name}.\n\n` +
                `Repo: ${payload.repository.html_url}\n` +
                `Name: ${payload.release.name}\n` +
                `Author: ${payload.release.author.login}\n` +
                `Prerelease: ${payload.release.prerelease}\n` +
                `Workflow Job Name: ${context.job}\n` +
                `Workflow Name: ${context.workflow}\n\n` +
                `Release Message\n${payload.release.body}`;

            return [action_buttons, message];

        case "schedule":
            action_buttons = [{
                    action: "view",
                    label: "Visit Repository",
                    url: `https://github.com/${process.env.GITHUB_REPOSITORY}`,
                    clear: true,
                },
                {
                    action: "view",
                    label: "View Run",
                    url: `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
                    clear: true,
                },
            ];

            message =
                `Scheduled task '${context.job}' has been executed in ${process.env.GITHUB_REPOSITORY}.\n\n` +
                `Workflow Name: ${context.workflow}\n` +
                `Cron: ${payload.schedule}`;

            return [action_buttons, message];

        default:
            action_buttons = [{
                    action: "view",
                    label: "Visit Repo",
                    url: payload.repository.html_url,
                    clear: true,
                },
                {
                    action: "view",
                    label: "View Run",
                    url: `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
                    clear: true,
                },
            ];

            message =
                `Workflow '${context.workflow}' has been executed in ${payload.repository.full_name}\n\n` +
                `Repository: ${payload.repository.full_name}\n` +
                `Workflow Job Name: ${context.job}\n` +
                `Event Name: ${context.eventName}`;

            return [action_buttons, message];
    }
}

async function run() {
    try {
        let message = await githubmessage();

        const ntfy_url = core/* getInput */.V4("url");
        const headers = JSON.parse(core/* getInput */.V4("headers") || "{}");
        const tags = core/* getInput */.V4("tags").split(",");
        const topic = core/* getInput */.V4("topic");
        const title = core/* getInput */.V4("title") || "GitHub Actions";
        const details = core/* getInput */.V4("details");
        const priority = core/* getInput */.V4("priority") || 3;
        const icon = core/* getInput */.V4("icon");
        const image = core/* getInput */.V4("image");
        const actionsInput = core/* getInput */.V4("actions");
        let actions;

        if (actionsInput === "default") {
            actions = message[0];
        } else if (actionsInput !== "" && actionsInput !== "disabled") {
            try {
                actions = JSON.parse(actionsInput);
            } catch (error) {
                core/* warning */.$e("Invalid input for 'actions'. Using default actions.");
                core/* warning */.$e(`Error: ${error.message}`);
                actions = message[0];
            }
        } else {
            actions = [];
        }

        let ImageEnabled = image === "true";
        if (image !== "true" && image !== "false" && image !== "") {
            core/* warning */.$e("Invalid input for 'image'");
        }

        const Payload = {
            topic: topic,
            tags: tags,
            actions: actions,
            title: title,
            icon: icon,
            message: message[1] + "\n\n" + details,
        };

        if (ImageEnabled) {
            const jobId = await getJobID(
                process.env.GITHUB_REPOSITORY,
                process.env.GITHUB_RUN_ID
            );
            if (jobId) {
                await screenshot(
                    `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}/job/${jobId}`
                );

                const uploadResult = await uploadFile("/tmp/screenshot.png");

                if (uploadResult && uploadResult.filename && uploadResult.url) {
                    const {
                        filename,
                        url
                    } = uploadResult;
                    Payload.attach = url;
                    Payload.filename = filename;
                }
            }
        }

        core/* info */.pq(`Connecting to endpoint (${ntfy_url}) ...`);

        const response = await axios/* default */.A.post(ntfy_url, Payload, {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0",
                Priority: priority,
                ...headers,
            },
        });

        core/* setOutput */.uH("response", {
            statusCode: response.status,
        });
    } catch (error) {
        if (error.response) {
            core/* error */.z3(`Request failed with status ${error.response.status}: ${error.response.statusText}`);
            core/* error */.z3(`Response body: ${JSON.stringify(error.response.data)}`);
        } else {
            core/* error */.z3(`Unknown error: ${error.message}`);
        }
        core/* setFailed */.C1(error.message);
    }
}

run();

/***/ })

};
;
//# sourceMappingURL=757.index.cjs.js.map