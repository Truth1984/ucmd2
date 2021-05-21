const { h, cmd, cu, un } = require("../head");
h.addEntry("helper", "helper for other commands", {
  "-n,--name": "name",
  "-e,--edit": "edit with code",
  "-s,--software": "software needs to be preinstalled",
  "-u,--update": "update package",
  "-R,--remove": "remove the package",
  "-F,--force": "force to remove the package",
})
  .addLink(
    { _: 0, args: "n", kwargs: "name" },
    { args: "e", kwargs: "edit" },
    { args: "s", kwargs: "software" },
    { args: "u", kwargs: "update" },
    { args: "R", kwargs: "remove" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let name = args.n;
    let edit = args.e;
    let software = args.s;
    let update = args.u;
    let remove = args.R;
    let force = args.F;

    let projectPath = un.filePathNormalize(__dirname, "../../");
    if (edit) return cmd(`code ${projectPath}`);
    if (software)
      return console.log({
        prescript: `wget -O - https://truth1984.github.io/testSites/s/prescript.sh | bash`,
        tools: `wget -O - https://truth1984.github.io/testSites/s/tools.sh | bash`,
        desktop: `wget -O - https://truth1984.github.io/testSites/s/desktop.sh | bash`,
      });

    if (update) return cmd(`cd ${projectPath} && rm -rf package-lock.json && git pull && npm i`);
    if (force)
      return cmd(
        `sudo rm -rf ${projectPath} && sudo rm -rf ~/.bash_mine && sudo rm -rf ~/.bash_env && sudo rm -rf ~/.application`
      );

    if (remove)
      return cu.cmdsq("Uninstall ? (N/y)").then((ans) => {
        if (ans == "y" || ans == "Y")
          return cmd(`rm -rf ${projectPath} && rm -rf ~/.bash_mine && rm -rf ~/.bash_env && rm -rf ~/.application`);
      });

    let list = {
      git: {
        "branch remove": "git branch -d $name",
        "graph adog": "git log --all --decorate --oneline --graph",
        "pull on target directory": "git -C $location pull",
        "first time config": "git config --global user.name $name && git config --global user.email $email",
        proxy: {
          get: "git config --global --get http.proxy",
          del: "git config --global --unset http.proxy",
          set: "git config --global http.proxy http://addr:port",
        },
      },
      cron: {
        edit: "sudo crontab -e",
        "shell support - top of file add": "SHELL=/bin/bash",
        "run command on reboot": "@reboot CMD",
        web: "https://crontab.guru/",
        "At every 5th minute": "*/5 * * * *",
        "day 1, 3, 4, 5": "0 0 1,3-5 * *",
        order: "min (0 - 59) | hour (0 - 23) | day of month (1 - 31) | month (1 - 12) | day of week (0 - 6)",
        output: "location: /var/log/syslog",
      },
      grep: {
        or: "pattern1\\|pattern2",
        regex: `grep -P "\\d"`,
        quiet: "grep -q",
      },
      redis: {
        authorization: "AUTH $pass",
        "get all keys": "keys *",
        "get expire time": "ttl KEY",
      },
      network: {
        "edit network config": "sudo nano /etc/network/interfaces",
        "interfaces example":
          "iface $name inet static:\n\tnetmask 255.255.255.0\n\tgateway 192.168.x.1\n\taddress 192.168.x.x",
        "restart network": "sudo service network-manager restart",
      },
      bash: {
        scriptDir: 'DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"',
        shEcho: "sh -c 'echo 0'",
        mkdir: "mkdir -p",
        currentFolder: '"${PWD##*/}"',
        fullOutput: "2>&1",
        killProcessAfter: "timeout $xSec $cmd",
      },
      ssh: {
        config: "nano /etc/ssh/sshd_config",
        restart: "u service -r=ssh",
      },
      hostname: {
        view: "hostnamectl",
        edit: "hostnamectl set-hostname ",
      },
      pw: {
        change: "sudo passwd",
        changeUser: "sudo passwd $user",
        changeGroup: "sudo passwd -g $group",
        expire: "sudo passwd -e $user",
      },
      rsyslog: {
        restart: "also need to restart systemd-journald",
      },
      nginx: {
        reload: "nginx -s reload",
        "bind-failed": "sudo setenforce 0",
      },
      systemctl: {
        limit: "journalctl --vacuum-size=1G",
      },
    };
    if (name) console.log(list[name[0]]);
    else console.log(list);
  });
