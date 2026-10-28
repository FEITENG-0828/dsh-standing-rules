# dsh-standing-rules

一个 DeepSeek Harness 插件：把 `AGENTS.md` 的规则附加到每条用户消息上，作为提醒。

- 每收到一条用户消息，就在这条消息后面附加一条规则提醒，模型读到的最新消息旁边就有规则。
- 提醒消息保留在会话历史里，随着对话增加不断累积。
- 组装提醒时读取规则文件，修改后下一条消息直接生效。
- 不添加工具、命令或界面。

## 安装

在插件页搜索 `dsh-standing-rules` 安装，或者使用命令行：

```sh
dsh plugin --profile <profile> add dsh-standing-rules
```

默认读取 `$DSH_HOME/AGENTS.md`（通常是 `~/.dsh/AGENTS.md`）。

## 配置

| 字段 | 默认值 | 含义 |
| --- | --- | --- |
| `file` | `''` | 规则文件的绝对路径，或者以 `~` 开头的路径。留空表示 `$DSH_HOME/AGENTS.md`。 |

```yaml
- id: standing-rules
  name: dsh-standing-rules
  config:
    file: '~/notes/rules.md'
```

## 行为

- 每条进入会话的用户消息，包括委派给子智能体的任务消息，后面都会附加一条规则提醒消息。
- 提醒消息是 user 角色，带 `<system-reminder>` 框架，规则文件原样放入；文件里字面的 `</system-reminder>` 会被转义。
- 每条消息附加时读取一次规则文件。默认文件不存在时不附加提醒；显式配置的文件读取失败时请求直接失败。
- 每条提醒都保留在会话历史里，后续每次请求都要支付它的输入 token。长会话按设计累积多份副本。

## 兼容性

在 DeepSeek Harness `0.2.1-rc.3` 与 Node `24.21.0` 上测试。要求 `dsh >=0.2.0-rc.2 || >=0.2.1-rc.2`，Node `^22.19.0 || >=24.0.0`。

## 卸载

在插件页移除这个组合包，或者使用命令行：

```sh
dsh plugin --profile <profile> remove dsh-standing-rules
```

## 许可证

MIT
