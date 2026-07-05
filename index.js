LIST_PASSWD = 'default_password';

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
async function handleRequest(request) {
    url = new URL(request.url);

    if (url.pathname === '/') {
        return fetch(static_ui);
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
        const value = await NOTE.list();
        passwd = url.searchParams.get('passwd');
        if (passwd !== LIST_PASSWD) {
            return new Response('Password not correct', { status: 400 });
        }
        let key_list = [];
        for (var key of value.keys) {
            key_list.push(key.name);
        }
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
            const html = `
            <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8" />
                    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Simple code editor for vue.js</title>
                    <!-- css -->
                    <link rel="stylesheet" href="https://${jsdelivrHost}/gh/justcaliturner/simple-code-editor@master/browser/css/simple-code-editor.css" />
                    <link rel="stylesheet" href="https://${jsdelivrHost}/gh/justcaliturner/simple-code-editor@master/browser/css/themes/themes-base16.css" />
                    <link rel="stylesheet" href="https://${jsdelivrHost}/gh/justcaliturner/simple-code-editor@master/browser/css/themes/themes.css" />
                    <style>
                      ::-webkit-scrollbar {
                        width: 0;
                        height: 0;
                      }
                    </style>
                </head>

                <body>
                    <div id="app">
                    <code-editor
                        style="overflow: hidden; margin:0 auto"
                        theme="github"
                        :line-nums="true"
                        :read-only="true" 
                        v-model="value"
                        width="100vh" 
                        height="100vh"
                        :languages="[['javascript', 'JS'], ['html', 'HTML'],['python', 'python'],['css', 'CSS'],['java', 'Java']]"
                    ></code-editor>
                     
                    </div>
                    <!-- js -->
                    <script src="https://${jsdelivrHost}/gh/justcaliturner/simple-code-editor@master/browser/deps/vue@3.3.4.min.js"></script>
                    <script src="https://${jsdelivrHost}/gh/justcaliturner/simple-code-editor@master/browser/deps/highlight.min.js"></script>
                    <script src="https://${jsdelivrHost}/gh/justcaliturner/simple-code-editor@master/browser/js/simple-code-editor.js"></script>
                    
                    <script>
                    const app = Vue.createApp({
                        components: {
                        "code-editor": CodeEditor,
                        },
                        data() {
                        return {
                            value: \`${value}\`,
                        };
                        },
                    });
                    app.mount("#app");
                    </script>
                </body>
                </html>
            
            `;
            return new Response(html, {
                headers: {
                    'content-type': 'text/html;charset=UTF-8',
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
