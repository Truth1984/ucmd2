const { h, cmd, cu } = require("../head");

h.addEntry("addpath", "add path variable to ~/.bash_mine", {
  "[0],-n,--name": "name of the path, or just path",
  "[1],-v,--value": "value of the path",
  "-a,--alias": "alias, can use command directly",
  "-e,--env": "environmental variable as $",
  "-p,--path": "PATH variable, typical sbin",
  "-d,--display": "display bash_mine",
  "-m,--modify": "modify the file",
})
  .addLink(
    { _: 0, args: "n", kwargs: "name" },
    { _: 1, args: "v", kwargs: "value" },
    { args: "a", kwargs: "alias" },
    { args: "e", kwargs: "env" },
    { args: "p", kwargs: "path" },
    { args: "d", kwargs: "display" },
    { args: "m", kwargs: "modify" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let name = args.n;
    let value = args.v;
    let alias = args.a;
    let env = args.e;
    let path = args.p;
    let display = args.d;
    let modify = args.m;

    let target = `>> ~/.bash_mine`;
    if (modify) return cmd("nano ~/.bash_mine");
    if (display) return cmd("cat ~/.bash_mine");

    if (!name) return cu.cmderr("name undefined", "addpath");
    if (path) return cmd(`echo 'export PATH="${path}:$PATH"'` + target);

    if (!value) return cu.cmderr("value undefined", "addpath");
    if (env) return cmd(`echo "export ${name}=${value}"` + target);
    if (alias) return cmd(`echo "alias ${name}='${value}'"` + target);
  });
