# ntfy action

Send GitHub action notifications to [ntfy.sh](https://ntfy.sh).

This is currently only available for `push`, `release`, `schedule`, `workflow`, `repository_dispatch` and `workflow_dispatch` events.

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
