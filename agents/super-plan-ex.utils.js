/**
 * Super Plan EX - 工具函数库
 * 
 * 此文件包含规划编排器所需的所有辅助函数。
 * 文档见: super-plan-ex.md
 */

// ========== 时间处理函数 ==========

function getCurrentTime() {
  return new Date().toISOString()
}

function getLocalTime(isoTime) {
  const now = isoTime ? new Date(isoTime) : new Date()
  return now.toLocaleTimeString('zh-CN', { hour12: false })
}

function calculateDuration(startTime, endTime) {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  const duration = Math.round((end - start) / 1000)
  return `${Math.max(0, duration)}s`
}

// ========== Session ID 提取 ==========

function extractSessionId(result, agentType) {
  const session_id = result.session_id || result.task_id || result.session?.id
  if (!session_id) {
    throw new Error(`无法提取 Session ID (Agent: ${agentType})`)
  }
  console.log(`✅ Session ID 提取成功 (Agent: ${agentType}): ${session_id}`)
  return session_id
}

// ========== steps.md 管理函数 ==========

async function initStepsFile(taskName, complexity, selectedAgents) {
  const stepsPath = `.plans/${taskName}/steps.md`
  const initTime = getCurrentTime()
  const localInitTime = getLocalTime()
  
  const stepsContent = `# Orchestration Steps

## 任务信息
- **任务名称**: ${taskName}
- **复杂度**: ${complexity}
- **Sub-Agent 选择**: ${selectedAgents.join(' + ')}

## 执行时间线

| Step | Sub-Agent | Session 类型 | 开始时间 | 结束时间 | 耗时 | 状态 |
|------|-----------|-------------|---------|---------|------|------|
| 0 | 初始化 | Current | ${localInitTime} | ${localInitTime} | ~0s | ✅ 完成 |

## 用户交互记录

| 交互名称 | 开始时间 | 结束时间 | 耗时 | 说明 |
|---------|---------|---------|------|------|

## Session IDs 记录

`
  
  await write({ content: stepsContent, filePath: stepsPath })
  return stepsPath
}

async function appendStep(taskName, stepNumber, subAgentName, sessionType, startTime, endTime, status) {
  const stepsPath = `.plans/${taskName}/steps.md`
  const duration = calculateDuration(startTime, endTime)
  const statusIcon = status === 'completed' ? '✅ 完成' : '❌ 失败'
  
  const newLine = `| ${stepNumber} | ${subAgentName} | ${sessionType} | ${getLocalTime(startTime)} | ${getLocalTime(endTime)} | ${duration} | ${statusIcon} |`
  
  const existingContent = await read({ filePath: stepsPath })
  const updatedContent = existingContent.content.replace(
    /(\n## Session IDs 记录)/,
    `${newLine}\n$1`
  )
  
  await write({ content: updatedContent, filePath: stepsPath })
}

async function recordUserInteraction(taskName, interactionName, startTime, endTime, notes = '') {
  const stepsPath = `.plans/${taskName}/steps.md`
  const duration = calculateDuration(startTime, endTime)
  
  const interactionLine = `| ${interactionName} | ${getLocalTime(startTime)} | ${getLocalTime(endTime)} | ${duration} | ${notes} |`
  
  const existingContent = await read({ filePath: stepsPath })
  const updatedContent = existingContent.content.replace(
    /(\n## Session IDs 记录)/,
    `${interactionLine}\n$1`
  )
  
  await write({ content: updatedContent, filePath: stepsPath })
}

async function saveAgentOutput(taskName, agentType, sessionId, content, timestamp) {
  const filename = `${agentType}-${sessionId}-${timestamp}.md`
  const filePath = `.plans/${taskName}/thinks/${filename}`
  await write({ content, filePath })
  return filePath
}

async function recordSessionId(taskName, agentType, sessionId) {
  const stepsPath = `.plans/${taskName}/steps.md`
  const existingContent = await read({ filePath: stepsPath })
  const newLine = `- ${agentType}: ${sessionId}\n`
  const updatedContent = existingContent.content + newLine
  await write({ content: updatedContent, filePath: stepsPath })
}

// ========== 配置常量 ==========

const COMPLEXITY_THRESHOLDS = {
  SIMPLE: 3,
  MODERATE: 7
}

const COMPLEXITY_WEIGHTS = {
  num_subtasks: 1.0,
  needs_research: 1.5,
  technical_difficulty: 1.0
}

// ========== 导出（如需模块化使用） ==========

module.exports = {
  getCurrentTime,
  getLocalTime,
  calculateDuration,
  extractSessionId,
  initStepsFile,
  appendStep,
  recordUserInteraction,
  saveAgentOutput,
  recordSessionId,
  COMPLEXITY_THRESHOLDS,
  COMPLEXITY_WEIGHTS
}
