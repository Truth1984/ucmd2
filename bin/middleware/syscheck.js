const { h, cmd, u, cu } = require("../head");
const os = require("os");
const osu = require("os-utils");
h.addEntry("syscheck", "check system status", { "-u,--url": "url for /health-check api" })
  .addLink({ args: "u", kwargs: "url" })
  .addAction(async (argv) => {
    let args = argv.args;
    let url = args.u;

    if (url) return u.promiseFetchGet(url, {}, {}, 1).catch(() => cu.cmderr("heath-check failed", u.url(url), 1, 1));

    const cpup = new Promise((r) => osu.cpuUsage((p) => r(p)));
    let basic = {
      freeMem: os.freemem() / 1024 / 1024 + "MB",
      totalMem: os.totalmem() / 1024 / 1024 + "MB",
      "freeMem%": osu.freememPercentage() * 100,
      totalCpu: os.cpus().length,
      "cpu%": (await cpup) * 100,
    };

    if (os.platform() == "linux") {
      let df = cu.shellParser(cmd("df -m", 0, 1));
      let dfResult = df.filter(
        (item) =>
          item.Filesystem != "overlay" && !u.contains(item.Filesystem, "tmp") && u.int(item["1M-blocks"]) > 10000
      );
      basic["fs"] = dfResult;
    }

    if (basic["cpu%"] > 80) console.log("cpu using over", u.int(basic["cpu%"]) + "%");

    if (basic["freeMem%"] < 20 || os.freemem() / 1024 / 1024 < 200)
      console.log("free mem percent:", u.int(basic["freeMem%"]) + "%  ", u.int(basic.freeMem) + "MB left");

    if (basic.fs)
      for (let i of basic.fs)
        if (u.int(i["Use%"]) > 80 || i.Available < 1024)
          console.log("disk:", i["Mounted"], i["Use%"], " ", i.Available + "MB left");
  });
