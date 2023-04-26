const { h, u } = require("../head");
h.addEntry("calc", "calculate numbers", {
  "-l,--line,[0]": "line to calculate",
  "-i,--int": "convert result to integer",
  "-p,--precision": "auto precision if not defined",
})
  .addLink({ _: 0, args: "l", kwargs: "line" }, { args: "i", kwargs: "int" }, { args: "p", kwargs: "precision" })
  .addAction((argv) => {
    let args = argv.args;
    let line = args.l;
    let integer = args.i;
    let precision = args.p;

    if (integer) return console.log(u.int(eval("(" + line + ")")));
    let num = u.float(eval("(" + line + ")"));
    if (precision) return console.log(num.toFixed(precision));
    console.log(num);
  });
