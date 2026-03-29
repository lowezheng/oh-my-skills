---
description: 从当前会话提取知识并存储到Obsidian（驱动self-improving-with-obsidian skill）
subtask: false
---

# 功能说明
    本命令驱动 self-improving-with-obsidian skill，从当前会话的对话历史中提取有用的知识，根据当前工作目录识别项目名称，并将提取的信息分类为通用知识和项目知识后存储到 Obsidian Vault 中。

    **重要说明**：存储结构和提取机制完全由 self-improving-with-obsidian skill 决定，本命令只负责提供会话信息和项目上下文。

# 使用场景
    - 会话完成后提取有价值的知识
    - 项目特定经验的总结和归档
    - 技术问题和解决方案的记录
    - 代码模式和最佳实践的积累
    - 用户偏好和需求的长期记录

# 如何操作

## 0. 操作原则
    本命令需要完成以下任务：
    1. 根据参数确定要处理的会话列表
    2. 获取每个会话的完整对话历史
    3. 获取当前工作目录并识别项目名称
    4. 将会话信息和项目上下文传递给 self-improving-with-obsidian skill
    5. 由 skill 决定如何分析和存储提取的信息

## 1. 确定要处理的会话
    根据参数 $1 决定处理模式：

    ### 模式 1：使用最新的 session（无参数或空参数）
    - 使用 session_list 获取最近创建的 session（limit=1）
    - 假设最新的 session 就是当前正在运行的 session
    - 处理这一个会话

    ### 模式 2：使用所有 session（参数为 "all"）
    - 使用 session_list 获取所有会话
    - 过滤出30天内的会话（根据 to_date 参数或手动计算）
    - 处理符合条件的所有会话

    ### 模式 3：强制重新解析所有 session（参数为 "forceall"）
    - 使用 session_list 获取所有会话
    - 过滤出30天内的会话
    - 在调用 skill 时传递 `force_reparse=true` 标志
    - 处理符合条件的所有会话

    ### 30天过滤规则
    在 all 和 forceall 模式下，只处理30天内的会话：

    ```bash
    # 方法1：使用 session_list 的 to_date 参数（推荐）
    # 计算30天前的日期（ISO 8601格式）
    THIRTY_DAYS_AGO=$(date -v-30d +%Y-%m-%d)  # macOS
    # 或
    THIRTY_DAYS_AGO=$(date -d "30 days ago" +%Y-%m-%d)  # Linux

    session_list to_date=$THIRTY_DAYS_AGO

    # 方法2：获取所有会话后手动过滤
    session_list | while read session_info; do
        session_date=$(echo "$session_info" | extract_date)
        if is_within_thirty_days "$session_date"; then
            process_session "$session_info"
        fi
    done
    ```

    会话日期格式示例：
    - session_info 中通常包含会话的创建日期
    - 日期格式为 ISO 8601 (YYYY-MM-DD)
    - 需要将日期转换为可比较的格式进行过滤

    ### 模式 4：使用指定的 session（其他参数值）
    - 如果用户在命令中提供了 session_id 参数（如 `/cmd-self-improve ses_abc123`）
    - 使用提供的 session_id 直接读取
    - 处理这一个会话

    ### 批量处理逻辑
    - 对于单会话模式（模式1和4），直接处理并返回结果
    - 对于批量模式（模式2和3），执行以下流程：

    #### 步骤1：准备阶段
    1. 获取所有会话列表
    2. 过滤出30天内的会话
    3. 按日期排序（从旧到新或从新到旧）
    4. 统计会话总数

    #### 步骤2：确认阶段
    1. 检查是否有符合条件的会话：
       - 如果没有，显示提示信息并退出：
         ```
         未找到30天内的会话。
         如需处理更早的会话，请手动指定 session_id。
         ```
       - 如果有，继续下一步
    2. 向用户展示将要处理的会话摘要：
       ```
       将要处理的会话范围: 2026-03-01 至 2026-03-29
       会话总数: 15
       ```
    3. 询问用户是否确认开始处理（可选，或直接开始）

    #### 步骤3：执行阶段
    对于每个会话：
    1. 显示当前进度：`[进度: 3/15] 处理会话 ses_abc123...`
    2. 读取会话内容
    3. 调用 self-improving-with-obsidian skill
    4. 记录处理结果（成功/失败 + 错误信息）
    5. 更新进度

    #### 步骤4：汇总阶段
    1. 统计成功和失败的会话数量
    2. 统计总共提取的知识条目数量
    3. 计算总耗时
    4. 生成汇总报告

    #### 错误处理
    - 如果某个会话处理失败，记录错误信息
    - 继续处理下一个会话（不中断批量流程）
    - 最后在汇总报告中列出所有失败的会话及其原因

    #### 性能优化建议
    - 对于大量会话（超过50个），考虑分批处理
    - 可以添加 `--limit` 参数限制处理的会话数量
    - 可以添加 `--from-date` 和 `--to-date` 参数自定义日期范围
    - 考虑添加并行处理选项（如果 skill 支持的话）

