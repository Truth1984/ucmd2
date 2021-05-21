const { h, cmd, u, cu } = require("../head");
h.addEntry("ssh", "use keygen to generate key pairs", {
  "-c,--connect": "connect to the target host by pattern",
  "-i,--initialize": "initialize, add to ansible list and auto connect, [$addr,$name,$desc]",
  "-l,--list": "list each ip in details with ansible",
  "-p,--proxy": "proxy socks5 to [$host,$localport=15542]",
  "-r,--refresh": "refresh keygen token",
})
  .addLink(
    { _: 0, args: "c", kwargs: "connect" },
    { args: "i", kwargs: "initialize" },
    { args: "l", kwargs: "list" },
    { args: "p", kwargs: "proxy" },
    { args: "r", kwargs: "refresh" }
  )
  .addAction(async (argv) => {
    let args = argv.args;
    let connect = args.c;
    let initialize = args.i;
    let list = args.l;
    let proxy = args.p;
    let refresh = args.r;

    let ansibleInventoryLocation = process.env.HOME + `/.application/ansible/hosts`;

    let ansibleUserList = (pattern = "all") => {
      if (u.equal(pattern, [])) pattern = "all";
      if (u.reCommonFast().ipv4.test(pattern[0])) return [pattern];
      let line = cmd(`ansible -i ${ansibleInventoryLocation} --list-hosts ${pattern} | tail -n +2`, 0, 1);
      return u.stringToArray(u.stringReplace(line, { "\n": ",", " ": "", ",$": "" }), ",").filter((a) => a != "");
    };

    let ansibleInvData = (pattern = "all") => {
      if (u.equal(pattern, [])) pattern = "all";
      let result = cmd(`ansible-inventory -i ${ansibleInventoryLocation} --host ${pattern}`, 0, 1, 1);
      if (result == 0) return u.stringToJson(result.stdout);
      let { user, port, addr } = cu.sshGrep(pattern);
      return {
        u_name: "unknown",
        u_describe: "unknown",
        ansible_user: user,
        ansible_port: port,
        addr,
      };
    };

    if (initialize) {
      let addrlike = initialize[0];
      let name = initialize[1];
      let desc = initialize[2];

      cmd(`if ! [ -f $HOME/.ssh/id_rsa ]; then ssh-keygen -t rsa -b 4096; fi;`);

      if (!name || !desc) return cu.cmderr("name or description not present", "ssh");
      let { user, addr, port } = cu.sshGrep(addrlike);
      let status = cmd(`ssh-copy-id -i ~/.ssh/id_rsa.pub -p ${port} ${user}@${addr}`, 0, 1, 1).status;
      if (status > 0) return cu.cmderr("ssh-copy-id status > 0, abort", "ssh");
      cmd(`u quick ${name} -c "ssh -p ${port} ${user}@${addr}"`);
      cmd(`u ansible -i ${addr} ${name} '${desc}'`);
    }

    if (refresh) return cmd("ssh-keygen -t rsa -b 4096");
    if (list) return cmd(`u ansible -j ${list}`);

    if (connect) {
      let users = ansibleUserList(connect);
      let target = u.len(users) > 1 ? cu.multiSelect(users) : users[0];
      let invdata = ansibleInvData(target);
      console.log(`connecting to <${target}>, as <${invdata.u_describe}>`);
      return cmd(`ssh -p ${invdata.ansible_port} ${invdata.ansible_user}@${invdata.addr ? invdata.addr : target}`);
    }

    if (proxy) {
      let users = ansibleUserList(proxy[0]);
      let localPort = proxy[1] ? proxy[1] : 15542;
      let target = u.len(users) > 1 ? await cu.multiSelect(users) : users[0];

      let invdata = ansibleInvData(target);
      console.log("using screen to persist connection on port", localPort);
      let line = `ssh -4 -p ${invdata.ansible_port} -D ${localPort} -N ${invdata.ansible_user}@${
        invdata.addr ? invdata.addr : target
      }`;
      return cmd(`u screen -c '${line}' -n 'sshproxy${localPort}' `);
    }
  });
