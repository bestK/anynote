// LIST_PASSWD 由 Cloudflare Worker 密钥注入（Service Worker 格式下密钥以全局变量暴露）。
// 配置：wrangler secret put LIST_PASSWD  （或在 Dashboard -> Settings -> Variables 添加）
// 未配置时 /list 接口一律拒绝访问，不再使用硬编码默认口令。

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});
const static_ui = 'https://bestk.github.io/anynote';
const server_api = `https://note.linkof.link`;
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Headers':
        'Origin, X-Requested-With, Content-Type, Accept',
};
// 首页（内联，避免依赖外部 gh-page）。前端脚本里的 ${...} 需转义为 \${...}
const HOME_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AnyNote · share text, code & markdown</title>
  <style>
    :root {
      --page-bg: #f6f3ea;
      --paper-bg: #fffdf7;
      --ink: #24221f;
      --muted: #706b62;
      --line: #ded7c8;
      --accent: #2f6f73;
      --accent-ink: #ffffff;
      --accent-soft: rgba(47, 111, 115, 0.12);
      --code-bg: #0f1717;
    }
    * { box-sizing: border-box; }
    html { -webkit-text-size-adjust: 100%; }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background:
        radial-gradient(circle at top left, rgba(47, 111, 115, 0.14), transparent 32rem),
        var(--page-bg);
      color: var(--ink);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 16px;
      line-height: 1.6;
    }
    .shell {
      width: min(100% - 32px, 720px);
      margin: 0 auto;
      padding: clamp(28px, 7vw, 72px) 0 32px;
      flex: 1 0 auto;
    }
    header { margin-bottom: 24px; }
    .brand {
      display: inline-flex;
      align-items: baseline;
      gap: 10px;
      font-size: clamp(2rem, 6vw, 2.8rem);
      font-weight: 780;
      letter-spacing: -0.04em;
    }
    .brand .dot { color: var(--accent); }
    .tagline { margin: 6px 0 0; color: var(--muted); }
    .card {
      padding: clamp(18px, 4vw, 28px);
      border: 1px solid var(--line);
      border-radius: 22px;
      background: rgba(255, 253, 247, 0.94);
      box-shadow: 0 24px 80px rgba(47, 41, 31, 0.12);
    }
    label { display: block; font-weight: 640; margin-bottom: 8px; }
    textarea {
      width: 100%;
      min-height: 220px;
      padding: 14px 16px;
      border: 1px solid var(--line);
      border-radius: 14px;
      background: var(--paper-bg);
      color: var(--ink);
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 14px;
      line-height: 1.6;
      resize: vertical;
    }
    textarea:focus,
    input:focus { outline: 3px solid var(--accent-soft); outline-offset: 2px; border-color: var(--accent); }
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 14px;
      margin-top: 16px;
    }
    .field { flex: 1 1 220px; }
    .field input {
      width: 100%;
      padding: 11px 14px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: var(--paper-bg);
      color: var(--ink);
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 14px;
    }
    .hint { margin: 6px 2px 0; font-size: 12.5px; color: var(--muted); }
    button {
      appearance: none;
      border: 0;
      border-radius: 12px;
      padding: 12px 26px;
      background: var(--accent);
      color: var(--accent-ink);
      font-size: 15px;
      font-weight: 640;
      cursor: pointer;
      transition: transform 0.12s, opacity 0.12s;
    }
    button:hover { opacity: 0.92; }
    button:active { transform: translateY(1px); }
    button:disabled { opacity: 0.5; cursor: default; }
    .result { margin-top: 22px; display: none; }
    .result.show { display: block; }
    .result h2 { margin: 0 0 12px; font-size: 1rem; color: var(--muted); font-weight: 640; }
    .link-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: var(--paper-bg);
      margin-bottom: 10px;
    }
    .link-row .tag {
      flex: 0 0 78px;
      font: 600 11px ui-monospace, monospace;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--accent);
    }
    .link-row a {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--ink);
      text-decoration: none;
      font-family: ui-monospace, monospace;
      font-size: 13px;
    }
    .link-row a:hover { text-decoration: underline; }
    .copy {
      flex: 0 0 auto;
      padding: 5px 12px;
      font-size: 12.5px;
      border-radius: 8px;
      background: transparent;
      color: var(--accent);
      border: 1px solid var(--line);
      font-weight: 600;
    }
    .error { margin-top: 14px; color: #b3261e; font-size: 14px; min-height: 1.2em; }
    footer {
      flex-shrink: 0;
      padding: 20px 0 28px;
      text-align: center;
      color: var(--muted);
      font-size: 13px;
    }
    footer a { color: var(--accent); }
    @media (max-width: 480px) {
      .card { border-radius: 16px; }
      #submit { width: 100%; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header>
      <div class="brand">AnyNote<span class="dot">.</span></div>
      <p class="tagline">Share text, code &amp; markdown with a single link.</p>
    </header>

    <section class="card">
      <label for="note">Your note</label>
      <textarea id="note" placeholder="Paste text, code, or markdown here…" autofocus></textarea>

      <div class="row">
        <div class="field">
          <input id="key" type="text" placeholder="custom-key (optional)" autocomplete="off" spellcheck="false" />
          <p class="hint">Leave blank for a random key. Letters, digits, - and _ only.</p>
        </div>
        <button id="submit" type="button">Create link</button>
      </div>

      <p class="error" id="error"></p>

      <div class="result" id="result">
        <h2>Your links</h2>
        <div id="links"></div>
      </div>
    </section>
  </main>

  <footer>
    Open source on
    <a href="https://github.com/bestK/anynote" target="_blank" rel="noopener">GitHub</a>
    · runs on Cloudflare Workers
  </footer>

  <script>
    const api = location.protocol + '//' + location.host;
    const noteEl = document.getElementById('note');
    const keyEl = document.getElementById('key');
    const btn = document.getElementById('submit');
    const errEl = document.getElementById('error');
    const resultEl = document.getElementById('result');
    const linksEl = document.getElementById('links');

    const VIEWS = [
      { tag: 'source', suffix: '' },
      { tag: 'html', suffix: '.html' },
      { tag: 'markdown', suffix: '.md' },
      { tag: 'gist', suffix: '.gist' },
    ];

    function randomKey(n) {
      const cs = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let s = '';
      for (let i = 0; i < n; i++) s += cs[Math.floor(Math.random() * cs.length)];
      return s;
    }

    function renderLinks(key) {
      linksEl.textContent = '';
      for (const v of VIEWS) {
        const href = api + '/' + encodeURIComponent(key) + v.suffix;
        const row = document.createElement('div');
        row.className = 'link-row';

        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = v.tag;

        const a = document.createElement('a');
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = href;

        const copy = document.createElement('button');
        copy.className = 'copy';
        copy.type = 'button';
        copy.textContent = 'Copy';
        copy.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(href);
            copy.textContent = 'Copied';
            setTimeout(() => { copy.textContent = 'Copy'; }, 1400);
          } catch (e) {
            copy.textContent = 'Failed';
            setTimeout(() => { copy.textContent = 'Copy'; }, 1400);
          }
        });

        row.append(tag, a, copy);
        linksEl.appendChild(row);
      }
      resultEl.classList.add('show');
    }

    async function submit() {
      const value = noteEl.value;
      errEl.textContent = '';
      if (!value.trim()) {
        errEl.textContent = 'Note must not be empty.';
        return;
      }
      let key = keyEl.value.trim();
      if (key && !/^[A-Za-z0-9_-]+$/.test(key)) {
        errEl.textContent = 'Key may contain letters, digits, - and _ only.';
        return;
      }
      if (!key) key = randomKey(6);

      btn.disabled = true;
      btn.textContent = 'Saving…';
      try {
        const res = await fetch(api + '/set', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          body: JSON.stringify({ key, value }),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        renderLinks(key);
      } catch (e) {
        errEl.textContent = 'Failed to save: ' + e.message;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Create link';
      }
    }

    btn.addEventListener('click', submit);
    noteEl.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
    });
  </script>
