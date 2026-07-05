# AnyNote

English | [简体中文](#简体中文)

A lightweight text / code / Markdown sharing service built on Cloudflare Workers + KV. Save a note by key, then read it back as plain text, raw HTML, a rendered Markdown page, or a syntax-highlighted Gist view.

Live demo: https://note.linkof.link

## Features

- **One key, four views** — the same note is available as source, `.html`, `.md`, and `.gist`.
- **Rendered Markdown** — GitHub-style page via `marked`, sanitized with `DOMPurify`, code highlighted by `highlight.js`.
- **Gist view** — read-only code viewer with automatic language detection, line numbers, and a copy button.
- **China-friendly CDN** — visitors from CN are automatically served assets from a jsDelivr mirror (`cdn.jsdmirror.com`).
- **Zero server** — runs entirely on Cloudflare's edge, notes live in a KV namespace.

## API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Redirects to the static web UI. |
| `POST` | `/set` | Save a note. Body: `{ "key": "...", "value": "..." }` (JSON or form). Returns links to all views. |
| `GET` | `/<key>` | Raw note content. |
| `GET` | `/<key>.html` | Renders the note as raw HTML. |
| `GET` | `/<key>.md` | Renders the note as a Markdown page. |
| `GET` | `/<key>.gist` | Renders the note as a highlighted code view. |
| `GET` | `/list?passwd=<secret>` | Lists all note keys. Requires the `LIST_PASSWD` secret. |

### Save a note

```bash
curl -X POST https://note.linkof.link/set \
  -H "Content-Type: application/json" \
  -d '{"key":"hello","value":"# Hello\n\nsome **markdown**"}'
```

Then open any of:

- `https://note.linkof.link/hello` — raw text
- `https://note.linkof.link/hello.md` — Markdown page
- `https://note.linkof.link/hello.gist` — code view

## Deploy

Requires a Cloudflare account and [Wrangler](https://developers.cloudflare.com/workers/wrangler/).

```bash
# 1. Create a KV namespace
npx wrangler kv namespace create NOTE

# 2. Configure wrangler.toml (copy the example and fill in your KV id)
cp wrangler.toml.example wrangler.toml

# 3. Deploy
npx wrangler deploy
```

### `/list` password (recommended)

The `/list` endpoint is protected by the `LIST_PASSWD` secret. If it is not set, `/list` refuses every request (fail-closed). Never hardcode the password in source.

```bash
npx wrangler secret put LIST_PASSWD
```

## Security notes

- Notes are readable by anyone who knows the key — treat keys like unlisted URLs, not access control.
- `/set` is unauthenticated by design; put it behind your own auth if you deploy publicly.
- `.html` notes are rendered as raw HTML with no sanitization — only store HTML you trust.

---

## 简体中文

[English](#anynote) | 简体中文

基于 Cloudflare Workers + KV 的轻量文本 / 代码 / Markdown 分享服务。用一个 key 保存笔记，即可以纯文本、原始 HTML、渲染后的 Markdown 页面，或带语法高亮的 Gist 视图读取。

在线示例：https://note.linkof.link

### 特性

- **一个 key，四种视图** — 同一份笔记支持源文本、`.html`、`.md`、`.gist`。
- **Markdown 渲染** — 用 `marked` 生成 GitHub 风格页面，`DOMPurify` 做净化，`highlight.js` 高亮代码。
- **Gist 视图** — 只读代码查看器，自动识别语言、带行号和复制按钮。
- **中国 CDN 友好** — 来自中国大陆的访客自动切换到 jsDelivr 镜像（`cdn.jsdmirror.com`）。
- **无需服务器** — 完全跑在 Cloudflare 边缘，笔记存在 KV 里。

### 接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/` | 跳转到静态前端页面。 |
| `POST` | `/set` | 保存笔记。请求体：`{ "key": "...", "value": "..." }`（JSON 或表单）。返回各视图链接。 |
| `GET` | `/<key>` | 笔记原始内容。 |
| `GET` | `/<key>.html` | 以原始 HTML 渲染。 |
| `GET` | `/<key>.md` | 以 Markdown 页面渲染。 |
| `GET` | `/<key>.gist` | 以高亮代码视图渲染。 |
| `GET` | `/list?passwd=<secret>` | 列出所有笔记 key，需要 `LIST_PASSWD` 密钥。 |

#### 保存笔记

```bash
curl -X POST https://note.linkof.link/set \
  -H "Content-Type: application/json" \
  -d '{"key":"hello","value":"# 你好\n\n一些 **Markdown**"}'
```

然后打开任意一个：

- `https://note.linkof.link/hello` — 原始文本
- `https://note.linkof.link/hello.md` — Markdown 页面
- `https://note.linkof.link/hello.gist` — 代码视图

### 部署

需要 Cloudflare 账号和 [Wrangler](https://developers.cloudflare.com/workers/wrangler/)。

```bash
# 1. 创建 KV namespace
npx wrangler kv namespace create NOTE

# 2. 配置 wrangler.toml（复制示例并填入你的 KV id）
cp wrangler.toml.example wrangler.toml

# 3. 部署
npx wrangler deploy
```

#### `/list` 口令（推荐）

`/list` 接口由 `LIST_PASSWD` 密钥保护。若未设置，`/list` 会拒绝所有请求（fail-closed）。切勿把口令硬编码进源码。

```bash
npx wrangler secret put LIST_PASSWD
```

### 安全须知

- 知道 key 的人都能读取对应笔记 —— 请把 key 当作「不公开的链接」，而非访问控制。
- `/set` 默认无鉴权；若公开部署，请自行在前面加一层认证。
- `.html` 笔记按原始 HTML 渲染、不做净化 —— 只存放你信任的 HTML。
