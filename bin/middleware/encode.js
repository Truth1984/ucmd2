const { h, cmd, u, cu } = require("../head");
h.addEntry("encode", "use different methods on string", {
  "-l,--line": "line to manipulate",
  "-p,--password": "password generation, define length",
  "-P,--password64": "password generation with auto base64 encode, define length",
  "-m,--md5": "md5 sum calculate",
  "-b,--encode64": "base64 encode",
  "-d,--decode64": "base64 decode",
})
  .addLink(
    { _: 0, args: "l", kwargs: "line" },
    { args: "p", kwargs: "password" },
    { args: "P", kwargs: "password64" },
    { args: "m", kwargs: "md5" },
    { args: "b", kwargs: "encode64" },
    { args: "d", kwargs: "decode64" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let line = args.l;
    let password = args.p;
    let password64 = args.P;
    let md5 = args.m;
    let encode64 = args.b;
    let decode64 = args.d;

    if (password) return console.log(u.randomPassword(u.equal(password, []) ? 8 : password[0], 1, 1));
    if (password64)
      return console.log(
        Buffer.from(u.randomPassword(u.equal(password, []) ? 8 : password[0], 1, 1)).toString("base64")
      );

    if (!line) return cu.cmderr("base string not defined", "encode");
    if (md5) return cmd(`echo -n ${line} | md5sum`);
    if (encode64) return console.log(Buffer.from(line).toString("base64"));
    if (decode64) return console.log(Buffer.from(line, "base64").toString());
  });
