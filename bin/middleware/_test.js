const { h, cmd, u, un, cu } = require("../head");

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
    cmd(`u docker web-test -r`);
    return cmd(`sudo docker run -d --name web-test -p ${args.p[0]}:8000 crccheck/hello-world`);
  });

h.addEntry("_display", "display the storage").addAction((argv) => console.log(argv));

h.addEntry("_dlink", "display link storage", { "[0],-l,--link": "link to display", "-e": "extra $ args test" })
  .addLink({ _: 0, args: "l", kwargs: "link" }, { $: 0, args: "e" })
  .addAction((argv) => console.log(argv));

h.addEntry("_echo", "echo the command", { "[0],-l,--line": "the line to echo", "-e": "extra $ args test" })
  .addLink({ _: 0, args: "l", kwargs: "line" }, { $: 0, args: "e" })
  .addAction((argv) => console.log(argv.kwargs.line[0]));

h.addEntry("_dctp", "docker compose template", { "[0],-a,--amount": "amount of services" })
  .addLink({ _: 0, args: "a", kwargs: "amount" })
  .addAction((argv) => {
    let args = argv.args;
    let amount = args.a;
    if (u.equal(amount, []) || !amount) amount = [1];
    amount = amount[0];
    if (un.fileExist("docker-compose.yml")) return cu.cmderr("docker-compose.yml already exists", "_dctp");

    let content = {
      version: "3.8",
      services: {},
    };
    for (let i = 0; i < amount; i++) {
      content.services["registry" + i] = {
        image: "registry:latest",
        extra_hosts: ["host.docker.internal:host-gateway"],
        ports: ["8000:8000"],
        volumes: [`volume${i}:/v${i}`],
        restart: "always",
      };
    }

    un.fileWriteSync(cu.yamlWriter(content, 4), 0, "docker-compose.yml");
  });