## 2. 读取会话内容
    对于每个要处理的会话：
    - 使用 session_read 读取完整的对话历史
    - 使用 include_todos=true 和 include_transcript=true 获取完整上下文
    - 使用 session_info 获取会话元数据（日期、agents 使用情况等）

## 2. 获取当前工作目录和项目信息
    - 使用 bash 工具执行 `pwd` 获取当前工作目录
    - 识别项目名称和项目上下文：
        ```bash
        # 获取项目根目录
        git rev-parse --show-toplevel 2>/dev/null || echo $PWD

        # 获取项目名称
        basename $(git rev-parse --show-toplevel 2>/dev/null || echo $PWD)
        ```
    - 收集项目上下文信息（可选）：
        - 项目类型（通过标志性文件识别：package.json、go.mod、pyproject.toml 等）
        - Git 远程仓库信息（如果有）
        - 项目目录结构

## 3. 驱动 self-improving-with-obsidian skill
    加载 self-improving-with-obsidian skill 并传递以下上下文：

    ### 输入参数
    ```
    session_content: 完整的会话对话历史
    session_metadata: 会话元数据（日期、agents 等）
    project_name: 识别的项目名称
    project_path: 项目路径
    project_context: 项目上下文信息（可选）
    working_directory: 当前工作目录
    force_reparse: 是否强制重新解析（仅在 forceall 模式下为 true）
    batch_mode: 是否为批量处理模式（在 all/forceall 模式下为 true）
    ```

    ### 单会话处理流程
    self-improving-with-obsidian skill 将：
    1. 分析会话内容，提取有价值的知识
    2. 分类提取的信息为通用知识和项目知识
    3. 使用 Obsidian Vault 存储提取的信息
    4. 确定存储结构和格式
    5. 创建必要的目录结构
    6. 添加适当的标签和链接
    7. 生成总结报告

    ### 批量处理流程（all/forceall 模式）
    命令层负责：
    1. 遍历所有符合条件的会话
    2. 逐个调用 self-improving-with-obsidian skill
    3. 记录每个会话的处理结果
    4. 汇总统计信息：
       - 成功处理的会话数量
       - 失败的会话数量及原因
       - 总共提取的知识条目数量
       - 处理时间统计

    Skill 层在批量模式下的行为：
    - 如果 `force_reparse=true`，跳过缓存检查，强制重新分析
    - 在 `batch_mode=true` 时，简化输出（减少重复的总结信息）
    - 为每个会话生成独立的知识条目

## 4. 输出结果

    ### 单会话模式输出
    Skill 完成处理后，向用户呈现：
    - 提取的知识概要（由 skill 提供）
    - 存储位置（由 skill 提供）
    - 通用知识和项目知识的分类（由 skill 决定）
    - 提取的条目数量（由 skill 统计）

    ### 批量模式输出
    处理完成后，向用户呈现：
    - 会话处理统计：
      ```
      总会话数: N
      成功处理: M
      失败: K
      ```
    - 成功处理的会话列表（session_id + 日期）
    - 失败的会话列表（session_id + 错误原因）
    - 总共提取的知识条目数量
    - 存储位置概览
    - 处理耗时统计

# 参数说明
    $1 可选参数，用于指定处理模式或 session ID
    例如：
    - `/cmd-self-improve` → 使用最新的 session
    - `/cmd-self-improve ses_abc123` → 使用指定的 session
    - `/cmd-self-improve all` → 使用所有30天内的会话
    - `/cmd-self-improve forceall` → 强制重新解析所有30天内的会话

# 执行示例

## 单会话模式示例

### 示例1：使用最新会话
```bash
/cmd-self-improve
```

输出：
```
正在处理会话 ses_latest_123...
✓ 提取完成

提取概要:
- 技术问题: 3条
- 最佳实践: 2条
- 项目知识: 1条

存储位置:
- 通用知识: /Users/xxx/Vault/General/技术/React.md
- 项目知识: /Users/xxx/Vault/Projects/myapp/架构.md
```

### 示例2：使用指定会话
```bash
/cmd-self-improve ses_abc456
```

输出：
```
正在处理会话 ses_abc456...
✓ 提取完成

提取概要:
- 技术问题: 1条
- 最佳实践: 1条
```

## 批量模式示例

### 示例3：使用所有会话
```bash
/cmd-self-improve all
```

