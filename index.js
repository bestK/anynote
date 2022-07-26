LIST_PASSWD = "default_password"

addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
})
const static_ui = "https://bestk.github.io/anynote"
const server_api = "https://note.anysign.xyz"
async function handleRequest(request) {
    url = new URL(request.url)

    if (url.pathname === "/") {
        return fetch(static_ui)
    }

    if (url.pathname === "/set") {
        for (var key of url.searchParams.keys()) {
            await NOTE.put(key, url.searchParams.get(key))
        }
        return new Response(`your link is ${server_api}/get?key=${key}`)
    }

    if (url.pathname === "/get") {
        key = url.searchParams.get("key")
        const value = await NOTE.get(key)
        return new Response(value)
    }

    if (url.pathname === "/list") {
        const value = await NOTE.list()
        passwd = url.searchParams.get("passwd")
        if (passwd !== LIST_PASSWD) {
            return new Response("Password not correct", { status: 400 })
        }
        let key_list = []
        for (var key of value.keys) {
            key_list.push(key.name)
        }
        return new Response(key_list.join("\r\n"))
    }
}

// some code form https://blog.jimmytinsley.com/2020/12/18/cloudflare-workers%e7%9a%84kv%e5%8a%9f%e8%83%bd%e4%bd%93%e9%aa%8c/