const { h, cmd, u } = require("../head");
h.addEntry("file", "file related operations", {
  "-f,--file": "file location",
  "-l,--line": "output pid as line",
  "-p,--pid": "pid that is using the file",
  "-P,--process": "process that is using the file",
  "-s,--size": "size of the file",
  "-S,--stat": "stat file",
})
  .addLink(
    { _: 0, args: "f", kwargs: "file" },
    { $: 0, args: "l", kwargs: "line" },
    { $: 0, args: "p", kwargs: "pid" },
    { $: 0, args: "P", kwargs: "process" },
    { $: 0, args: "s", kwargs: "size" },
    { $: 0, args: "S", kwargs: "stat" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let file = args.f && args.f[0] ? args.f[0] : ".";
    let line = args.l;
    let pid = args.p;
    let processes = args.P;
    let size = args.s;
    let stat = args.S;

    if (pid) return cmd(`sudo fuser -uav ${file}`);
    if (line) return console.log(cmd(`sudo fuser ${file} | cut -d' ' -f2- `, 0, 1).trim());
    if (processes) {
      let pids = cmd(`sudo fuser ${file} | cut -d' ' -f2- `, 0, 1).trim();
      if (pids == "") return console.log("no process");
      cmd(`sudo ps -u -p ${pids}`);
      for (let i of u.stringToArray(pids, " ")) cmd(`echo ${i}: && pstree -p -s ${i}`);
    }
    if (size) return cmd(`sudo du -sh ${file}`);
    if (stat) return cmd(`stat ${file}`);
  });
