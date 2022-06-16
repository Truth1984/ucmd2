const { h, u, cu, cmd } = require("../head");
h.addEntry("post", "send post request", {
  "[0],-u,--url": "url",
  "[1],-j,--json": "json data",
  "-h,--headers": "headers",
  "-g,--get": "get request",
  "-d,--debug": "debug time",
})
  .addLink(
    { _: 0, args: "u", kwargs: "url" },
    { _: 1, args: "j", kwargs: "json" },
    { args: "h", kwargs: "headers" },
    { args: "g", kwargs: "get" },
    { $: 0, args: "d", kwargs: "debug" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let url = args.u;
    let json = args.j;
    let headers = args.h;
    let get = args.g;
    let debug = args.d;

    let data = {};
    if (json) for (let i of json) data = u.mapMerge(data, cu.jsonParser(i));

    let header = {};
    if (headers) for (let i of headers) header = u.mapMerge(header, cu.jsonParser(i));

    if (debug) {
      let curlx = `-X ${get ? "GET" : "POST"} `;
      if (json) curlx += `-d ${u.jsonToString(data)} `;
      if (headers) for (let [i, j] of u.mapEntries(header)) curlx += `-H ${i}:${j} `;
      curlx += `-w'     time_namelookup:  %{time_namelookup}s\\n      time_connect:  %{time_connect}s\\n   time_appconnect:  %{time_appconnect}s\\n  time_pretransfer:  %{time_pretransfer}s\\n     time_redirect:  %{time_redirect}s\\ntime_starttransfer:  %{time_starttransfer}s\\n                   ----------\\n        time_total:  %{time_total}s\\n'`;
      return cmd(`curl ${curlx} -s ${url}`, true);
    }

    if (get) return u.promiseFetchGet(url, header, {}, 0).then(console.log).catch(console.log);
    return u.promiseFetchPost(url, data, header, {}, 0).then(console.log).catch(console.log);
  });
