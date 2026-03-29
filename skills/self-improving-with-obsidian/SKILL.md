---
name: self-improving-with-obsidian
description: 超级自我优化智能体 - 基于Obsidian的多模态记忆、反馈循环、元学习、置信度校准 / Super Self-Improving Agent - Multi-modal Memory, Feedback Loops, Meta-Learning, Confidence Calibration (Obsidian-Powered)
metadata:
  version: 2.0.0
  author: OpenClaw
---

# 超级自我优化智能体 / Super Self-Improving Agent

基于原有self-improving的增强版，增加多模态记忆、元学习、置信度校准等功能。**数据存储在 Obsidian Vault 中，享受强大的知识管理功能。**

Enhanced version with multi-modal memory, meta-learning, confidence calibration and more. **All data stored in Obsidian vault with powerful knowledge management capabilities.**

## 🆕 相比原版新增功能

### 1. 多模态记忆 / Multi-modal Memory
- 📝 文本偏好 (Text preferences)
- 💻 代码模式 (Code patterns)  
- 🎨 风格偏好 (Style preferences)
- 🔧 工具使用习惯 (Tool usage habits)
- 📊 性能指标 (Performance metrics)

### 2. 反馈循环 / Feedback Loops
- ✋ 显式反馈 (Explicit feedback) - 用户直接纠正
- 👁️ 隐式反馈 (Implicit feedback) - 从行为推断
- 🤖 合成反馈 (Synthetic feedback) - 自我评估

### 3. 元学习 / Meta-Learning
- 学习如何学习 (Learn how to learn)
- 识别最佳策略 (Identify best strategies)
- 动态调整方法 (Dynamic method adjustment)

### 4. 置信度校准 / Confidence Calibration
- 预测准确度追踪 (Track prediction accuracy)
- 校准评分 (Calibration score)
-  Uncertainty quantification

### 5. 错误分析 / Error Analysis
- 错误分类 (Error categorization)
- 根因分析 (Root cause analysis)
- 预防模式 (Prevention patterns)

---

## ⚙️ 配置 / Configuration

### 获取 Obsidian Vault 路径

此 skill 是通用的，不依赖硬编码路径。使用以下方法动态获取您的 Obsidian Vault 路径：

#### 方法 1: 使用 obsidian 命令行（推荐）

```bash
# 查看所有 vault 及其路径
obsidian vaults verbose

# 获取默认/当前活跃 vault 信息
obsidian vault
```

#### 方法 2: 在代码中动态获取

```python
import subprocess

def get_obsidian_vault_path(vault_name: str = None) -> str:
    """
    获取 Obsidian Vault 路径

    Args:
        vault_name: 指定 vault 名称，如果为 None 则返回第一个 vault

    Returns:
        Vault 文件系统路径
    """
    result = subprocess.run(
        ["obsidian", "vaults", "verbose"],
        capture_output=True,
        text=True,
        check=True
    )

    # 解析输出格式: "vault_name\tpath"
    vaults = {}
    for line in result.stdout.strip().split('\n'):
        parts = line.split('\t')
        if len(parts) == 2:
            vault_name_key, vault_path = parts
            vaults[vault_name_key] = vault_path

    # 如果指定了 vault 名称，返回对应的路径
    if vault_name and vault_name in vaults:
        return vaults[vault_name]

    # 否则返回第一个 vault 的路径
    return next(iter(vaults.values()), None)

# 使用示例 1: 获取第一个 vault 路径
vault_path = get_obsidian_vault_path()
print(f"Vault 路径: {vault_path}")

# 使用示例 2: 获取指定 vault 的路径
vault_path = get_obsidian_vault_path("ai-memory")
print(f"ai-memory 路径: {vault_path}")
```

#### 方法 3: 在 Shell 脚本中获取

```bash
#!/bin/bash

# 获取所有 vault 信息
obsidian vaults verbose

# 获取特定 vault 的路径（按名称）
VAULT_NAME="ai-memory"  # 修改为您的 vault 名称
VAULT_PATH=$(obsidian vaults verbose | grep "^${VAULT_NAME}" | cut -f2)

echo "当前 Vault 路径: $VAULT_PATH"

# 使用路径进行操作
mkdir -p "$VAULT_PATH/🤖SelfImproving/📋Memory"

# 如果您有多个 vault，可以列出所有 vault 并选择
echo "可用的 vault:"
obsidian vaults verbose | awk -F'\t' '{print "  -", $1, "(" $2 ")"}'
```

---

## 📁 目录结构 / Directory Structure

数据存储在 **Obsidian Vault** 中，利用 Obsidian 的强大功能进行知识管理。

