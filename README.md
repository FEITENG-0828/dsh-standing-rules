# dsh-standing-rules

A DeepSeek Harness plugin that appends the rules from `AGENTS.md` to every incoming user message as a reminder.

- Each incoming user message gets one reminder message right after it, so the model reads the rules next to the latest message.
- Reminder messages stay in the conversation history and accumulate as the conversation grows.
- Reads the rules file when the reminder is built; edits take effect on the next message.
- Adds no tools, commands, or UI.

## Install

Install from the Plugins page by searching for `dsh-standing-rules`, or with the CLI:

```sh
dsh plugin --profile <profile> add dsh-standing-rules
```

By default the plugin reads `$DSH_HOME/AGENTS.md` (usually `~/.dsh/AGENTS.md`).

## Configuration

| Field | Default | Meaning |
| --- | --- | --- |
| `file` | `''` | Absolute path to the rules file, or a path starting with `~`. Empty means `$DSH_HOME/AGENTS.md`. |

```yaml
- id: standing-rules
  name: dsh-standing-rules
  config:
    file: '~/notes/rules.md'
```

## Behavior

- Every incoming user message, including a task message delegated to a subagent, gets one reminder message appended right after it.
- The reminder is a user-role message with a `<system-reminder>` frame containing the file verbatim; a literal `</system-reminder>` inside the file is escaped.
- The file is read once per incoming message. A missing default file adds no reminder; an explicitly configured file that cannot be read fails the request.
- Each reminder stays in the conversation history and costs its input tokens on every later request. Long conversations accumulate copies by design.

## Compatibility

Tested on DeepSeek Harness `0.2.1-rc.3` and Node `24.21.0`. Requires `dsh >=0.2.0-rc.2 || >=0.2.1-rc.2` and Node `^22.19.0 || >=24.0.0`.

## Uninstall

Remove the bundle from the Plugins page, or:

```sh
dsh plugin --profile <profile> remove dsh-standing-rules
```

## License

MIT
