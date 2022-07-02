# ntfy action

Forked from [Form_Data_HTTP_POST_Action](https://github.com/alikamal1/Form_Data_HTTP_POST_Action)

Send GitHub action notifications to [ntfy.sh](https://ntfy.sh).

This is currently only available for `push`, `release`, `schedule`, `workflow`, `repository_dispatch` and `workflow_dispatch` events.

## Inputs

|Input|Required| Description          |Example
|---|---|----------------------|---|
|url|Yes| Server URL      |`www.ntfy.sh`
|topic|Yes| ntfy topic           |`test`
|tags|No| Tags for the message seperated by commas |`partying_face,+1`
|title|No| Message title   |`GitHub`. Default is `GitHub Actions`.
|priority|No| Message priority   |`5`. Default is 3.
|details|No| Additional text after the notification message.   |`Workflow has failed!`. Default is None.
|headers|No| Addition Headers     |`{"authorization": "Basic 123456"}`

**Note**: If you are using CloudFlare infront of your ntfy server, you should turn off `Bot Fight Mode` in `Security->Bots`. Otherwise you probably will get 503 status.

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
```
