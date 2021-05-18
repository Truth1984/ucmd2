const { h, cmd } = require("../head");

h.addEntry("sf", "search the file content in location, basedir default to current location", {
  "[0],-c,--content": "content inside a file",
  "[1],-b,--base": "base directory of the file, default to '.'",
  "-i,--ignore": "ignore file pattern, default to '/mnt,package-lock*,node_module,yarn.lock'",
  "-D,--depth": "subdirectory depth, default to '10'",
  "-s,--show": "Show matched Content",
  "-A,--all": "all the file to be searched",
})
  .addLink(
    { _: 0, args: "c", kwargs: "content" },
    { _: 1, args: "b", kwargs: "base" },
    { args: "i", kwargs: "ignore" },
    { args: "D", kwargs: "depth" },
    { args: "s", kwargs: "show" },
    { args: "A", kwargs: "all" }
  )
  .addAction(async (argv) => {
    let args = argv.args;
    let content = args.c;
    let base = args.b ? args.b : ".";
    let ignore = args.i ? args.i : ["/mnt", "package-lock*", "node_module", "yarn.lock"];
    let depth = args.D ? args.D : 10;
    let show = args.s;
    let all = args.A;

    let baseline = `sudo ag --follow --column --noheading --depth ${depth} `;
    if (!show) baseline += `--files-with-matches `;
    if (!all) baseline += `--ignore={${ignore}} `;
    if (all) baseline += `--unrestricted `;

    baseline += `${content} ${base} `;
    return cmd(baseline);
  });
