const { h, cmd, u, cu, un } = require("../head");
h.addEntry("ssh", "use keygen to generate key pairs", {
  "-c,--connect": "connect to the target host by pattern",
  "-i,--initialize": "initialize, add to ansible list and auto connect, [$addr,$name,$desc]",
  "-t,--transfer": "transfer public key to target machine",
  "-l,--list": "list each ip in details with ansible",
  "-p,--proxy": "proxy socks5 to [$host,$localport=15542]",
  "-r,--refresh": "refresh keygen token",
  "-n,--nat":
    "nat traversal,[$targetHost, $targetPort, $localPort, $localHost=localhost(can be local ip)]\n" +
    "\t\t\tforward request from localHost:localPort to targetHost:targetPort\n" +
    "\t\t\tmodify server config: 1. nano /etc/ssh/sshd_config 2. `GatewayPorts yes` 3. restart sshd service",
})
  .addLink(
    { _: 0, args: "c", kwargs: "connect" },
    { args: "i", kwargs: "initialize" },
    { args: "t", kwargs: "transfer" },
    { args: "l", kwargs: "list" },
    { args: "p", kwargs: "proxy" },
    { args: "r", kwargs: "refresh" },
    { args: "n", kwargs: "nat" }
  )
  .addAction(async (argv) => {
    let args = argv.args;
    let connect = args.c;
    let initialize = args.i;
    let transfer = args.t;
    let list = args.l;
    let proxy = args.p;
    let refresh = args.r;
    let nat = args.n;

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
      cmd(`u ansible -a ${addr} ${name} '${desc}'`);
    }

    if (transfer) {
      let addrlike = transfer[0];
      cmd(`if ! [ -f $HOME/.ssh/id_rsa ]; then ssh-keygen -t rsa -b 4096; fi;`);

      let { user, addr, port } = cu.sshGrep(addrlike);
      let status = cmd(`ssh-copy-id -i ~/.ssh/id_rsa.pub -p ${port} ${user}@${addr}`, 0, 1, 1).status;
      if (status > 0) return cu.cmderr("ssh-copy-id status > 0, abort", "ssh");
    }

    if (refresh) return cmd("ssh-keygen -t rsa -b 4096");
    if (list) return cmd(`u ansible -j ${list}`);

    if (connect) {
      let users = un.ansibleUserList(connect);
      let target = u.len(users) > 1 ? await cu.multiSelect(users) : users[0];
      let invdata = un.ansibleInventoryData(target);
      console.log(`connecting to <${target}>, as <${invdata.u_describe}>`);
      return cmd(`ssh -p ${invdata.ansible_port} ${invdata.ansible_user}@${invdata.addr ? invdata.addr : target}`);
    }

    if (proxy) {
      let users = un.ansibleUserList(proxy[0]);
      let localPort = proxy[1] ? proxy[1] : 15542;
      let target = u.len(users) > 1 ? await cu.multiSelect(users) : users[0];

      let invdata = un.ansibleInventoryData(target);
      console.log("using screen to persist connection on port", localPort);
      let line = `ssh -4 -p ${invdata.ansible_port} -D ${localPort} -N ${invdata.ansible_user}@${
        invdata.addr ? invdata.addr : target
      }`;
      return cmd(`u screen -c '${line}' -n 'sshproxy${localPort}' `);
    }

    if (nat) {
      let targetHost = nat[0];
      let targetPort = nat[1];
      let localPort = nat[2];
      let localHost = nat[3];
      if (!targetHost || !targetPort || !localPort)
        return cu.cmderr("$targetHostPattern, $targetPort, $localPort, $localHost? undefined", "nat");
      if (!localHost) localHost = "host.docker.internal";

      let users = un.ansibleUserList(targetHost);
      let target = u.len(users) > 1 ? await cu.multiSelect(users) : users[0];
      let invdata = un.ansibleInventoryData(target);

      let remotePort = invdata.ansible_port;
      let remoteUser = invdata.ansible_user;
      let remoteHost = invdata.addr ? invdata.addr : target;

      return cmd(
        `sudo docker run -d --name=${targetHost}sshNat${localPort} -v ${process.env.HOME}/.ssh:/root/.ssh:ro --health-cmd="nc -z -v ${remoteHost} ${targetPort}" --health-interval=30s --health-retries=2 -e GATEWAY_PORTS=true -e SSH_ENABLE_ROOT=true -e SSH_ENABLE_PASSWORD_AUTH=true -e SSH_ENABLE_ROOT_PASSWORD_AUTH=true --add-host=host.docker.internal:host-gateway --restart=always panubo/sshd ssh -N -R ${targetPort}:${localHost}:${localPort} -p ${remotePort} ${remoteUser}@${remoteHost}`
      );
    }
  });
