---
description: 深度构建AGENTS.md
subtask: false
---

# 功能说明
    本命令用于在项目根目录生成全局 AGENTS.md，并在所有子模块目录下生成各自的 AGENTS.md 文件，实现项目结构的 AI 辅助开发配置。
# 使用场景
    - 初始化新项目的 AI 辅助开发环境
    - 为现有项目补充 AI 配置文件
    - 项目结构调整后更新 AGENTS 文档
# 如何操作
## 0. 操作原则
    Please analyze this codebase and create an AGENTS.md file containing:
    1. Build/lint/test commands - especially for running a single test
    2. Code style guidelines including imports, formatting, types, naming conventions, error handling, etc.
    The file you create will be given to agentic coding agents (such as yourself) that operate in this repository. Make it about 150 lines long.
    If there are Cursor rules (in .cursor/rules/ or .cursorrules) or Copilot rules (in .github/copilot-instructions.md), make sure to include them.
## 1. 识别子模块
    自动遍历项目目录，识别包含代码的子模块：
    - 检测包含源代码（如 src/, lib/, packages/）的目录
    - 识别 git submodule（如果存在）

## 2. 生成子模块 AGENTS.md
    - 使用command`/init`在每个识别到的子模块生成独立的AGENTS.md
    - 分析代码，识别模块依赖、功能
    - 如果已存在AGENTS.md，整合旧AGENTS.md信息,重新生成

## 3. 生成根目录 AGENTS.md
    - 使用command`/init`在项目根目录创建全局 AGENTS.md
    - 分析代码，识别模块依赖、功能
    - 如果已存在AGENTS.md，整合旧AGENTS.md信息,重新生成
    - 汇总所有子模块的概述和功能说明
    - 定义全局性 Agent 行为规范
    - 说明模块间的关系和依赖