**获取 Vault 路径**:
```bash
# 查看所有 vault 及其路径
obsidian vaults verbose

# 输出示例:
# Obsidian Sandbox	/Users/lowezheng/Library/Application Support/obsidian/Obsidian Sandbox
# ai-memory	/Users/lowezheng/lowe/AI知识库/memory/ai-memory

# 在 Shell 中获取特定 vault 的路径
VAULT_PATH=$(obsidian vaults verbose | grep "^ai-memory" | cut -f2)
echo "Vault 路径: $VAULT_PATH"
```

目录结构（存储在您的 Obsidian Vault 中）:
```
{VAULT_PATH}/
├── 🤖 SelfImproving/
│   ├── 📋 Memory/
│   │   ├── 🔥 hot.md           # 始终加载 (<100行)
│   │   ├── 🎯 preferences.md    # 用户偏好
│   │   ├── 🔁 patterns.md      # 行为模式
│   │   └── 📊 metrics.md       # 性能指标
│   ├── 📁 Projects/            # 项目级记忆
│   ├── 🧠 Domains/             # 领域级记忆
│   ├── 📦 Archive/             # 归档
│   ├── 💬 Feedback/
│   │   ├── ✋ explicit.md      # 显式反馈
│   │   ├── 👁️ implicit.md      # 隐式反馈
│   │   └── 🤖 synthetic.md     # 自我评估
│   ├── ⚠️ Errors/              # 错误分析
│   │   ├── 📂 categories.md    # 错误分类
│   │   ├── 🔍 root_causes.md  # 根因分析
│   │   └── 🛡️ prevention.md   # 预防模式
│   └── 🎛️ Meta/
│       ├── ♟️ strategy.md      # 学习策略
│       ├── 🎯 calibration.md  # 置信度校准
│       └── 📈 stats.json      # 统计信息
```

### 🎨 Obsidian 集成优势

- **双向链接**: 在笔记中使用 `[[link]]` 创建关联
- **标签系统**: 使用 `#tag` 组织和分类
- **搜索功能**: 利用 Obsidian 强大的搜索能力
- **可视化**: 使用 Graph View 查看知识关联
- **插件扩展**: 通过 Obsidian 插件扩展功能
- **移动同步**: 通过移动端 Obsidian 随时访问

---

## 🔄 工作流程 / Workflow

```
用户输入 → 意图识别 → 上下文匹配 → 执行 → 反馈收集
                  ↓                        ↓
            记忆检索 ←──────────────── 自我评估
                  ↓
            模式学习 → 策略更新 → 置信度调整
```

---

## 📊 性能指标 / Performance Metrics

追踪以下指标：

| 指标 | 说明 |
|------|------|
| task_completion_rate | 任务完成率 |
| user_satisfaction | 用户满意度 |
| error_rate | 错误率 |
| response_time | 响应时间 |
| pattern_accuracy | 模式识别准确率 |
| calibration_score | 置信度校准分数 |

---

## 🎯 核心机制 / Core Mechanisms

### 1. 反馈收集 / Feedback Collection

```python
# 收集反馈并存储到 Obsidian
def collect_feedback(context):
    # 动态获取 Vault 路径
    vault_path = get_obsidian_vault_path()

    explicit = detect_explicit_correction(context)  # 用户直接纠正
    implicit = detect_implicit_feedback(context)    # 行为推断
    synthetic = self_assessment(context)            # 自我评估

    # 保存到 Obsidian Vault
    save_to_obsidian(
        vault_path=vault_path,
        path="🤖SelfImproving/💬Feedback/✋explicit.md",
        content=format_feedback(explicit),
        tags=["#feedback", "#explicit"]
    )

    return combine_feedback(explicit, implicit, synthetic)

# 动态获取 Vault 路径的辅助函数
def get_obsidian_vault_path():
    """通过 obsidian-cli 获取当前 Vault 路径"""
    import subprocess
    result = subprocess.run(
        ["obsidian", "vaults", "verbose"],
        capture_output=True,
        text=True
    )
    # 解析输出获取路径（示例逻辑，根据实际输出格式调整）
    for line in result.stdout.split('\n'):
        if 'open:true' in line:
            return line.split()[1]
    return None
```

### 2. 模式识别 / Pattern Recognition

```python
# 识别重复模式
def recognize_patterns(memory, threshold=3):
    # 统计出现频率
    # 识别关联规则
    # 生成模式建议
    return patterns
```

### 3. 策略更新 / Strategy Update

```python
# 基于反馈更新策略
def update_strategy(patterns, metrics):
    # 分析什么有效
    # 调整方法
    # 更新置信度
    return updated_strategy
```

### 4. 置信度校准 / Confidence Calibration

