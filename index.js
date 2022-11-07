LIST_PASSWD = "default_password"

addEventListener("fetch", event => {  
    event.respondWith(handleRequest(event.request))
})
const static_ui = "https://bestk.github.io/anynote"
const server_api = "https://note.anysign.xyz"
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Headers': "Origin, X-Requested-With, Content-Type, Accept"
};
async function handleRequest(request) {  
    url = new URL(request.url)

    if (url.pathname === "/") {
        return fetch(static_ui)
    }
  
    if (url.pathname === "/set") {
        const {key,value} = await readRequestBody(request)
        await NOTE.put(key, value)
        return new Response(`your link is ${server_api}/${key}`,{ headers: corsHeaders})
    }

    if (url.pathname !== "") {
        key = url.pathname.split('/')[1]
        const value = await NOTE.get(key)
        return new Response(value)
    } else{
        return fetch(static_ui)
    }

    if (url.pathname === "/list") {
        const value = await NOTE.list()
        passwd = url.searchParams.get("passwd")
        if (passwd !== LIST_PASSWD) {
            return new Response("Password not correct", {status: 400})
        }
        let key_list = []
        for(var key of value.keys) {
            key_list.push(key.name)
        }
        return new Response(key_list.join("\r\n"))
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
  console.log(JSON.stringify(request),'request')
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
