const core = require("@actions/core");
const axios = require("axios");
const github = require("@actions/github");
const {
    screenshot,
    uploadFile,
    getJobID
} = require("./screenshot");

async function githubmessage() {
    const context = github.context;
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

        const ntfy_url = core.getInput("url");
        const headers = JSON.parse(core.getInput("headers") || "{}");
        const tags = core.getInput("tags").split(",");
        const topic = core.getInput("topic");
        const title = core.getInput("title") || "GitHub Actions";
        const details = core.getInput("details");
        const priority = core.getInput("priority") || 3;
        const icon = core.getInput("icon");
        const image = core.getInput("image");
        const actionsInput = core.getInput("actions");
        let actions;

        if (actionsInput === "default") {
            actions = message[0];
        } else if (actionsInput !== "" && actionsInput !== "disabled") {
            try {
                actions = JSON.parse(actionsInput);
            } catch (error) {
                core.warning("Invalid input for 'actions'. Using default actions.");
                core.warning(`Error: ${error.message}`);
                actions = message[0];
            }
        } else {
            actions = [];
        }

        let ImageEnabled = image === "true";
        if (image !== "true" && image !== "false" && image !== "") {
            core.warning("Invalid input for 'image'");
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

        core.info(`Connecting to endpoint (${ntfy_url}) ...`);

        const response = await axios.post(ntfy_url, Payload, {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/119.0",
                Priority: priority,
                ...headers,
            },
        });

        core.setOutput("response", {
            statusCode: response.statusCode,
        });
    } catch (error) {
        if (error.response) {
            core.error(`Request failed with status ${error.response.status}: ${error.response.statusText}`);
            core.error(`Response body: ${JSON.stringify(error.response.data)}`);
        } else {
            core.error(`Unknown error: ${error.message}`);
        }
        core.setFailed(error.message);
    }
}

run();