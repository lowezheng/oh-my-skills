---
description: 销毁未回收的tmux session attach进程
subtask: false
---

# 如何操作
## 0. 操作原则
    请根据实际情况，选择合适的时间阈值（单位：秒）。如果没有设置，默认是180
## 1. 执行SHELL脚本 @~/.config/opencode/commands/kill_long_attach.sh $1
## 2. 显示剩余的attach进程信息

```bash
ps aux | grep "opencode attach" | grep -v grep
```



