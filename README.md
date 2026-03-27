<div align="center">

# 🔥 FORGE

**Your Pocket AI HYROX Coach | 你的随身 AI 混拓教练**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[中文](#-中文介绍) · [English](#-english)

</div>

---

## 💡 The Story Behind FORGE / 开发初衷

*Hi! I'm Mervyn, a heavy HYROX enthusiast and AI geek.*

As someone who loves HYROX and travels frequently, I often found myself in hotel gyms or local fitness centers lacking specific equipment (like a sled or a SkiErg). I wanted a personal coach in my pocket—one that could not only generate a structured HYROX training plan but also dynamically swap exercises based on available equipment, track my PRs, and adjust my next week's volume based on my fatigue levels.

That's why I built **FORGE**. It's a prototype designed to let anyone have a personalized HYROX coach on their phone or laptop. Of course, nothing beats going to a real gym and taking classes with professional coaches, but FORGE is here to fill the gaps when you're on the road or training solo.

*(Note: This is a fan-made project and is **NOT** an official HYROX application. No official HYROX logos or trademarks are used.)*

---

## 🇨🇳 中文介绍

### ✨ 核心亮点

- **随身口袋教练** — 无论出差在酒店还是普通健身房，用手机或电脑就能获取专属训练计划。
- **AI 智能器械平替** — 健身房没有雪橇车？没有滑雪机？AI 会根据你现有的器械，即时生成等效的代谢和肌肉刺激替换动作。
- **动态微周期规划** — 根据你的体能、比赛日期和每周的 RPE 疲劳反馈，自动生成和调整 7 天专属训练计划。
- **精准配速引擎 & PR 台账** — 输入目标完赛时间，精确计算每个站点的分段用时。记录 8 大 HYROX 站点个人最佳成绩。
- **赛前智能减量** — 比赛前 2 周自动进入 Tapering 减量模式，削减 40% 容量以储备体能。
- **中英文双语** — 界面与 AI 生成内容全面支持中文 ⇔ English 实时切换。

### 💬 交流与反馈

我只是一个热爱 HYROX 和折腾 AI 的技术爱好者。这是一个早期的 Prototype（原型），如果你也对 HYROX 或 AI 应用开发感兴趣，或者用了 FORGE 觉得有想吐槽/建议的地方，**非常欢迎加我微信交流！**

<div align="center">
  <img src="./public/wechat-qr.jpg" alt="Mervyn WeChat QR Code" width="250" />
</div>

### 🚀 快速上手

```bash
git clone https://github.com/mervyntsui-cmyk/forge-hyrox.git
cd forge-hyrox
npm install
cp .env.example .env.local  # 填入你的大模型 API Key（如阿里云百炼、Claude、OpenRouter 等）
npm run dev
```

---

## 🇬🇧 English

### ✨ Key Features

- **Pocket Coach Anywhere** — Whether you're traveling, in a hotel, or at a local gym without specialized equipment, FORGE has your back.
- **AI Equipment Swap** — No Sled? No SkiErg? The AI will instantly generate a structural replacement block to match the intended metabolic and muscular stimulus.
- **Dynamic Microcycles** — Generates a 7-day HYROX training plan via LLM, adapting to your fitness level, race date, and RPE feedback loop.
- **Smart Pacing & PRs** — Input your target finish time to get per-station split targets. Log PRs for all 8 HYROX stations with a radar performance chart.
- **Race Tapering** — Automatically reduces volume by 40% in the final 2 weeks before race day.
- **Bilingual UI** — Full Chinese ↔ English toggle for both the interface and AI-generated workouts.

### 💬 Let's Connect

If you're also a HYROX enthusiast, an AI developer, or simply someone who finds this prototype useful (or buggy!), I'd love to chat. Feel free to connect via WeChat (scan the QR code in the Chinese section above) or open an issue on GitHub.

### 🚀 Quick Start

```bash
git clone https://github.com/mervyntsui-cmyk/forge-hyrox.git
cd forge-hyrox
npm install
cp .env.example .env.local  # Insert your LLM API Key (Anthropic-compatible endpoint)
npm run dev
```

---

## ⚠️ 免责声明 / Disclaimer

FORGE 是训练辅助工具，非医疗设备。开始高强度训练前，建议大家去线下场馆上课并咨询专业教练。**本项目为个人爱好之作，非 HYROX 官方应用，也未使用官方 Logo。**

FORGE is a training assistance tool. Always consult a qualified coach before starting an intensive training program. Going to actual classes at an affiliated gym is highly recommended! **This is a fan-made personal project and is NOT an official HYROX app, nor does it use any official logos.**

---

## License

[MIT](LICENSE)
