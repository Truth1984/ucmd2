const { h, cmd, u, un, cu } = require("../head");

h.addEntry("_server", "open server with test message", {
  "[0],-p,--port": "port to open, default:3000",
})
  .addLink({ _: 0, args: "p", kwargs: "port" })
  .addAction((argv) => {
    let args = argv.args;
    let port = args.p || [3000];

    let { Framework } = require("backend-core-bm");
    let fw = new Framework({ dev: "full-dev", listen: port[0] });

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
    let port = args.p || 8080;

    if (args.r) return cmd(`u docker web-test -r`);
    if (args.e) return cmd(`u docker web-test -e sh`);

    cmd(`u docker web-test -r`);
    return cmd(`sudo docker run -d --name web-test -p ${port}:8000 crccheck/hello-world`);
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
        image: "registry",
        extra_hosts: ["host.docker.internal:host-gateway"],
        environment: ["TZ=Asia/Hongkong"],
        ports: ["8000:8000"],
        volumes: [`volume${i}:/v${i}`],
        restart: "always",
      };
    }

    un.fileWriteSync(cu.yamlWriter(content, 4), 0, "docker-compose.yml");
  });

h.addEntry("_auth", "auth server wrapped in docker", {
  "[0],-p,--port": "target port to proxy to",
  "-P,--porthost": "port to open on host machine, default $port+500",
  "-u,--user": "username to use, default to awada",
  "-p,--pass": "password to use, default auto generated",
  "-h,--host": "host to listen to, default to 'host.docker.internal'",
  "-s,--server": "server_name for nginx",
})
  .addLink(
    { _: 0, args: "p", kwargs: "port" },
    { args: "P", kwargs: "porthost" },
    { args: "u", kwargs: "user" },
    { args: "p", kwargs: "pass" },
    { args: "h", kwargs: "host" },
    { args: "s", kwargs: "server" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let user = args.u || "awada";
    let port = args.p;
    let pass = u.randomPassword(14, 1, 0);
    let host = args.h || "http://host.docker.internal";
    let server = args.s;

    if (!port) return cu.cmderr("proxy port not defined", "_auth");
    let porthost = args.P || u.int(args.p[0]) + 500;

    console.log(`starting on port ${porthost} with ${pass}`);

    let servername = server ? `-e SERVER_NAME=${server[0]}` : "";
    let line = `docker run -d --restart=always --add-host=host.docker.internal:host-gateway \
    --name "nauth${port}" -p ${porthost}:80 -e BASIC_AUTH_USERNAME=${user} \
    -e BASIC_AUTH_PASSWORD=${pass} -e PROXY_PASS=${host}:${port} ${servername} \
    quay.io/dtan4/nginx-basic-auth-proxy`;

    return cmd(line);
  });