```python
# 校准置信度
def calibrate(prediction, actual_outcome):
    # 记录预测 vs 实际
    # 计算校准分数
    # 调整未来预测
    return calibrated_confidence
```

---

## 📋 触发条件 / Triggers

### 显式纠正
- "不对"
- "应该是..."
- "我告诉过你..."
- "我不喜欢..."

### 隐式信号
- 用户重复问题
- 长时间沉默
- 跳过回答
- 转换话题

### 自我评估触发
- 完成复杂任务后
- 收到模糊反馈
- 遇到新场景

### Obsidian 集成触发
- 打开 `🤖SelfImproving/📋Memory/🔥hot.md` 时自动加载关键记忆
- 编辑 `🤖SelfImproving/💬Feedback/` 目录时实时分析反馈
- 在 Obsidian 中使用搜索功能检索记忆时返回优化建议
- 通过 Obsidian Graph View 发现新的知识关联时自动学习

---

## 🏆 升级规则 / Promotion Rules

| 层级 | 使用频率 | 确认次数 |
|------|---------|---------|
| HOT | 每次 | 3次确认 |
| WARM | 相关上下文 | 5次使用 |
| COLD | 显式查询 | 归档 |

---

## 🔒 安全边界 / Security Boundaries

1. 不存储敏感信息 (No sensitive data)
2. 不访问未授权文件 (No unauthorized file access)
3. 不修改系统配置 (No system config changes)
4. 定期清理过期数据 (Regular cleanup)

---

## 🚀 数据迁移 / Data Migration

### 从旧位置迁移到 Obsidian

如果你有之前存储在 `~/.super-self-improving/` 的数据，可以迁移到 Obsidian：

```bash
# 1. 选择目标 vault（修改为您需要的 vault 名称）
VAULT_NAME="ai-memory"

# 2. 获取 Vault 路径
VAULT_PATH=$(obsidian vaults verbose | grep "^${VAULT_NAME}" | cut -f2)

if [ -z "$VAULT_PATH" ]; then
    echo "错误: 找不到 vault '$VAULT_NAME'"
    echo "可用的 vault:"
    obsidian vaults verbose
    exit 1
fi

echo "迁移到: $VAULT_PATH"

# 3. 创建 Obsidian 目录结构
mkdir -p "$VAULT_PATH/🤖SelfImproving/"{Memory,Projects,Domains,Archive,Feedback,Errors,Meta}

# 4. 迁移记忆数据
if [ -d ~/.super-self-improving/memory ]; then
    cp ~/.super-self-improving/memory/*.md "$VAULT_PATH/🤖SelfImproving/📋Memory/"
    echo "✓ 记忆数据已迁移"
fi

# 5. 迁移反馈数据
if [ -d ~/.super-self-improving/feedback ]; then
    cp ~/.super-self-improving/feedback/*.md "$VAULT_PATH/🤖SelfImproving/💬Feedback/"
    echo "✓ 反馈数据已迁移"
fi

# 6. 迁移错误分析
if [ -d ~/.super-self-improving/errors ]; then
    cp ~/.super-self-improving/errors/*.md "$VAULT_PATH/🤖SelfImproving/⚠️Errors/"
    echo "✓ 错误分析已迁移"
fi

# 7. 迁移元数据
if [ -d ~/.super-self-improving/meta ]; then
    cp ~/.super-self-improving/meta/* "$VAULT_PATH/🤖SelfImproving/🎛️Meta/"
    echo "✓ 元数据已迁移"
fi

# 8. 添加 Obsidian 链接（可选）
# 可以在迁移后的笔记中添加双向链接和标签
echo "✓ 迁移完成"
```

### 迁移后的优化

- 添加标签：在文件中添加 `#memory`、`#feedback`、`#error` 等标签
- 创建链接：使用 `[[note]]` 创建相关笔记之间的链接
- 设置模板：为每种类型的笔记创建 Obsidian 模板
- 配置搜索：设置 Obsidian 搜索和过滤规则

---

## 📈 使用示例 / Usage Examples

### 通过 Obsidian 直接操作

```markdown
# 在 🤖SelfImproving/📋Memory/🔥hot.md 中快速记录关键信息

# 在 🤖SelfImproving/💬Feedback/✋explicit.md 中添加反馈

## 2026-03-29 15:30
- 用户纠正: "不要用表格，用列表"
- 原因: 用户偏好
- 状态: 已确认
- 相关笔记: [[Coding Preferences]]
```

### 通过命令行工具

