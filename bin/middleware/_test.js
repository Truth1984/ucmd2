const { h, cmd } = require("../head");

h.addEntry("--version", "find u version").addAction(() => console.log(require("../../package.json").version));

h.addEntry("_env").addAction(() => console.log(process.env));

h.addEntry("_home").addAction(() => cmd("echo ~"));

h.addEntry("_webtest", "open test docker on port", {
  p: "port to open, default:8080",
  r: "remove service",
  e: "docker execute",
})
  .addLink({ _: 0, kwargs: "port", args: "p" }, { args: "r", kwargs: "remove" }, { args: "e", kwargs: "execute" })
  .addAction((argv) => {
    let args = argv.args;
    if (args.r) return cmd(`u docker web-test -r`);
    if (args.e) return cmd(`u docker web-test -e sh`);

    if (!args.p) args.p = [8080];
    return cmd(`sudo docker run -d --name web-test -p ${args.p[0]}:8000 crccheck/hello-world`);
  });

h.addEntry("_display", "display the storage").addAction((argv) => console.log(argv));

h.addEntry("_echo", "echo the command", { "0,-l,--line": "the line to echo" })
  .addLink({ _: 0, args: "l", kwargs: "line" })
  .addAction((argv) => console.log(argv.kwargs.line[0]));
