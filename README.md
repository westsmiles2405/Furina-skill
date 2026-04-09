# 🎭 芙宁娜工作陪伴 — VS Code Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-%5E1.85.0-007ACC?logo=visual-studio-code)](https://code.visualstudio.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)

> *"聚光灯已经落下来了，别发呆。"*

让枫丹水神**芙宁娜**以大导演身份陪伴你的 VS Code 工作之旅。她会用戏剧化又傲娇的方式监督你的进度、帮你拆任务、在你低落时笨拙地安慰你、帮你做番茄钟专注——并在一天结束时为你优雅谢幕。

<!-- 如有截图，取消注释下面这行并替换为实际路径 -->
<!-- ![芙宁娜的舞台](media/screenshot.png) -->

---

## ✨ 功能一览

| 功能 | 命令 | 说明 |
|------|------|------|
| 🎬 开启今日舞台 | `芙宁娜：开启今日舞台` | 根据时间段生成个性化开场白 |
| ⏱ 番茄钟专注 | `芙宁娜：开始番茄钟专注` | 25 分钟专注 + 5 分钟休息，芙宁娜全程监督 |
| ⏹ 结束番茄钟 | `芙宁娜：结束番茄钟` | 提前结束当前番茄钟 |
| 💪 给我打气 | `芙宁娜：给我打气` | 获得一段戏剧化的鼓舞 |
| ⚖️ 审判代码 | `芙宁娜：审判我的代码` | 以审判席形式展示当前代码错误 |
| 🎭 今日谢幕 | `芙宁娜：今日谢幕` | 一天结束时的优雅总结 |
| 🎬 即兴独白 | `芙宁娜：即兴独白` | 一段戏剧化的芙宁娜独白 |
| 🍰 甜品时间 | `芙宁娜：甜品时间` | 芙宁娜推荐一款甜品放松心情 |
| 🌊 聊聊那维莱特 | `芙宁娜：聊聊那维莱特` | 提起那维莱特的彩蛋对话 |

## 🎪 侧边栏面板

活动栏会出现芙宁娜的图标，点击即可打开 **"芙宁娜的舞台"** 聊天面板：
- 支持自由对话——芙宁娜会根据关键词分析你的意图并给出角色化回复
- 每保存 10 次文件，她会主动插一句陪工台词
- 长时间未操作时，她会发出傲娇提醒
- 80+ 条手写台词，覆盖开场、工作、鼓舞、安抚、审判、谢幕等 8 大场景

## ⚙️ 配置项

| 设置 | 默认值 | 说明 |
|------|--------|------|
| `furina.pomodoroMinutes` | 25 | 番茄钟专注时长（分钟） |
| `furina.breakMinutes` | 5 | 休息时长（分钟） |
| `furina.enableIdleReminder` | true | 是否在长时间未操作时提醒 |
| `furina.idleMinutes` | 30 | 闲置多少分钟后提醒 |
| `furina.enableStatusBar` | true | 是否在状态栏显示芙宁娜 |

## 🚀 快速开始

### 从源码运行

```bash
git clone https://github.com/westsmiles2405/Furina-skill.git
cd Furina-skill
npm install
npm run compile
```

然后在 VS Code 中按 **F5** 启动 Extension Development Host 进行调试。

### 安装 .vsix 包

如果你有打包好的 `.vsix` 文件：

```bash
code --install-extension furina-companion-0.1.0.vsix
```

## 📁 项目结构

```
furina-companion/
├── src/
│   ├── extension.ts      # 扩展入口：命令注册、事件绑定
│   ├── persona.ts        # 芙宁娜人格引擎：台词库 + 场景回复
│   ├── dynamicReply.ts   # 动态回复：关键词意图分析 + 情境回复
│   ├── chatPanel.ts      # Webview 侧边栏聊天面板
│   ├── pomodoro.ts       # 番茄钟计时器
│   └── idleWatcher.ts    # 闲置检测
├── media/
│   ├── furina-icon.svg   # 活动栏图标
│   └── furina-icon.png   # Marketplace 图标
├── package.json
├── tsconfig.json
├── LICENSE               # MIT
└── README.md
```

## 🤝 参与贡献

欢迎 Fork 并提交 PR！无论是新增台词、改进 UI、还是添加新功能，都非常欢迎。

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: 添加某个功能'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📝 特别说明

此项目只是一个简单而有趣的想法，欢迎各位朋友一起来完善。角色形象与台词灵感来自 miHoYo 旗下游戏《原神》中的芙宁娜，仅供个人学习与娱乐用途。

## 📄 许可证

[MIT](LICENSE) © 2025
