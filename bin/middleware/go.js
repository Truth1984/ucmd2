const { h, cmd, u, un, cu } = require("../head");
h.addEntry("go", "golang related command", {
  "[0],-t,--target": "target file, default to '.'",
  "-b,--build": "build the target file, can also define [$os] to build all the archs",
  "-o,--output": "output file name",
  "-m,--main": "build the target file with main os, exmaple 'u go . -bm' ",
  "-s,--show": "show buildable os and arch",
  "-g,--get": "get all missing packages",
})
  .addLink(
    { _: 0, args: "t", kwargs: "target" },
    { args: "b", kwargs: "build" },
    { args: "o", kwargs: "output" },
    { args: "m", kwargs: "main" },
    { args: "s", kwargs: "show" },
    { args: "g", kwargs: "get" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let target = args.t || ".";
    let build = args.b;
    let output = args.o || target;
    let main = args.m;
    let show = args.s;
    let get = args.g;

    if (build) {
      if (build == true && !main) {
        return cmd(`go build ${target}`);
      }
      let godist = cu.shellParser(cmd(`go tool dist list`, 0, 1), {
        separator: "/",
        selfProvideHeader: ["GOOS", "GOARCH"],
      });

      if (output == ".") output = "product";
      else output = un.filePathAnalyze(output[0]).basename;

      if (main) {
        godist = godist.filter(({ GOOS, GOARCH }) => {
          return GOOS == "linux" || GOOS == "windows" || GOOS == "darwin";
        });
        for (let i of godist) {
          let goos = i.GOOS;
          let goarch = i.GOARCH;
          cmd(`env GOOS=${goos} GOARCH=${goarch} go build -o ${goos}_${goarch}_${output} ${target}`, 1);
        }
        return;
      }

      if (build[0]) {
        let tos = u.arrayOfMapSearch(godist, { GOOS: build[0] });
        if (u.len(tos) > 0) {
          for (let i of tos) {
            let goos = i.GOOS;
            let goarch = i.GOARCH;
            cmd(`env GOOS=${goos} GOARCH=${goarch} go build -o ${goos}_${goarch}_${output} ${target}`, 1);
          }
        }
        return;
      }

      return;
    }

    if (show) {
      return cmd(`go tool dist list`);
    }

    if (get) {
      return cmd(`go get -v`);
    }

    return cmd(`go run ${target}`);
  });
