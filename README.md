# ntfy action

Send GitHub action notifications to [ntfy.sh](https://ntfy.sh).

This is currently only available for `push`, `release`, `schedule`, `workflow`, `repository_dispatch` and `workflow_dispatch` events. This action will send a default message wich can be extended with your input `details`.

Forked from [Form_Data_HTTP_POST_Action](https://github.com/alikamal1/Form_Data_HTTP_POST_Action).

## Inputs

| Input    | Required | Description                                                   | Example                                                                                                                                                                             |
| -------- | -------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| url      | Yes      | ntfy URL                                                      | `www.ntfy.sh`                                                                                                                                                                       |
| topic    | Yes      | ntfy topic                                                    | `test`                                                                                                                                                                              |
| tags     | No       | Tags for the message seperated by commas                      | `partying_face,+1`                                                                                                                                                                  |
| title    | No       | Message title                                                 | `GitHub`. Default is `GitHub Actions`.                                                                                                                                              |
| priority | No       | Message priority                                              | `5`. Default is 3.                                                                                                                                                                  |
| details  | No       | Additional text after the notification message.               | `Workflow has failed!`. Default is None.                                                                                                                                            |
| headers  | No       | Additional Headers                                            | `{"authorization": "Basic 123456"}`                                                                                                                                                 |
| actions  | No       | Custom action buttons                                         | `[{"action": "view","label": "Open portal","url": "https://home.nest.com/"}, {action 2}]`. Default is `disabled`. Available values: `disabled`, `default` or JSON array of buttons. |
| icon     | No       | An icon that will appear next to the text of the notification | `https://example.com/example.png`                                                                                                                                                   |
| image    | No       | An image of your workflow page.                               | Default is `false` Available values: `true`, `false`.                                                                                                                               |

> [!TIP]
> If you are using CloudFlare infront of your ntfy server, you should turn off `Bot Fight Mode` in `Security->Bots`. Otherwise you probably will get 503 status.

> [!NOTE]
> The image taken is uploaded to [nokonoko/uguu](https://github.com/nokonoko/uguu)'s official server.

## Example Usage

```yaml
- name: ntfy-notifications
  uses: niniyas/ntfy-action@master
  with:
    url: 'https://ntfy.sh' or '${{ secrets.NTFY_URL }}'
    topic: 'test' or '${{ secrets.NTFY_TOPIC }}'
```

### Send with headers

```yaml
- name: ntfy-notifications
  uses: niniyas/ntfy-action@master
  with:
    url: 'https://ntfy.sh' or '${{ secrets.NTFY_URL }}'
    topic: 'test' or '${{ secrets.NTFY_TOPIC }}'
    headers: '{"authorization": "Basic 123456", "another-one": "Basic 123456"}' or '${{ secrets.NTFY_HEADERS }}'
```

### Send with tags, priority and details

#### Success

```yaml
- name: ntfy-success-notifications
  uses: niniyas/ntfy-action@master
  if: success()
  with:
    url: 'https://ntfy.sh' or '${{ secrets.NTFY_URL }}'
    topic: 'test' or '${{ secrets.NTFY_TOPIC }}'
    priority: 4
    headers: '{"authorization": "Basic 123456", "another-one": "Basic 123456"}' or '${{ secrets.NTFY_HEADERS }}'
    tags: +1,partying_face,action,successfully,completed
    details: Workflow has been successfully completed!
    icon: 'https://styles.redditmedia.com/t5_32uhe/styles/communityIcon_xnt6chtnr2j21.png'
    image: true
```

#### Failed

```yaml
- name: ntfy-failed-notifications
  uses: niniyas/ntfy-action@master
  if: failure()
  with:
    url: 'https://ntfy.sh' or '${{ secrets.NTFY_URL }}'
    topic: 'test' or '${{ secrets.NTFY_TOPIC }}'
    priority: 5
    headers: '{"authorization": "Basic 123456", "another-one": "Basic 123456"}' or '${{ secrets.NTFY_HEADERS }}'
    tags: +1,partying_face,action,failed
    details: Workflow has failed!
    actions: 'default'
```

#### Cancelled

```yaml
- name: ntfy-cancelled-notifications
  uses: niniyas/ntfy-action@master
  if: cancelled()
  with:
    url: 'https://ntfy.sh' or '${{ secrets.NTFY_URL }}'
    topic: 'test' or '${{ secrets.NTFY_TOPIC }}'
    priority: 3
    headers: '{"authorization": "Basic 123456", "another-one": "Basic 123456"}' or '${{ secrets.NTFY_HEADERS }}'
    tags: +1,partying_face,action,cancelled
    details: Workflow has been cancelled!
    actions: '[{"action": "view", "label": "Open portal", "url": "https://home.nest.com/", "clear": true}]'
```

## Default messages

#### push

```js
`Author: ${payload.head_commit.author.username}\n` +
`Committer: ${payload.head_commit.committer.name}\n` +
`Ref: ${context.ref}\n` +
`Pushed by: ${payload.pusher.name}\n` +
`Workflow Job Name: ${context.job}\n` +
`Workflow Name: ${context.workflow}\n\n` +
`Commit Message\n${payload.head_commit.message}`
```

#### release

```js
`${payload.release.author.login} has ${payload.action} $
{payload.release.tag_name} on ${payload.repository.full_name}.
\n\n` +
`Repo: ${payload.repository.html_url}\n` +
`Name: ${payload.release.name}\n` +
`Author: ${payload.release.author.login}\n` +
`Prerelease: ${payload.release.prerelease}\n` +
`Workflow Job Name: ${context.job}\n` +
`Workflow Name: ${context.workflow}\n\n` +
`Release Message\n${payload.release.body}`;
```

#### schedule

```js
`Scheduled task '${context.job}' has been executed in ${process.
env.GITHUB_REPOSITORY}.\n\n` +
`Workflow Name: ${context.workflow}\n` +
`Cron: ${payload.schedule}`;
```

#### workflow, repository_dispatch, workflow_dispatch, default

```js
`Workflow '${context.workflow}' has been executed in ${payload.
repository.full_name}\n\n` +
`Repository: ${payload.repository.full_name}\n` +
`Workflow Job Name: ${context.job}\n` +
`Event Name: ${context.eventName}`;
```