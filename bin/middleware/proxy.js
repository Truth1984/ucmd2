const { h, cmd, u } = require("../head");
h.addEntry("proxy", "proxy the command", {
  "[0],-c,--command": "command to use proxy",
  "-n,--noproxy": "command not to use proxy",
  "-g,--generate": "generate proxy export string",
  "-G,--get": "get system proxy",
  "-l,--local": "local proxy, local ip + 15456",
  "-s,--string": "generate string for cmdline",
})
  .addLink(
    { _: 0, args: "c", kwargs: "command" },
    { args: "n", kwargs: "noproxy" },
    { args: "g", kwargs: "generate" },
    { args: "G", kwargs: "get" },
    { args: "l", kwargs: "local" },
    { args: "s", kwargs: "string" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let command = args.c;
    let noproxy = args.n;
    let generate = args.g;
    let Get = args.G;
    let local = args.l;
    let string = args.s;

    let proxystr = "";
    let env = process.env;
    let checkKey = ["https_proxy", "http_proxy", "HTTPS_PROXY", "HTTP_PROXY", "no_proxy", "NO_PROXY"];

    if (Get) return cmd("echo $HTTP_PROXY");

    if (local) return console.log(`http://${cmd("u ip --private", false, true).replace("\n", "")}:15456`);

    if (generate) {
      let url = generate[0];
      return console.log(
        `export https_proxy=${url}\nexport http_proxy=${url}\nexport HTTPS_PROXY=${url}\nexport HTTP_PROXY=${url}\nexport no_proxy=localhost,127.0.0.1,192.168.0.0/16,10.96.0.0/12\nexport NO_PROXY=localhost,127.0.0.1,192.168.0.0/16,10.96.0.0/12`
      );
    }

    if (string) {
      let url = string[0];
      return console.log(`https_proxy=${url} http_proxy=${url} HTTPS_PROXY=${url} HTTP_PROXY=${url}`);
    }

    if (noproxy) {
      let noproxystr = "";
      for (let i of checkKey) noproxystr += `${i}="" `;
      return cmd(`${noproxystr}${u.arrayToString(u.arrayAdd(command, noproxy), " ")}`);
    }

    for (let i of checkKey) proxystr += env[i] ? i + "=" + env[i] + " " : "";
    return cmd(`${proxystr}${u.arrayToString(command, " ")}`);
  });
