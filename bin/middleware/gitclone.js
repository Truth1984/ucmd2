const { h, cmd, un, cu } = require("../head");
h.addEntry("gitclone", "git clone into current folder", {
  "-n,--name": "name of the project",
  "-u,--username": "username",
  "-D,--dockerize": "dockerize node project",
  "-d,--dest": "destination of download",
  "-i,--init": "initialize for js project",
})
  .addLink(
    { _: 0, args: "n", kwargs: "name" },
    { _: 1, args: "u", kwargs: "username" },
    { args: "D", kwargs: "dockerize" },
    { args: "d", kwargs: "dest" },
    { args: "i", kwargs: "init" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let name = args.n;
    let username = args.u ? args.u : "Truth1984";
    let dockerize = args.D;
    let destination = args.d ? args.d : `~/Documents/${name}`;
    let initialize = args.i;

    let asset = un.filePathNormalize(__dirname, "../../assets/gitfile");

    if (initialize) {
      if (!un.fileExist(".git")) return cu.cmderr("git folder not found", "gitclone");
      return cmd(`cp -a ${asset}/. ./`);
    }

    if (dockerize) {
      if (!un.fileExist("package.json")) return cu.cmderr("package.json not found", "gitclone");
      return cmd(`bash <(curl -s https://truth1984.github.io/testSites/node/prep.sh)`);
    }

    cmd(`git clone https://github.com/${username}/${name}.git ${destination}`);
  });
