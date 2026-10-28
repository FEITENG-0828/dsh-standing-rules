import { readFileSync } from 'node:fs'
import { isAbsolute } from 'node:path'
import z from '@deepseek-ai/schemastery'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { dshHomePath, expandHomePath } from '@deepseek-ai/dsh-home-paths'

const name = 'standing-rules'

// file 留空时读取 DSH home 下的 AGENTS.md；显式路径支持 ~ 开头
const Config = z.object({
  file: z.string().default(''),
})

function resolveRulesFile(configured) {
  const trimmed = configured.trim()
  if (trimmed === '') return { file: dshHomePath('AGENTS.md'), explicit: false }
  const expanded = expandHomePath(trimmed)
  if (!isAbsolute(expanded)) throw new Error(`standing-rules: file must be an absolute path or start with ~, got ${JSON.stringify(configured)}`)
  return { file: expanded, explicit: true }
}

function readRules(file, explicit) {
  try {
    return readFileSync(file, 'utf8')
  } catch (error) {
    // 默认文件不存在表示尚未配置规则，不附加提醒；显式路径读取失败直接抛出
    if (!explicit && error.code === 'ENOENT') return ''
    throw error
  }
}

function renderReminder(content, file) {
  const escaped = content.replaceAll('</system-reminder>', '<\\/system-reminder>')
  return `<system-reminder>\n以下是随本条消息附带的规则文件，必须遵守。\nRules from: ${file}\n\n${escaped}\n</system-reminder>`
}

function apply(ctx, config) {
  const rules = resolveRulesFile(config.file)
  ctx.on('agent/pre-step', async ({ messages }, next) => {
    const decision = await next()
    if (decision.kind !== 'enter') return decision
    const incoming = new Set(messages.filter((message) => message.source?.kind === 'user'))
    if (incoming.size === 0) return decision
    const content = readRules(rules.file, rules.explicit)
    if (content.trim() === '') return decision
    const reminder = renderReminder(content, rules.file)
    const admitted = []
    for (const message of decision.messages) {
      admitted.push(message)
      if (incoming.has(message)) {
        admitted.push(createUserMessage({
          content: [{ type: 'text', text: reminder }],
          source: { kind: name, form: 'instructions' },
        }))
      }
    }
    return { ...decision, messages: admitted }
  })
}

export { Config, apply, name }
