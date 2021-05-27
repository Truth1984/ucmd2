const { h, cmd, cu, u } = require("../head");
h.addEntry("lock", "prevent file from overwritten", {
  "-f,--filename": "filename to perform on ",
  "-l,--lock": "lock file, make it immutable",
  "-u,--unlock": "unlock file",
  "-a,--attribute": "attribute inspect",
})
  .addLink(
    { _: 0, args: "f", kwargs: "filename" },
    { $: 0, args: "l", kwargs: "lock" },
    { $: 0, args: "u", kwargs: "unlock" },
    { $: 0, args: "a", kwargs: "attribute" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let filename = args.f;
    let lock = args.l;
    let unlock = args.u;
    let attribute = args.a;

    if (!filename) return cu.cmderr("filename not specified", "lock");
    if (lock) return cmd(`sudo chattr +i ${filename}`);
    if (unlock) return cmd(`sudo chattr -iau ${filename}`);
    if (attribute) {
      console.log(
        u.jsonToString(
          {
            a: "append only",
            A: "no atime updates",
            c: "compressed",
            C: "no copy on write",
            d: "no dump",
            D: "synchronous directory updates",
            e: "block extents",
            i: "immutable",
            j: "data journalling",
            P: "project hierarchy",
            s: "secure deletion",
            S: "synchronous updates",
            t: "no tail merging",
            T: "top of directory hierarchy",
            u: "undeletable",
            E: "compression error",
            h: "huge file",
            I: "indexed directory",
            N: "inline data",
            X: "compression raw access",
            Z: "compressed dirty file",
          },
          ""
        )
      );
      return cmd(`lsattr ${filename}`);
    }
  });
