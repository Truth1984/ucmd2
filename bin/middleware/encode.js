const { h, cmd, u, cu, un } = require("../head");
h.addEntry("encode", "use different methods on string", {
  "-l,--line": "line to manipulate",
  "-p,--password": "password generation, define [length=8,strong=1,symbol=1]",
  "-P,--password64": "password generation with auto base64 encode, define [length=8,strong=1,symbol=1]",
  "-u,--uuid": "uuidv4",
  "-m,--md5": "md5 sum calculate",
  "-e,--encode64": "base64 encode",
  "-d,--decode64": "base64 decode",
})
  .addLink(
    { _: 0, args: "l", kwargs: "line" },
    { args: "p", kwargs: "password" },
    { args: "P", kwargs: "password64" },
    { args: "u", kwargs: "uuid" },
    { $: 0, args: "m", kwargs: "md5" },
    { $: 0, args: "e", kwargs: "encode64" },
    { $: 0, args: "d", kwargs: "decode64" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let line = args.l;
    let password = args.p;
    let password64 = args.P;
    let uuid = args.u;
    let md5 = args.m;
    let encode64 = args.e;
    let decode64 = args.d;

    if (password) return console.log(u.randomPassword(...u.arrayMerge([8, 1, 1], password.map(u.int))));
    if (password64)
      return console.log(
        Buffer.from(u.randomPassword(...u.arrayMerge([8, 1, 1], password64.map(u.int)))).toString("base64")
      );
    if (uuid) return console.log(un.uuid());

    if (!line) return cu.cmderr("base string not defined", "encode");
    line = line[0];
    if (md5) return cmd(`echo -n ${line} | md5sum`);
    if (encode64) return console.log(Buffer.from(line).toString("base64"));
    if (decode64) return console.log(Buffer.from(line, "base64").toString());
  });
