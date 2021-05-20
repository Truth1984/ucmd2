const { h, cmd, u, cu } = require("../head");
h.addEntry("iptable", "iptable controller", {
  "-p,--process": "process list",
  "-s,--save": "save iptable backup",
  "-b,--blockinput": "block input ip address, can be xxx.xxx.xxx.0/24",
  "-B,--blockoutput": "block output ip address, can be xxx.xxx.xxx.0/24",
  "-a,--blockall": "block input and output ip address",
  "-u,--unblockinput": "unblock input ip address",
  "-U,--unblockoutput": "unblock output ip address",
  "-A,--unblockall": "unblock input and output ip address",
  "-S,--secure": "secure setup for internet interface",
  "-R,--restore": "restore ip table backup",
})
  .addLink(
    { args: "p", kwargs: "process" },
    { args: "s", kwargs: "save" },
    { args: "b", kwargs: "blockinput" },
    { args: "B", kwargs: "blockoutput" },
    { args: "a", kwargs: "blockall" },
    { args: "a", kwargs: "blockinput" },
    { args: "a", kwargs: "blockoutput" },
    { args: "u", kwargs: "unblockinput" },
    { args: "U", kwargs: "unblockoutput" },
    { args: "A", kwargs: "unblockinput" },
    { args: "A", kwargs: "unblockoutput" },
    { args: "A", kwargs: "unblockall" },
    { args: "S", kwargs: "secure" },
    { args: "R", kwargs: "restore" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let processes = args.p;
    let save = args.s;
    let blockinput = args.b;
    let blockoutput = args.B;
    let unblockinput = args.u;
    let unblockoutput = args.U;
    let secure = args.S;
    let restore = args.R;

    if (processes) return cmd("sudo iptables -L -v");
    if (save) {
      if (u.equal(save, [])) save = [`iptables_backup_${u.dateFormat("plain")}`];
      return cmd(`sudo iptables-save > ${save}`);
    }

    if (restore) return cmd(`sudo iptables-restore < ${restore}`);

    let statement = (chain = "INPUT", ip, block = false) =>
      `sudo iptables -${block ? "A" : "D"} ${chain} -p all -s ${ip} -j DROP`;

    if (secure) {
      if (u.equal(secure, [])) return cu.cmderr("internet interface not specified", "iptable");
      //portscan
      return cmd(`sudo iptables -N LOGPSCAN
      sudo iptables -A LOGPSCAN -p tcp --syn -m limit --limit 2000/hour -j RETURN
      sudo iptables -A LOGPSCAN -m limit --limit 99/hour -j LOG --log-prefix "DROPPED Port scan: "
      sudo iptables -A LOGPSCAN -j DROP
      sudo iptables -A INPUT -p tcp --syn -j LOGPSCAN`);
    }

    //block ssh
    //sudo iptables -A INPUT -p tcp -s xxx.xxx.xxx.0/24 --dport 22 -j DROP

    if (blockinput) cmd(statement("INPUT", blockinput, true), 1);
    if (blockoutput) cmd(statement("OUTPUT", blockoutput, true), 1);
    if (unblockinput) cmd(statement("INPUT", unblockinput, false), 1);
    if (unblockoutput) cmd(statement("OUTPUT", unblockoutput, false), 1);
  });
