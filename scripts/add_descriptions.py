#!/usr/bin/env python3
"""给每篇文章的 frontmatter 补 description（搜索摘要 / OG 卡片描述用）。
值按文章实际内容手写；已存在的跳过。"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
POSTS = ROOT / "content" / "posts"

DESC = {
    "ai-coding-suite": "把 Claude Code、Codex、Cursor 凑成一套 AI 编程组合的用法与命令速查，从尚硅谷教程里整理出的实操笔记。",
    "damo-plugin-column": "易语言接入大漠插件的注册与绑定流程：机器码登记、类库生成、按读我步骤操作，一步步记下来。",
    "easylang-notes": "从零上手易语言的踩坑记录：调试能力弱、软件停止维护的老问题，以及一路用下来攒下的解决办法。",
    "finding-a-career": "找职业的自我梳理：从观察自己的性格与行为入手总结规律，再落到接受现实、明确方向。",
    "game-script-thinking": "图色游戏脚本的学习路线：按周拆到可落地的里程碑，从啃大漠函数说明书到攒出自己的能力对照表。",
    "job-interview-notes": "校招与求职的注意事项整理：从获取招聘信息的渠道，到面试各环节的要点，一张白板导图的文字版。",
    "longmen-project-notes": "机器视觉项目里的 C++ 面向对象实践：struct 与 class 的区别、封装思路，以及项目里真实代码的拆解。",
    "machine-vision-notes": "《嘲风机器视觉入行手册》的学习笔记：行业认知、常见检测方案与入行路径的梳理。",
    "plc-cooling-supply": "毕业设计：基于西门子 PLC 的厂房空调冷却水恒压供水系统，含 PID 调压、变频切换、HMI 与故障保护。",
    "python-basics": "Python 从零散常识到常用库的笔记：IDE 操作、语法要点、自动化小工具，边用边记的一本流水账。",
    "qml-course-notes": "跟着网易云音乐桌面端课程学 QML：从基本语法到完整做一个音乐播放器前端的全过程笔记。",
    "qt-cpp-course-notes": "C++/Qt 网课全程笔记：从 Qt 概述、信号槽到控件与事件循环，按上课日期整理的学习记录。",
    "qt-online-course-notes": "大丙学编程 Qt 网课的复习补充：对照 subingwen.cn 的课程，把要点和易错处再梳理一遍。",
    "renting-faq": "租房疑难解答：从户型配套、交通条件到合同与避坑，一份租房时要逐条对照的清单。",
    "tianye-academy-summary": "天野学院第六期模拟班课程学后总结：按「界面→设置→代码」的顺序整理函数与功能实现。",
    "weight-loss-diary": "一份不那么苦的减肥记录：从计划、饮食到执行，如实写下一个普通人的减脂过程。",
    "zhouxuan-career": "入行方向的思考与市场调研：想做软开就去学软开，别把不相干的知识勉强缝合。",
    "zhouxuan-course-notes": "周旋课程的学习补充笔记：把课堂内容里没讲透、需要自己补的地方逐条记下。",
}


def main():
    n = 0
    for p in sorted(POSTS.glob("*.md")):
        slug = p.stem
        if slug not in DESC:
            continue
        text = p.read_text(encoding="utf-8")
        if re.search(r"(?m)^description\s*=", text):
            print(f"skip {slug}（已有 description）"); continue
        m = re.match(r"^(\+\+\+\n)(.*?)(\n\+\+\+\n)", text, re.S)
        if not m:
            print(f"skip {slug}（无 frontmatter）"); continue
        head, fm, tail = m.groups()
        # 插在 images 行之前（若有），否则追加到 frontmatter 末尾
        desc_line = f'description = "{DESC[slug]}"'
        if re.search(r"(?m)^images\s*=", fm):
            fm2 = re.sub(r"(?m)^(images\s*=)", desc_line + "\n" + r"\1", fm)
        else:
            fm2 = fm.rstrip("\n") + "\n" + desc_line
        p.write_text(head + fm2 + tail + text[m.end():], encoding="utf-8")
        n += 1
        print(f"✓ {slug}")
    print(f"共补 {n} 篇")


if __name__ == "__main__":
    main()