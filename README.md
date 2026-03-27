<div align="center">

# 🔥 FORGE

**AI 驱动的 HYROX 训练教练**

**AI-Powered HYROX Training Coach**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[中文](#-中文介绍) · [English](#-english)

</div>

---

## 🇨🇳 中文介绍

### ✨ 功能特色

- **AI 微周期规划** — 根据你的体能、器械、比赛日期和 RPE 疲劳反馈，自动生成 7 天专属训练计划
- **精准配速引擎** — 输入目标完赛时间，精确计算每个站点的分段用时
- **AI 器械平替** — 健身房器械被占？AI 即时替换等效训练动作
- **PR 数据台账** — 记录 8 大 HYROX 站点个人最佳成绩，生成能力雷达图
- **RPE 反馈闭环** — AI 根据每周训练强度感受自动调整下一周的容量与难度
- **赛前智能减量** — 比赛前 2 周自动进入 Tapering 减量模式（削减 40% 容量）
- **中英文双语界面** — 支持中文 ⇔ English 实时切换

### 🚀 快速上手

```bash
# 1. 克隆仓库
git clone https://github.com/YOUR_USERNAME/forge-hyrox.git
cd forge-hyrox/hyrox-app

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入你自己的 API Key（见下方说明）

# 4. 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 🔑 环境变量说明

复制 `.env.example` 为 `.env.local` 并填写以下内容：

| 变量 | 说明 | 必填 |
|------|------|------|
| `ALIYUN_API_KEY` | 你的 LLM API Key（支持任何 Anthropic 兼容接口） | ✅ |
| `LLM_API_URL` | API 端点地址 | ✅ |
| `NEXTAUTH_SECRET` | NextAuth 密钥（生成命令：`openssl rand -base64 32`） | ✅ |
| `NEXTAUTH_URL` | 应用地址（本地开发填 `http://localhost:3000`） | ✅ |

**支持的 LLM 提供商（Anthropic 兼容接口）：**

| 提供商 | 推荐模型 | 说明 |
|--------|---------|------|
| [阿里云百炼 DashScope](https://dashscope.aliyuncs.com) | `qwen3.5-plus` | 默认，国内推荐 |
| [OpenRouter](https://openrouter.ai) | Claude / Qwen 系列 | 修改 `LLM_API_URL` |
| [Anthropic](https://anthropic.com) | `claude-3-5-sonnet` | 直连官方 |

### 📖 使用流程

1. **注册并完成初始档案** — 填写年龄、性别、体能等级、目标比赛日期
2. **生成训练计划** — AI 根据你的档案和可用器材生成 7 天微周期
3. **每日打卡** — 记录每次训练的用时和 RPE，AI 据此自动调整下周计划
4. **配速计算** — 输入目标完赛时间，查看各站点分段建议
5. **赛前减量** — 距比赛 ≤ 2 周时，AI 自动进入 Tapering 保护模式

---

## 🇬🇧 English

### ✨ Features

- **AI Microcycle Planner** — Generates a 7-day HYROX training plan via LLM, adapting to your fitness level, equipment, race date, and RPE feedback
- **Smart Pacing Engine** — Input your target finish time; get per-station split targets
- **Equipment Swap AI** — Can't access a machine? AI substitutes an equivalent movement instantly
- **PR Benchmark Tracker** — Log PRs for all 8 HYROX stations with a radar performance chart
- **RPE Feedback Loop** — AI adjusts volume and intensity each week based on how hard workouts felt
- **Race Tapering** — Automatically reduces volume by 40% in the final 2 weeks before race day
- **Bilingual UI** — Full Chinese ↔ English toggle

### 🚀 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/forge-hyrox.git
cd forge-hyrox/hyrox-app

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your own API keys (see below)

# 4. Run locally
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 🔑 Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

| Variable | Description | Required |
|----------|-------------|----------|
| `ALIYUN_API_KEY` | Your LLM API key (any Anthropic-compatible provider) | ✅ |
| `LLM_API_URL` | Anthropic-compatible API endpoint | ✅ |
| `NEXTAUTH_SECRET` | NextAuth secret (`openssl rand -base64 32`) | ✅ |
| `NEXTAUTH_URL` | Your app URL (`http://localhost:3000` for local dev) | ✅ |

**Supported LLM Providers (Anthropic-compatible):**

| Provider | Recommended Model | Notes |
|----------|------------------|-------|
| [Aliyun DashScope](https://dashscope.aliyuncs.com) | `qwen3.5-plus` | Default |
| [OpenRouter](https://openrouter.ai) | Any Claude/Qwen model | Update `LLM_API_URL` |
| [Anthropic](https://anthropic.com) | `claude-3-5-sonnet` | Direct API |

### 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth.js |
| State | Zustand |
| Charts | Recharts |
| AI | Anthropic-compatible LLM (Qwen3.5 by default) |

### 📖 How It Works

1. **Onboard** — Enter age, gender, fitness level, target race date and goal time
2. **Generate Plan** — AI builds a 7-day microcycle for your profile and equipment
3. **Train & Log** — Log each workout with time and RPE; AI adapts next week accordingly
4. **Pace** — Input target finish time → get per-station split targets
5. **Taper** — 2 weeks before race, AI automatically enters Tapering mode (−40% volume)

### 🤝 Contributing

Pull requests welcome! For major changes, please open an issue first.

---

## ⚠️ Disclaimer / 免责声明

FORGE is a training assistance tool, not a medical device. Always consult a qualified coach or doctor before starting an intensive training program.

FORGE 是训练辅助工具，非医疗设备。开始高强度训练计划前，请务必咨询专业教练或医生。

---

## License

[MIT](LICENSE)
