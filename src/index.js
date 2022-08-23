const core = require('@actions/core');
const axios = require('axios');
const github = require('@actions/github');
//const FormData = require('form-data');
//const fs = require('fs');

async function githubmessage() {
    const context = github.context;
    const payload = context.payload;
    let action_buttons
    let message

    switch (context.eventName) {
        case 'push':
            action_buttons = [{
                    "action": "view",
                    "label": "Compare",
                    "url": payload.compare,
                    "clear": true
                },
                {
                    "action": "view",
                    "label": "View Commit",
                    "url": payload.head_commit.url,
                    "clear": true
                },
                {
                    "action": "view",
                    "label": "Visit Repository",
                    "url": payload.repository.html_url,
                    "clear": true
                }
            ]

            message = `${payload.head_commit.committer.name} has pushed ${context.sha.slice(-7)} to ${payload.repository.full_name}.\n\n` +
                `Author: ${payload.head_commit.author.username}\n` +
                `Committer: ${payload.head_commit.committer.name}\n` +
                `Ref: ${context.ref}\n` +
                `Pushed by: ${payload.pusher.name}\n` +
                `Workflow Job Name: ${context.job}\n` +
                `Workflow Name: ${context.workflow}\n\n` +
                `Commit Message\n${payload.head_commit.message}`;

            return [action_buttons, message]

        case 'release':
            action_buttons = [{
                    "action": "view",
                    "label": "Release URL",
                    "url": payload.release.html_url,
                    "clear": true
                },
                {
                    "action": "view",
                    "label": "Download Tar",
                    "url": payload.release.tarball_url,
                    "clear": true
                },
                {
                    "action": "view",
                    "label": "Download Zip",
                    "url": payload.release.zipball_url,
                    "clear": true
                }
            ]

            message = `${payload.release.author.login} has ${payload.action} ${payload.release.tag_name} on ${payload.repository.full_name}.\n\n` +
                `Repo: ${payload.repository.html_url}\n` +
                `Name: ${payload.release.name}\n` +
                `Author: ${payload.release.author.login}\n` +
                `Prerelease: ${payload.release.prerelease}\n` +
                `Workflow Job Name: ${context.job}\n` +
                `Workflow Name: ${context.workflow}\n\n` +
                `Release Message\n${payload.release.body}`;

            return [action_buttons, message]

        case 'schedule':
            action_buttons = [{
                    "action": "view",
                    "label": "Visit Repository",
                    "url": `https://github.com/${process.env.GITHUB_REPOSITORY}`,
                    "clear": true
                },
                {
                    "action": "view",
                    "label": "View Run",
                    "url": `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
                    "clear": true
                }
            ]

            message = `Scheduled task '${context.job}' ran in ${process.env.GITHUB_REPOSITORY}.\n\n` +
                `Workflow Name: ${context.workflow}\n` +
                `Cron: ${context.payload.schedule}`;

            return [action_buttons, message]

        default:
            action_buttons = [{
                    "action": "view",
                    "label": "Visit Repo",
                    "url": payload.repository.html_url,
                    "clear": true
                },
                {
                    "action": "view",
                    "label": "View Run",
                    "url": `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
                    "clear": true
                }
            ]

            message = `Workflow '${context.workflow}' ran in ${payload.repository.full_name}\n\n` +
                `Repository: ${payload.repository.full_name}\n` +
                `Workflow Job Name: ${context.job}\n` +
                `Event Name: ${context.eventName}`

            return [action_buttons, message]
    }
}

async function run() {
    try {
        const url = core.getInput('url')
        const headers = JSON.parse(core.getInput('headers') || '{}')
        const tags = core.getInput('tags').split(',');
        const topic = core.getInput('topic')
        const title = core.getInput('title') || 'GitHub Actions'
        const details = core.getInput('details')
        const priority = core.getInput('priority') || 3
        //const data = JSON.parse(core.getInput('data') || '{}')
        //const name = core.getInput('name')
        //const file = core.getInput('file')

        //console.log(`URL: ${url}`)
        //console.log(`Headers: ${headers}`)
        //console.log(`Data: ${data}`)
        //console.log(`File Name: ${name}`)
        //console.log(`File Path: ${file}`)

        //const form = new FormData();
        //for (const [key, value] of Object.entries(data)) {
        //  form.append(key, value)
        //}

        //if (name && file) {
        //  form.append(name, fs.createReadStream(file));
        //}

        core.info(`Connecting to endpoint (${url}) ...`)

        let message = await githubmessage();

        const response = await axios({
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:102.0) Gecko/20100101 Firefox/102.0',
                'Priority': priority,
                ...headers
            },
            data: JSON.stringify({
                'topic': topic,
                'tags': tags,
                'title': (title),
                'actions': message[0],
                "message": message[1] + "\n\n" + details
            })

        })

        core.setOutput('response', {
            'statusCode': response.statusCode
        });
    } catch (error) {
        console.log(error.response.data)
        core.setFailed(error.message);
    }
}

run();