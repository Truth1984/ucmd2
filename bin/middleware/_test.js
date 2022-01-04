const { h, cmd, u, un, cu } = require("../head");

h.addEntry("--version", "find u version").addAction(() => console.log(require("../../package.json").version));

h.addEntry("_env").addAction(() => console.log(process.env));

h.addEntry("_home").addAction(() => cmd("echo ~"));

h.addEntry("_display", "display the storage").addAction((argv) => console.log(argv));

h.addEntry("_dlink", "display link storage", { "[0],-l,--link": "link to display", "-e": "extra $ args test" })
  .addLink({ _: 0, args: "l", kwargs: "link" }, { $: 0, args: "e" })
  .addAction((argv) => console.log(argv));

h.addEntry("_echo", "echo the command", { "[0],-l,--line": "the line to echo", "-e": "extra $ args test" })
  .addLink({ _: 0, args: "l", kwargs: "line" }, { $: 0, args: "e" })
  .addAction((argv) => console.log(argv.kwargs.line[0]));
