const { h, cmd, u, cu, un } = require("../head");
h.addEntry("nat", "nat traversal, --setup on client", {
  "-c,--connect":
    "connect to the target host, define [$targetHost, $targetPort, $localPort, $localHost=localhost(can be local ip)]\n" +
    "\t\t\tforward request from localHost:localPort to targetHost:targetPort\n",
  "-S,--serversetup": "server config",
  "-C,--clientsetup": "client config",
})
  .addLink(
    { _: 0, args: "c", kwargs: "connect" },
    { args: "S", kwargs: "serversetup" },
    { args: "C", kwargs: "clientsetup" }
  )
  .addAction(async (argv) => {
    let args = argv.args;
    let connect = args.c;
    let serversetup = args.S;
    let clientsetup = args.C;

    let osChecker = (name) => cmd(`u os ${name}`, 0, 1) == "true";

    if (connect) {
      let targetHost = connect[0];
      let targetPort = connect[1];
      let localPort = connect[2];
      let localHost = connect[3];
      if (!targetHost || !targetPort || !localPort)
        return cu.cmderr("$targetHostPattern, $targetPort, $localPort, $localHost? undefined", "u nat --connect");
      if (!localHost) localHost = "host.docker.internal";

      let users = un.ansibleUserList(targetHost);
      let target = u.len(users) > 1 ? await cu.multiSelect(users) : users[0];
      let invdata = un.ansibleInventoryData(target);
      let targetHostName = u.contains(targetHost, ":") ? invdata.addr : targetHost;

      let remotePort = invdata.ansible_port;
      let remoteUser = "ussh";
      let remoteHost = invdata.addr ? invdata.addr : target;

      cmd("if ! sudo docker ps | grep -q autoheal ; then echo -- autoheal not deployed --; fi;");

      return cmd(
        `sudo docker run -d --name=${targetHostName}sshNat${localPort} -v ${process.env.HOME}/.ssh:/root/.ssh --health-cmd="nc -z -v -w 3 ${remoteHost} ${targetPort} &> /dev/null && echo 'online' || exit 1" --health-interval=30s --health-timeout=30s -e GATEWAY_PORTS=true -e SSH_ENABLE_ROOT=true -e SSH_ENABLE_PASSWORD_AUTH=false -e SSH_ENABLE_ROOT_PASSWORD_AUTH=true --add-host=host.docker.internal:host-gateway --restart=always panubo/sshd:1.3.0 ssh -i /root/.ssh/id_rsa_ussh -N -R ${targetPort}:${localHost}:${localPort} -p ${remotePort} -vvv ${remoteUser}@${remoteHost}`
      );
    }

    if (serversetup) {
      if (un.cmdCheckStatus(`id ussh`)) {
        cmd(`nano /home/ussh/.ssh/authorized_keys`);
        return cmd(`sudo service sshd restart`);
      }
      let opt = ``;
      if (osChecker("ubuntu")) opt = `--gecos "" --disabled-password`;
      cmd(`sudo adduser --shell /usr/sbin/nologin ${opt} ussh`);
      cmd(`mkdir /home/ussh/.ssh`);
      cmd(`echo "# enter your public key" > /home/ussh/.ssh/authorized_keys`);
      cmd(`sudo chown -R ussh:ussh /home/ussh/.ssh`);
      cmd(`nano /home/ussh/.ssh/authorized_keys`);
      cmd(`echo 'Match User ussh
  PasswordAuthentication no
  X11Forwarding no
  AllowTcpForwarding yes
  GatewayPorts yes' >> /etc/ssh/sshd_config`);
      return cmd(`sudo service sshd restart`);
    }

    if (clientsetup) {
      cmd(`if ! [ -f $HOME/.ssh/id_rsa_ussh ]; then ssh-keygen -t rsa -b 4096 -f $HOME/.ssh/id_rsa_ussh; fi;`);
      cmd(`cat $HOME/.ssh/id_rsa_ussh.pub`);
    }
  });
