# 可点击DOM检测方案

## 问题背景

某些可点击元素 `snapshot -i` 和 `snapshot -i -C` 都无法识别：

| 方式 | 结果 |
|------|------|
| `snapshot -i` | ❌ 未识别 |
| `snapshot -i -C` | ❌ 未识别 |
| `find text "xxx"` | ✅ 找到 |

### 常见场景

- **空href的`<a>`标签**: `<a>查看</a>` 无 href 属性
- **ag-Grid/Ant Design Table**: 虚拟表格中的操作列
- **缺少ARIA属性**: 无 role/tabindex 的可点击元素
- **框架合成事件**: React/Vue 绑定的事件（非内联 onclick）

---

## 检测方案

### 方案一：文本语义查找（推荐）

```bash
# 精确匹配
agent-browser --cdp 9222 find text "查看" click --first

# 多个元素时指定位置
agent-browser --cdp 9222 find text "查看" click --nth 0
agent-browser --cdp 9222 find text "查看" click --nth 2

# 部分匹配
agent-browser --cdp 9222 find text "查" click --first
```

**适用场景：** 知道按钮/链接的文本内容

---

### 方案二：JS遍历DOM

#### 按标签+文本查找

```bash
agent-browser --cdp 9222 eval --stdin <<'EOF'
[...document.querySelectorAll('a')]
  .find(a => a.textContent.includes('查看'))
  ?.click()
EOF
```

#### 按事件和样式检测

```bash
agent-browser --cdp 9222 eval --stdin <<'EOF'
const clickables = [...document.querySelectorAll('*')].filter(el => {
  const style = getComputedStyle(el);
  return (el.onclick || 
          style.cursor === 'pointer' || 
          el.hasAttribute('onclick')) 
         && el.textContent.trim();
}).slice(0, 10);

console.table(clickables.map((el, i) => ({
  index: i,
  tag: el.tagName,
  text: el.textContent.trim().slice(0, 30),
  hasOnclick: !!el.onclick
})));
EOF
```

#### 检测ag-Grid操作列

```bash
agent-browser --cdp 9222 eval --stdin <<'EOF'
const actions = [...document.querySelectorAll('.ag-cell a, .ant-space a')]
  .map(a => ({ text: a.textContent.trim(), hasClick: !!a.onclick }));
console.table(actions);
EOF
```

---

### 方案三：CSS选择器 + 框架特征

```bash
# Ant Design 操作列
agent-browser --cdp 9222 eval --stdin <<'EOF'
JSON.stringify(
  [...document.querySelectorAll('.ant-space-item a')].map(a => a.textContent.trim())
)
EOF

# ag-Grid 操作列
agent-browser --cdp 9222 eval --stdin <<'EOF'
JSON.stringify(
  [...document.querySelectorAll('.ag-cell .ax-col-last a')].map(a => a.textContent.trim())
)
EOF

# 通用表格操作列
agent-browser --cdp 9222 eval --stdin <<'EOF'
JSON.stringify(
  [...document.querySelectorAll('td a, [role="cell"] a, .ag-cell a')]
    .map(a => ({ text: a.textContent.trim(), href: a.href || '无' }))
)
EOF
```

---

### 方案四：通用可点击元素扫描

```bash
agent-browser --cdp 9222 eval --stdin <<'EOF'
(() => {
  const candidates = [];
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(el => {
    const style = getComputedStyle(el);
    const hasCursor = style.cursor === 'pointer';
    const hasClick = !!el.onclick;
    const hasClickAttr = el.hasAttribute('onclick') || 
                         el.hasAttribute('@click') || 
                         el.hasAttribute('v-on:click');
    const hasRole = ['button', 'link', 'tab', 'menuitem']
                    .includes(el.getAttribute('role'));
    const isInteractive = ['A', 'BUTTON', 'INPUT', 'SELECT', 'OPTION']
                          .includes(el.tagName);
    
    if ((hasCursor || hasClick || hasRole || isInteractive || hasClickAttr) 
        && el.textContent.trim() 
        && el.getBoundingClientRect().width > 0) {
      candidates.push({
        tag: el.tagName,
        text: el.textContent.trim().slice(0, 40),
        cursor: hasCursor,
        onclick: hasClick,
        role: el.getAttribute('role') || '-',
        class: (el.className || '').toString().slice(0, 40)
      });
    }
  });
  
  return JSON.stringify(candidates.slice(0, 30), null, 2);
})()
EOF
```

---

## 决策树

```
需要点击某个元素
    │
    ├─ 知道文本内容？ ─────────────→ find text "xxx" click
    │
    ├─ 知道CSS类名/结构？ ─────────→ eval + querySelector
    │
    ├─ 在复杂表格(ag-Grid/AntD)？ ─→ eval + 表格特征选择器
    │
    └─ 完全未知？ ─────────────────→ eval 遍历 + 事件/样式检测
```

---

## 检测脚本模板

### 按标签和文本查找

```bash
detect-by-text() {
  local tag="${1:-a}"
  local text="$2"
  
  agent-browser --cdp 9222 eval --stdin <<EOF
(() => {
  const elements = [...document.querySelectorAll('${tag}')]
    .filter(el => !'${text}' || el.textContent.includes('${text}'))
    .map((el, i) => ({
      index: i,
      text: el.textContent.trim().slice(0, 40),
      hasClick: !!el.onclick,
      cursor: getComputedStyle(el).cursor
    }));
  
  console.log('找到', elements.length, '个元素');
  console.table(elements.slice(0, 20));
})()
EOF
}

# 使用
detect-by-text a 查看
detect-by-text span 编辑
detect-by-text "*"  # 所有元素
```

### 扫描表格操作列

```bash
scan-table-actions() {
  agent-browser --cdp 9222 eval --stdin <<'EOF'
(() => {
  // 检测常见表格框架的操作列
  const selectors = [
    '.ag-cell a',           // ag-Grid
    '.ant-table-cell a',    // Ant Design
    '.ant-space a',         // Ant Design Space
    'td a',                 // 普通 table
    '[role="cell"] a'       // ARIA 表格
  ];
  
  const actions = new Map();
  
  selectors.forEach(sel => {
    const items = [...document.querySelectorAll(sel)]
      .map(a => a.textContent.trim())
      .filter(Boolean);
    if (items.length) actions.set(sel, items);
  });
  
  for (const [sel, items] of actions) {
    console.log(`${sel}: ${items.join(', ')}`);
  }
})()
EOF
}

scan-table-actions
```

---

## 常见框架特征

| 框架 | 操作列选择器 | 特点 |
|------|-------------|------|
| ag-Grid | `.ag-cell .ax-col-last a` | 虚拟滚动，动态DOM |
| Ant Design Table | `.ant-table-cell .ant-space a` | Space组件包裹 |
| Element UI Table | `.el-table__body a` | 普通表格 |
| Bootstrap Table | `td a.btn` | 通常有btn类 |
| 通用 | `td:last-child a` | 最后一列 |

---

## 注意事项

1. **引用失效**: ag-Grid 虚拟滚动会动态销毁/创建DOM，`@e1` 引用可能失效
2. **事件冒泡**: 某些框架在父元素上绑定事件，点击子元素可能无效
3. **异步加载**: 点击后需要 `wait --load networkidle` 等待内容加载
4. **Shadow DOM**: 极少数组件使用 Shadow DOM，需要特殊处理
