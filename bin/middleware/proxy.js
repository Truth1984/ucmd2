const { h, cmd, u } = require("../head");
h.addEntry("proxy", "proxy the command", {
  "[0],-c,--command": "command to use proxy",
  "-g,--generate": "generate proxy export string",
  "-s,--string": "generate string for cmdline",
})
  .addLink({ _: 0, args: "c", kwargs: "command" }, { args: "g", kwargs: "generate" }, { args: "s", kwargs: "string" })
  .addAction((argv) => {
    let args = argv.args;
    let command = args.c;
    let generate = args.g;
    let string = args.s;

    let proxystr = "";
    let env = process.env;
    let checkKey = ["https_proxy", "http_proxy", "HTTPS_PROXY", "HTTP_PROXY", "no_proxy", "NO_PROXY"];

    if (generate) {
      let url = generate[0];
      return console.log(
        `export https_proxy=${url}\nexport http_proxy=${url}\nexport HTTPS_PROXY=${url}\nexport HTTP_PROXY=${url}`
      );
    }

    if (string) {
      let url = string[0];
      return console.log(`https_proxy=${url} http_proxy=${url} HTTPS_PROXY=${url} HTTP_PROXY=${url}`);
    }

    for (let i of checkKey) proxystr += env[i] ? i + "=" + env[i] + " " : "";
    return cmd(`${proxystr}${u.arrayToString(command, " ")}`);
  });
