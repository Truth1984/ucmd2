const { h, u, cu } = require("../head");
h.addEntry("post", "send post request", {
  "[0],-u,--url": "url",
  "[1],-d,--json": "json data",
  "-h,--headers": "headers",
  "-g,--get": "get request",
})
  .addLink(
    { _: 0, args: "u", kwargs: "url" },
    { _: 1, args: "d", kwargs: "data" },
    { args: "h", kwargs: "headers" },
    { args: "g", kwargs: "get" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let url = args.u;
    let data = {};
    if (args.d) for (let i of args.d) data = u.mapMerge(data, cu.jsonParser(i));

    let headers = {};
    if (args.h) for (let i of args.h) headers = u.mapMerge(headers, cu.jsonParser(i));
    let get = args.g;

    if (get) return u.promiseFetchGet(url, headers);
    return u.promiseFetchPost(url, data, headers).catch((e) => console.log(e));
  });