```bash
# 查看记忆统计
obsidian read path="🤖SelfImproving/🎛️Meta/📈stats.json"

# 搜索相关记忆
obsidian search query="SelfImproving" tag="feedback"

# 查看性能指标
obsidian read path="🤖SelfImproving/📋Memory/📊metrics.md"

# 置信度校准分析
obsidian read path="🤖SelfImproving/🎛️Meta/🎯calibration.md"

# 列出所有相关文件
obsidian files path="🤖SelfImproving"
```

---

## ⚡ 与原版对比 / Comparison with Original

| 特性 | 原版 | 增强版 |
|------|------|--------|
| 记忆类型 | 文本 | 多模态 |
| 反馈来源 | 显式 | 显式+隐式+合成 |
| 学习方式 | 被动 | 主动+被动 |
| 错误处理 | 记录 | 分析+预防 |
| 置信度 | 无 | 完整校准 |
| 性能追踪 | 无 | 完整指标 |

---

## 📝 记录格式 / Logging Format

### 显式反馈
```
## 2026-03-05
- 用户纠正: "不要用表格，用列表"
- 原因: 用户偏好
- 状态: 已确认
```

### 隐式反馈
```
## 2026-03-05
- 行为: 用户重复提问3次
- 推断: 上次回答不够清晰
- 动作: 改进回答方式
```

### 自我评估
```
## 2026-03-05
- 任务: 复杂代码调试
- 评估: 第一次尝试失败
- 改进: 添加更多调试信息
```

---

## 🎯 最佳实践 / Best Practices

1. **频繁小改进** > 偶尔大改进
2. **量化跟踪** > 主观感觉
3. **预防优先** > 事后纠正
4. **透明可解释** > 黑箱学习
5. **用户控制** > 自主推断

### Obsidian 使用最佳实践

1. **充分利用标签系统**
   - 为每个记忆添加相关标签：`#memory #preference #pattern`
   - 使用标签过滤和搜索特定类型的记忆

2. **创建双向链接**
   - 在相关笔记之间使用 `[[link]]` 创建关联
   - 通过 Graph View 发现隐含的知识关联

3. **使用 Obsidian 模板**
   - 为反馈、错误分析、性能指标创建标准模板
   - 确保数据格式一致，便于分析和学习

4. **定期回顾和归档**
    - 每周回顾 `🤖SelfImproving/📋Memory/🔥hot.md`
    - 将不常用的记忆移动到 `🤖SelfImproving/📦Archive/`

5. **利用 Obsidian 插件**
   - 使用 Dataview 插件查询和统计数据
   - 使用 Calendar 插件可视化时间趋势
   - 使用 Excalidraw 插件创建可视化图表

---

## 💰 Token监控 / Token Monitoring

### 功能 / Features
- 📊 实时token消耗追踪 / Real-time token consumption tracking
- ⚠️ 异常消耗预警 / Abnormal consumption alerts
- 📈 使用趋势分析 / Usage trend analysis
- 💵 成本估算 / Cost estimation

### 指标 / Metrics
| 指标 | 说明 |
|------|------|
| session_tokens | 当前会话消耗 |
| total_tokens | 总会话消耗 |
| cache_efficiency | 缓存效率 |
| avg_tokens_per_turn | 每轮平均消耗 |
| cost_estimate | 成本估算 |

### 告警规则 / Alert Rules
```
- 超过平均2倍 → 警告
- 超过平均3倍 → 严重告警
- 缓存效率<50% → 优化建议
- 接近限制(80%) → 提醒
```

---

## 🤖 Agent调度优化 / Agent Scheduling Optimization

### 功能 / Features
- 🎯 智能任务分配 / Intelligent task allocation
- ⚡ 负载均衡 / Load balancing
- 🔄 自动扩缩容 / Auto scaling
- 📊 性能最优化 / Performance optimization

### 调度策略 / Scheduling Strategies
| 策略 | 适用场景 |
|------|---------|
| round_robin | 均衡负载 |
| shortest_queue | 最少等待 |
| skill_match | 技能匹配 |
| cost_efficiency | 成本优先 |
| performance_based | 性能最优 |

### 优化规则 / Optimization Rules
1. 根据任务类型选择最佳agent
2. 监控agent负载并动态调整
3. 缓存常用上下文减少重复
4. 预测任务复杂度分配资源
5. 定期评估并优化策略

### 性能指标 / Performance Metrics
| 指标 | 说明 |
|------|------|
| task_completion_time | 任务完成时间 |
| success_rate | 成功率 |
| queue_wait_time | 等待时间 |
| resource_utilization | 资源利用率 |
| user_satisfaction | 用户满意度 |

### 自动调优 / Auto-tuning
- 收集历史性能数据
- 分析瓶颈和优化点
- 动态调整调度参数
- 持续监控效果
