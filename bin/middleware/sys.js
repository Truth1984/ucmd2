const { h, cmd, u, cu, un } = require("../head");
const osu = require("os-utils");
const os = require("os");

h.addEntry("sys", "display system information", {
  "[0],-t,--target": "target file to be performed from, default to '.'",
  "-s,--size": "size of the directory or file",
  "-f,--filesystem": "filesystem information",
  "-b,--basic": "basic info of system",
  "-d,--detail": "system info details",
  "-l,--large": "large file finder, define size, default to '20'",
  "-L,--largegrep": "large file finder with grep",
  "-c,--cron": "crontab inspect for each user",
})
  .addLink(
    { args: "s", kwargs: "size" },
    { args: "f", kwargs: "filesystem" },
    { args: "b", kwargs: "basic" },
    { args: "d", kwargs: "detail" },
    { args: "l", kwargs: "large" },
    { args: "L", kwargs: "largegrep" },
    { args: "c", kwargs: "cron" }
  )
  .addAction(async (argv) => {
    let args = argv.args;
    let target = args.t ? args.t : ".";
    let size = args.s;
    let filesystem = args.f;
    let basic = args.b;
    let detail = args.d;
    let large = args.l;
    let largegrep = args.L;
    let cron = args.c;

    if (size) return cmd(`du -sh ${target}`);

    if (filesystem) return cmd(`df -Th`);
    if (basic) {
      const cpup = new Promise((r) => osu.cpuUsage((p) => r(p)));
      let basic = {
        totalCpu: os.cpus().length,
        totalMem: os.totalmem() / 1024 / 1024 + "MB",
        freeMem: os.freemem() / 1024 / 1024 + "MB",
        "freeMem%": osu.freememPercentage() * 100,
        "cpu%": (await cpup) * 100,
      };
      if (os.platform() == "linux") {
        let df = cu.shellParser(cmd("df -m", false, true));
        let dfResult = df.filter(
          (item) =>
            item.Filesystem != "overlay" && !u.contains(item.Filesystem, "tmp") && u.int(item["1M-blocks"]) > 10000
        );
        basic["fs"] = dfResult;
      }
      return console.log(basic);
    }
    if (detail) return cmd(`cat /proc/cpuinfo && cat /proc/meminfo`);
    if (large) {
      if (u.equal(large, [])) large = 20;
      return cmd(`sudo du -ahx ${target} | sort -rh | head -n ` + large);
    }

    if (largegrep) return cmd(`sudo du -ahx ${target} | sort -rh | grep ${largegrep} | head -n 30`);
    if (cron)
      return cmd("for user in $(cut -f1 -d: /etc/passwd); do echo ---$user--- ; sudo crontab -u $user -l ; done");

    if (un.fileIsDir(target)) return cmd(`cd ${target} && ls -alFh`);
    else return cmd(`stat ${target}`);
  });