+++
title = '占位文:代码高亮效果测试'
date = '2026-09-21'
tags = ['测试']
draft = false
+++

这篇没有实际内容,纯粹用来展示博客的代码块长什么样。满意的话可以删掉。

## Python

```python
def lazy(name: str) -> str:
    """懒人的问候函数,连 return 都懒得换行。"""
    return f"你好,{name},别催更。"

print(lazy("慢公子"))
```

## JavaScript

```javascript
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log("先躺一会儿");
  await sleep(1000);
  console.log("躺好了,继续躺");
}
```

## 表格与引用

| 事项 | 计划 | 实际 |
| ---- | ---- | ---- |
| 更新频率 | 每周一篇 | 随缘 |
| 文章质量 | 篇篇精品 | 见仁见智 |

> 代码块右上角有复制按钮,主题自带,没写一行 JS。
