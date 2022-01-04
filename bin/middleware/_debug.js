const { h, cmd, u, un, cu } = require("../head");

h.addEntry("_server", "open server with test message", {
  p: "port to open, default:3000",
})
  .addLink({ _: 0, args: "p", kwargs: "port" })
  .addAction((argv) => {
    let args = argv.args;
    if (!args.p) args.p = [3000];

    let { Framework } = require("backend-core-bm");
    let fw = new Framework({ dev: "full-dev", listen: args.p[0] });

    fw.perform("process", () => {
      let ipProcess = (req) => {
        ip = req.socket.remoteAddress.replace(/^.*:/, "");
        if (ip == "1") return "127.0.0.1";
        return ip;
      };

      fw.router("/", (body, req, res, next) => {
        content = { body, headers: req.headers, query: req.query, ip: ipProcess(req), date: new Date() };
        fw.logger.info(content);
        return content;
      });
    });

    fw.perform("pre-terminate", () => {
      const fs = require("fs");
      let dirs = fw.config.directories;
      fs.rmSync(dirs.logger, { force: true, recursive: true });
      fs.rmSync(dirs.secret, { force: true, recursive: true });
    });

    fw.run();
  });

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

h.addEntry("_dctp", "docker compose template", { "[0],-a,--amount": "amount of services to initialize" })
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
        environment: ["DEBUG=1"],
        ports: ["8000:8000"],
        volumes: [`volume${i}:/v${i}`],
        restart: "always",
      };
    }

    un.fileWriteSync(cu.yamlWriter(content, 4), 0, "docker-compose.yml");
  });
