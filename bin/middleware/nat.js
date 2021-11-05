const { h, cmd, u, cu, un } = require("../head");
h.addEntry("nat", "nat traversal, --setup on client", {
  "-c,--connect": "connect to the target host by pattern",
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
      cmd(`echo 'Match User ussh
  Port 13288
  PasswordAuthentication no
  X11Forwarding no
  AllowTcpForwarding no
  GatewayPorts yes' >> /etc/ssh/sshd_config`);
      cmd(`sudo service sshd restart`);
    }

    if (clientsetup) {
      cmd(`if ! [ -f $HOME/.ssh/id_rsa_ussh ]; then ssh-keygen -t rsa -b 4096 -f $HOME/.ssh/id_rsa_ussh; fi;`);
      cmd(`cat $HOME/.ssh/id_rsa_ussh.pub`);
    }
  });