输出：
```
正在获取会话列表...
✓ 找到15个30天内的会话（2026-03-01 至 2026-03-29）

开始批量处理...

[进度: 1/15] 处理会话 ses_xyz001... ✓ 完成
[进度: 2/15] 处理会话 ses_xyz002... ✓ 完成
[进度: 3/15] 处理会话 ses_xyz003... ✗ 失败: 会话内容为空
[进度: 4/15] 处理会话 ses_xyz004... ✓ 完成
...
[进度: 15/15] 处理会话 ses_xyz015... ✓ 完成

批量处理完成！

处理统计:
- 总会话数: 15
- 成功处理: 14
- 失败: 1

失败会话:
- ses_xyz003: 会话内容为空

提取统计:
- 总共提取知识条目: 42条
  - 通用知识: 28条
  - 项目知识: 14条

存储位置:
- /Users/xxx/Vault/General/
- /Users/xxx/Vault/Projects/myapp/

耗时: 2分34秒
```

### 示例4：强制重新解析所有会话
```bash
/cmd-self-improve forceall
```

输出：
```
正在获取会话列表...
✓ 找到15个30天内的会话（2026-03-01 至 2026-03-29）

开始批量处理（强制重新解析模式）...

[进度: 1/15] 处理会话 ses_xyz001... ✓ 完成（跳过缓存）
[进度: 2/15] 处理会话 ses_xyz002... ✓ 完成（跳过缓存）
...
[进度: 15/15] 处理会话 ses_xyz015... ✓ 完成（跳过缓存）

批量处理完成！

处理统计:
- 总会话数: 15
- 成功处理: 15
- 失败: 0

提取统计:
- 总共提取知识条目: 45条
- 新增条目: 12条
- 更新条目: 33条

耗时: 3分12秒
```

# 注意事项
    - 本命令不直接决定存储结构和提取机制
    - 所有存储相关的逻辑由 self-improving-with-obsidian skill 决定
    - 本命令只负责提供数据源（会话信息和项目上下文）
    - 如果 skill 遇到错误或需要用户输入，skill 会直接与用户交互
    - 批量处理模式（all/forceall）只处理30天内的会话，以避免处理过旧的会话数据
    - forceall 模式会在调用 skill 时传递 `force_reparse=true` 标志，skill 应根据此标志决定是否跳过缓存
    - 批量处理过程中如果某个会话失败，不应中断整个流程，应记录错误并继续处理其他会话
    - 建议在批量处理前先使用单会话模式测试，确保 skill 正常工作
    - 批量处理可能需要较长时间，取决于会话数量和每个会话的大小

# 实现细节参考

## 参数解析逻辑
```bash
PARAM=$1

case "$PARAM" in
    "")
        # 无参数：使用最新会话
        MODE="latest"
        ;;
    "all")
        # 处理所有30天内的会话
        MODE="all"
        ;;
    "forceall")
        # 强制重新解析所有30天内的会话
        MODE="all"
        FORCE_REPARSE=true
        ;;
    ses_*)
        # 指定的 session_id
        MODE="single"
        SESSION_ID="$PARAM"
        ;;
    *)
        # 其他值：当作 session_id 处理
        MODE="single"
        SESSION_ID="$PARAM"
        ;;
esac
```

## 会话列表获取和过滤
```bash
# 计算30天前的日期（跨平台）
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    THIRTY_DAYS_AGO=$(date -v-30d +%Y-%m-%d)
else
    # Linux
    THIRTY_DAYS_AGO=$(date -d "30 days ago" +%Y-%m-%d)
fi

# 使用 session_list 获取30天内的会话
session_list to_date=$THIRTY_DAYS_AGO
```

## 批量处理循环
```bash
# 伪代码示例
SESSIONS=$(get_sessions_list)
TOTAL=$(echo "$SESSIONS" | wc -l)
CURRENT=0
SUCCESS=0
FAILED=0
FAILURES=()

while IFS= read -r session; do
    CURRENT=$((CURRENT + 1))
    echo -n "[进度: $CURRENT/$TOTAL] 处理会话 $session... "

    if process_session "$session"; then
        echo "✓ 完成"
        SUCCESS=$((SUCCESS + 1))
    else
        ERROR=$(get_last_error)
        echo "✗ 失败: $ERROR"
        FAILED=$((FAILED + 1))
        FAILURES+=("$session: $ERROR")
    fi
done <<< "$SESSIONS"

# 汇总报告
echo ""
echo "批量处理完成！"
echo "处理统计:"
echo "- 总会话数: $TOTAL"
echo "- 成功处理: $SUCCESS"
echo "- 失败: $FAILED"

if [ $FAILED -gt 0 ]; then
    echo ""
    echo "失败会话:"
    for failure in "${FAILURES[@]}"; do
        echo "- $failure"
    done
fi
```

## 调用 skill 的参数传递
```bash
# 单会话模式
skill load "self-improving-with-obsidian" \
    session_content="$CONTENT" \
    session_metadata="$METADATA" \
    project_name="$PROJECT_NAME" \
    ...

# 批量模式
skill load "self-improving-with-obsidian" \
    session_content="$CONTENT" \
    session_metadata="$METADATA" \
    project_name="$PROJECT_NAME" \
    batch_mode=true \
    force_reparse="${FORCE_REPARSE:-false}"
```
