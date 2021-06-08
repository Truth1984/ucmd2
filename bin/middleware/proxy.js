const { h, cmd, u } = require("../head");
h.addEntry("proxy", "proxy the command", { "-c,--command": "command to use proxy" })
  .addLink({ _: 0, args: "c", kwargs: "command" })
  .addAction((argv) => {
    let args = argv.args;
    let command = args.c;

    let proxystr = "";
    let env = process.env;
    let checkKey = ["https_proxy", "http_proxy", "HTTPS_PROXY", "HTTP_PROXY", "no_proxy", "NO_PROXY"];
    for (let i of checkKey) proxystr += env[i] ? i + "=" + env[i] + " " : "";

    return cmd(`${proxystr}${u.arrayToString(command, " ")}`);
  });
