# 个人 Vibe Coding 助手

## 概述
OpenCode CLI 的自定义配置目录，包含扩展 Agents 和 Commands。

## 目录结构
```
├── AGENTS.md              # 全局 Agent 行为规则
├── agents/                # 自定义代理
│   ├── super-plan.md      # 规划编排者
│   ├── metis.md           # 预规划顾问
│   ├── oracle.md          # 架构/调试专家
│   ├── momus.md           # 计划评审专家
│   ├── librarian.md       # 代码库检索专家
│   └── multimodal-looker.md # 媒体分析专家
└── commands/              # 自定义命令
    ├── cmd-extract-rules.md
    ├── cmd-init-deep.md
    ├── cmd-save-plan.md
    ├── cmd-clear-attach.md
    └── kill_long_attach.sh
```

## Agents 代理

| 代理 | 描述 |
|------|------|
| **super-plan** | 规划编排者，协调子代理（Metis/Explore/Librarian/Oracle/Momus）生成综合工作计划 |
| **Metis** | 预规划顾问，分析请求识别隐藏意图、歧义和 AI 失败点 |
| **Oracle** | 只读咨询代理，高难度调试和架构设计的推理专家 |
| **Momus** | 计划评审专家，评估工作计划的清晰度、可验证性和完整性 |
| **Librarian** | 开源代码库理解代理，搜索远程仓库、获取官方文档和实现示例 |
| **Multimodal-Looker** | 媒体文件分析代理，处理 PDF/图像/图表等需要深度理解的内容 |

## Commands 命令

| 命令 | 功能 |
|------|------|
| `/cmd-extract-rules` | 从对话历史提取需求/规则并更新 AGENTS.md |
| `/cmd-init-deep` | 深度构建 AGENTS.md，含子模块目录 |
| `/cmd-save-plan` | 保存当前会话的执行计划到 .plans/ |
| `/cmd-clear-attach` | 清理附件 |

## 核心规则

来自 AGENTS.md：
- **禁止**自动提交代码变更 - git commit 需用户明确请求