</body>
</html>`;

async function handleRequest(request) {
    url = new URL(request.url);

    if (url.pathname === '/') {
        return new Response(HOME_HTML, {
            headers: {
                'content-type': 'text/html;charset=UTF-8',
                'X-Content-Type-Options': 'nosniff',
                'Referrer-Policy': 'no-referrer',
            },
        });
    }

    if (url.pathname === '/set') {
        const { key, value } = await readRequestBody(request);
        await NOTE.put(key, value);
        let res =
            `SOURCE: <a href = "${server_api}/${key}" target="_blank">${server_api}/${key}</a>` +
            `<br/>HTML: <a href = "${server_api}/${key}.html" target="_blank">${server_api}/${key}.html</a>` +
            `<br/>MARKDOWN: <a href = "${server_api}/${key}.md" target="_blank">${server_api}/${key}.md</a>` +
            `<br/>GIST: <a href = "${server_api}/${key}.gist" target="_blank">${server_api}/${key}.gist</a>`;
        return new Response(res, { headers: corsHeaders });
    }

    if (url.pathname === '/list') {
        // 未配置密钥则拒绝，避免误开放
        const expected = typeof LIST_PASSWD !== 'undefined' ? LIST_PASSWD : null;
        const passwd = url.searchParams.get('passwd');
        if (!expected || passwd !== expected) {
            return new Response('Password not correct', { status: 401 });
        }
        const value = await NOTE.list();
        const key_list = value.keys.map(k => k.name);
        return new Response(key_list.join('\r\n'));
    }

    if (url.pathname !== '') {
        key = url.pathname.split('/')[1];
        const isHtml = key.endsWith('.html');
        const isMD = key.endsWith('.md');
        const isGist = key.endsWith('.gist');
        if (isHtml || isMD || isGist) {
            key = key.split('.')[0];
        }
        const value = await NOTE.get(key);

        const { cf } = request;

        // 检查 IP 是否来自中国
        const isChina = cf && cf.country === 'CN';
        const jsdelivrHost = isChina
            ? 'cdn.jsdmirror.com'
            : 'cdn.jsdelivr.net';

        if (isHtml) {
            const html = `<!DOCTYPE html>
          <body>
            ${value}
          </body>`;
            return new Response(html, {
                headers: {
                    'content-type': 'text/html;charset=UTF-8',
                },
            });
        } else if (isMD) {
            if (value === null) {
                return new Response('Note not found', {
                    status: 404,
                    headers: {
                        'content-type': 'text/plain;charset=UTF-8',
                        'X-Content-Type-Options': 'nosniff',
                        'Referrer-Policy': 'no-referrer',
                    },
                });
            }

            const markdown = JSON.stringify(value || '').replace(/</g, '\\u003c');
            const html = `<!doctype html>
                        <html lang="zh-CN">
                        <head>
                          <meta charset="utf-8" />
                          <meta name="viewport" content="width=device-width, initial-scale=1" />
                          <title>AnyNote Markdown Preview</title>
                          <link rel="stylesheet" href="https://${jsdelivrHost}/npm/@highlightjs/cdn-assets@11.9.0/styles/github-dark.min.css" />
                          <style>
                            :root {
                              --page-bg: #f6f3ea;
                              --paper-bg: #fffdf7;
                              --ink: #24221f;
                              --muted: #706b62;
                              --line: #ded7c8;
                              --accent: #2f6f73;
                              --accent-soft: rgba(47, 111, 115, 0.12);
                              --code-bg: #162021;
                            }

                            * {
                              box-sizing: border-box;
                            }

                            html {
                              -webkit-text-size-adjust: 100%;
                            }

                            body {
                              margin: 0;
                              min-height: 100vh;
                              background:
                                radial-gradient(circle at top left, rgba(47, 111, 115, 0.14), transparent 32rem),
                                var(--page-bg);
                              color: var(--ink);
                              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                              font-size: clamp(16px, 1.6vw, 18px);
                              line-height: 1.75;
                            }

                            .page-shell {
                              width: min(100% - 32px, 860px);
                              margin: 0 auto;
                              padding: clamp(24px, 6vw, 72px) 0;
                            }

                            .markdown-body {
                              overflow: hidden;
                              padding: clamp(22px, 5vw, 56px);
                              border: 1px solid var(--line);
                              border-radius: 28px;
                              background: rgba(255, 253, 247, 0.94);
                              box-shadow: 0 24px 80px rgba(47, 41, 31, 0.12);
                            }

                            .markdown-body:empty::before {
                              content: 'This note is empty.';
                              color: var(--muted);
                            }

                            .markdown-body > :first-child {
                              margin-top: 0;
                            }

                            .markdown-body > :last-child {
                              margin-bottom: 0;
                            }

                            .markdown-body h1,
                            .markdown-body h2,
                            .markdown-body h3,
                            .markdown-body h4,
                            .markdown-body h5,
                            .markdown-body h6 {
                              margin: 1.7em 0 0.65em;
                              color: var(--ink);
                              font-weight: 760;
                              line-height: 1.18;
                              letter-spacing: -0.035em;
                            }

                            .markdown-body h1 {
                              padding-bottom: 0.45em;
                              border-bottom: 1px solid var(--line);
                              font-size: clamp(2.1rem, 7vw, 3.7rem);
                            }

                            .markdown-body h2 {
                              font-size: clamp(1.55rem, 4.5vw, 2.25rem);
                            }

                            .markdown-body h3 {
                              font-size: clamp(1.25rem, 3.2vw, 1.55rem);
                            }

                            .markdown-body p,
                            .markdown-body ul,
                            .markdown-body ol,
                            .markdown-body blockquote,
                            .markdown-body pre,
                            .markdown-body table {
                              margin: 1.1em 0;
                            }

                            .markdown-body a {
                              color: var(--accent);
                              text-decoration-thickness: 0.08em;
                              text-underline-offset: 0.18em;
                              overflow-wrap: anywhere;
                            }

                            .markdown-body a:focus-visible {
                              outline: 3px solid var(--accent-soft);
                              outline-offset: 3px;
                              border-radius: 4px;
                            }

                            .markdown-body blockquote {
                              margin-left: 0;
                              padding: 0.1rem 0 0.1rem 1.1rem;
                              border-left: 4px solid var(--accent);
                              color: var(--muted);
                              background: linear-gradient(90deg, var(--accent-soft), transparent 75%);
                            }

                            .markdown-body hr {
                              height: 1px;
                              margin: 2rem 0;
                              border: 0;
                              background: var(--line);
                            }

                            .markdown-body img {
                              max-width: 100%;
                              height: auto;
                              border-radius: 18px;
                            }

                            .markdown-body table {
                              display: block;
                              width: 100%;
                              border-collapse: collapse;
                              overflow-x: auto;
                              -webkit-overflow-scrolling: touch;
                            }

                            .markdown-body th,
                            .markdown-body td {
                              padding: 0.65rem 0.8rem;
                              border: 1px solid var(--line);
                              text-align: left;
                              vertical-align: top;
                            }

                            .markdown-body th {
                              background: rgba(47, 111, 115, 0.08);
                              font-weight: 700;
                            }

                            .markdown-body :not(pre) > code {
                              padding: 0.16em 0.38em;
                              border-radius: 0.4em;
                              background: var(--accent-soft);
                              color: #244f52;
                              font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
                              font-size: 0.9em;
                            }

                            .markdown-body pre {
                              max-width: 100%;
                              padding: 1rem;
                              overflow-x: auto;
                              border: 1px solid rgba(255, 255, 255, 0.08);
                              border-radius: 16px;
                              background: var(--code-bg);
                              box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
                              -webkit-overflow-scrolling: touch;
                            }

                            .markdown-body pre code {
                              display: block;
                              padding: 0;
                              background: transparent;
                              color: inherit;
                              font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
                              font-size: 0.9rem;
                              line-height: 1.65;
                            }

                            @media (max-width: 560px) {
                              .page-shell {
                                width: min(100% - 20px, 860px);
                                padding: 10px 0;
                              }

                              .markdown-body {
                                border-radius: 18px;
                              }
                            }
                          </style>
                        </head>
                        <body>
                          <main class="page-shell">
                            <article id="content" class="markdown-body"></article>
                          </main>
                          <script src="https://${jsdelivrHost}/npm/marked@12.0.2/marked.min.js"></script>
                          <script src="https://${jsdelivrHost}/npm/dompurify@3.1.6/dist/purify.min.js"></script>
                          <script src="https://${jsdelivrHost}/npm/@highlightjs/cdn-assets@11.9.0/highlight.min.js"></script>
                          <script>
                            const markdown = ${markdown};
                            const content = document.getElementById('content');

                            try {
                              marked.setOptions({
                                gfm: true,
                                breaks: false,
                              });

                              const rawHtml = marked.parse(markdown);
                              const cleanHtml = DOMPurify.sanitize(rawHtml, {
                                USE_PROFILES: { html: true },
                              });

                              content.innerHTML = cleanHtml;

                              if (window.hljs) {
                                content.querySelectorAll('pre code').forEach((block) => {
                                  hljs.highlightElement(block);
                                });
                              }

                              content.querySelectorAll('a[href]').forEach((link) => {
                                if (link.hostname !== location.hostname) {
                                  link.target = '_blank';
                                  link.rel = 'noopener noreferrer';
                                }
                              });

                              const title = content.querySelector('h1');
                              if (title && title.textContent.trim()) {
                                document.title = title.textContent.trim();
                              }
                            } catch (error) {
                              content.textContent = markdown || 'This note is empty.';
                            }
                          </script>
                        </body>
                        </html>`;
            return new Response(html, {
                headers: {
                    'content-type': 'text/html;charset=UTF-8',
                    'X-Content-Type-Options': 'nosniff',
                    'Referrer-Policy': 'no-referrer',
                },
            });
        } else if (isGist) {
            if (value === null) {
                return new Response('Note not found', {
                    status: 404,
                    headers: {
                        'content-type': 'text/plain;charset=UTF-8',
                        'X-Content-Type-Options': 'nosniff',
                        'Referrer-Policy': 'no-referrer',
                    },
                });
            }

            const gistCode = JSON.stringify(value || '').replace(/</g, '\\u003c');
            const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AnyNote Gist</title>
  <link rel="stylesheet" href="https://${jsdelivrHost}/npm/@highlightjs/cdn-assets@11.9.0/styles/github-dark.min.css" />
  <style>
    :root {
      --page-bg: #f6f3ea;
      --ink: #24221f;
      --line: #ded7c8;
      --accent: #2f6f73;
      --code-bg: #0f1717;
      --bar-bg: #1b2626;
      --gutter: #4a5657;
    }
    * { box-sizing: border-box; }
    html { -webkit-text-size-adjust: 100%; }
    body {
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(circle at top left, rgba(47, 111, 115, 0.14), transparent 32rem),
        var(--page-bg);
      color: var(--ink);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .gist-shell {
      width: min(100% - 32px, 1000px);
      margin: 0 auto;
      padding: clamp(16px, 4vw, 48px) 0;
    }
    .gist-card {
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 18px;
      overflow: hidden;
      background: var(--code-bg);
      box-shadow: 0 24px 80px rgba(47, 41, 31, 0.18);
    }
    .gist-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 16px;
      background: var(--bar-bg);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .gist-lang {
      font: 600 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #9fb3b0;
    }
    .gist-copy {
      appearance: none;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 8px;
      padding: 5px 12px;
      background: transparent;
      color: #d6e2e0;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
    }
    .gist-copy:hover { background: rgba(255, 255, 255, 0.08); }
    .gist-copy:active { transform: translateY(1px); }
    .gist-body {
      display: flex;
      max-height: 82vh;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
      font-size: clamp(12.5px, 1.4vw, 14px);
      line-height: 1.6;
    }
    .gist-gutter {
      flex: 0 0 auto;
      padding: 16px 12px 16px 16px;
      text-align: right;
      color: var(--gutter);
      background: rgba(0, 0, 0, 0.22);
      user-select: none;
      white-space: pre;
    }
    .gist-body pre {
      margin: 0;
      flex: 1 1 auto;
      padding: 16px;
      overflow: visible;
    }
    .gist-body code {
      background: transparent;
      padding: 0;
      white-space: pre;
    }
    @media (max-width: 560px) {
      .gist-shell { width: min(100% - 16px, 1000px); padding: 8px 0; }
      .gist-card { border-radius: 12px; }
    }
  </style>
</head>
<body>
  <main class="gist-shell">
    <div class="gist-card">
      <div class="gist-bar">
        <span class="gist-lang" id="lang">code</span>
        <button class="gist-copy" id="copy" type="button">复制</button>
      </div>
      <div class="gist-body">
        <div class="gist-gutter" id="gutter" aria-hidden="true">1</div>
        <pre><code id="code" class="hljs"></code></pre>
      </div>
    </div>
  </main>
  <script src="https://${jsdelivrHost}/npm/@highlightjs/cdn-assets@11.9.0/highlight.min.js"></script>
  <script>
    const source = ${gistCode};
    const codeEl = document.getElementById('code');
    const gutterEl = document.getElementById('gutter');
    const langEl = document.getElementById('lang');

    // 行号：按源码实际行数生成，与代码逐行对齐
    const lineCount = source.split('\\n').length;
    gutterEl.textContent = Array.from({ length: lineCount }, (_, i) => i + 1).join('\\n');

    try {
      if (window.hljs) {
        const result = hljs.highlightAuto(source);
        codeEl.innerHTML = result.value;
        langEl.textContent = result.language || 'text';
      } else {
        codeEl.textContent = source;
      }
    } catch (e) {
      codeEl.textContent = source;
    }

    const copyBtn = document.getElementById('copy');
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(source);
        copyBtn.textContent = '已复制';
        setTimeout(() => { copyBtn.textContent = '复制'; }, 1500);
      } catch (e) {
        copyBtn.textContent = '复制失败';
        setTimeout(() => { copyBtn.textContent = '复制'; }, 1500);
      }
    });
  </script>
</body>
</html>`;
            return new Response(html, {
                headers: {
                    'content-type': 'text/html;charset=UTF-8',
                    'X-Content-Type-Options': 'nosniff',
                    'Referrer-Policy': 'no-referrer',
                },
            });
        }

        return new Response(value);
    }
    else {
        return fetch(static_ui);
    }
}

/**
 * readRequestBody reads in the incoming request body
 * Use await readRequestBody(..) in an async function to get the string
 * @param {Request} request the incoming request to read from
 */
async function readRequestBody(request) {
    const { headers } = request;
    const contentType = headers.get('content-type') || '';
    console.log(JSON.stringify(request), 'request');
    if (contentType.includes('application/json')) {
        return await request.json();
    } else if (contentType.includes('application/text')) {
        return request.text();
    } else if (contentType.includes('text/html')) {
        return request.text();
    } else if (contentType.includes('form')) {
        const formData = await request.formData();
        const body = {};
        for (const entry of formData.entries()) {
            body[entry[0]] = entry[1];
        }
        return JSON.stringify(body);
    } else {
        // Perhaps some other type of data was submitted in the form
        // like an image, or some other binary data.
        return 'a file';
    }
}
