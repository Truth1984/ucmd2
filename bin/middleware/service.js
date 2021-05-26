const { h, cmd, u, cu } = require("../head");
h.addEntry("service", "list all the service", {
  "-n,--name": "name of the service, check stauts",
  "-e,--enable": "enable a service, and start",
  "-d,--disable": "disable a service",
  "-r,--restart": "restart service",
  "-l,--log": "log service journal since boot",
  "-L,--logfull": "log service journal full",
  "-A,--absolute": "absolute name, skip name filtering",
  "-a,--active": "active process",
  "-i,--inactive": "inactive process",
})
  .addLink(
    { _: 0, args: "n", kwargs: "name" },
    { args: "e", kwargs: "enable" },
    { args: "d", kwargs: "disable" },
    { args: "r", kwargs: "restart" },
    { args: "l", kwargs: "log" },
    { args: "L", kwargs: "logfull" },
    { args: "A", kwargs: "absolute" },
    { args: "a", kwargs: "active" },
    { args: "i", kwargs: "inactive" }
  )
  .addAction(async (argv) => {
    let args = argv.args;
    let name = args.n;
    let enable = args.e;
    let disable = args.d;
    let restart = args.r;
    let log = args.l;
    let logfull = args.L;
    let absolute = args.A;
    let active = args.a;
    let inactive = args.i;

    let fuzzy = (name) => {
      if (absolute) return name;
      let jsonresult = cu.shellParser(cmd(`systemctl list-units --type service -a`, false, true));
      let services = jsonresult.map((i) => (i ? i.UNIT : ""));
      let target = services
        .filter((item) => item.indexOf(name) > -1)
        .map((i) => u.refind(i, /[\d\w].+/).trim())
        .map((i) => u.stringReplace(i, { ".service$": "" }))
        .sort((a, b) => a.length - b.length);
      return cu.multiSelect(target);
    };

    if (active) return cmd(`sudo systemctl list-units --type service -a --state=active`);
    if (inactive) return cmd(`sudo systemctl list-units --type service -a --state=inactive`);
    let program = await fuzzy(name);
    if (u.len(program) == 0) program = name;

    if (name) return cmd(`sudo systemctl status ${program}`);
    if (enable) {
      cmd(`sudo systemctl start ${program}`);
      cmd(`sudo systemctl enable ${program}`);
      return cmd(`sudo service ${program} status`);
    }

    if (disable) {
      if (!absolute) {
        let ans = await cu.cmdsq("disable service: " + program + "(y/N)");
        if (ans[0] != "y") return;
      }
      cmd(`sudo systemctl disable ${program}`);
      cmd(`sudo systemctl stop ${program}`);
      return cmd(`sudo service ${program} status`);
    }

    if (restart) return cmd(`sudo systemctl restart ${await fuzzy(name)}`);
    if (log) return cmd(`sudo journalctl -u ${await fuzzy(name)}.service -b `);
    if (logfull) return cmd(`sudo journalctl -u ${await fuzzy(name)}.service`);
    cmd(`sudo systemctl list-units --type service --all`);
  });
