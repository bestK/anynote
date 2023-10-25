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

    if (url.pathname !== '') {
        key = url.pathname.split('/')[1];
        const isHtml = key.endsWith('.html');
        const isMD = key.endsWith('.md');
        const isGist = key.endsWith('.gist');
        if (isHtml || isMD || isGist) {
            key = key.split('.')[0];
        }
        const value = await NOTE.get(key);
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
            const html = `<!doctype html>
                        <html>
                        <head>
                          <meta charset="utf-8"/>
                          <title>Marked in the browser</title>
                        </head>
                        <body>
                          <div id="content"></div>
                          <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
                          <script>
                     
                            document.getElementById('content').innerHTML =
                              marked.parse(\`${md}\`);
                          </script>
                        </body>
                        </html>`;
            return new Response(html, {
                headers: {
                    'content-type': 'text/html;charset=UTF-8',
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
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/justcaliturner/simple-code-editor@master/browser/css/simple-code-editor.css" />
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/justcaliturner/simple-code-editor@master/browser/css/themes/themes-base16.css" />
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/justcaliturner/simple-code-editor@master/browser/css/themes/themes.css" />
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
                    <script src="https://cdn.jsdelivr.net/gh/justcaliturner/simple-code-editor@master/browser/deps/vue@3.3.4.min.js"></script>
                    <script src="https://cdn.jsdelivr.net/gh/justcaliturner/simple-code-editor@master/browser/deps/highlight.min.js"></script>
                    <script src="https://cdn.jsdelivr.net/gh/justcaliturner/simple-code-editor@master/browser/js/simple-code-editor.js"></script>
                    
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
    } else {
        return fetch(static_ui);
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
