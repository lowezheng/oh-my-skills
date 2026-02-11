#!/bin/bash

# 获取opencode attach进程的运行时间并kill超过3分钟的进程
ps aux | grep "opencode attach" | grep -v grep | while read -r line; do
    # 提取PID (第2列)
    pid=$(echo "$line" | awk '{print $2}')
    
    # 提取运行时间 (第10列)
    time=$(echo "$line" | awk '{print $10}')
    
    # 解析时间并转换为秒数
    # 格式可能是 MM:SS 或 H:MM:SS
    minutes=$(echo "$time" | cut -d: -f1)
    seconds=$(echo "$time" | cut -d: -f2 | cut -d. -f1)
    
    # 如果是 H:MM:SS 格式，需要重新解析
    if echo "$time" | grep -q '^[0-9]\+:[0-9][0-9]:[0-9][0-9]'; then
        hours=$(echo "$time" | cut -d: -f1)
        minutes=$(echo "$time" | cut -d: -f2)
        seconds=$(echo "$time" | cut -d: -f3 | cut -d. -f1)
        total_seconds=$((10#$hours * 3600 + 10#$minutes * 60 + 10#$seconds))
    else
        total_seconds=$((10#$minutes * 60 + 10#$seconds))
    fi
    echo "find PID $pid (running for $time, ${total_seconds}s)"
    # 检查是否超过3分钟（180秒）
    if [ "$total_seconds" -gt $1 ]; then
        echo "Killing PID $pid (running for $time, ${total_seconds}s)"
        kill -9 "$pid"
    fi
done