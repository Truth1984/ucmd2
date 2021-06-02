const { h, u, un, cu } = require("../head");

h.addEntry("search", "find the file name in target location, basedir default to current location", {
  "[0],-n,--name": "name of the file",
  "[1],-b,--base": "base directory of the file, default to '.'",
  "-i,--ignored,--included":
    "ignore or include directory pattern, ignore directory like ['!log'], include like ['*_log'], default to ['!.git', '!*modules', '!mnt']",
  "-I,--ignoref,--includef": "ignore or include file pattern, ignore files like '*.log'",
  "-a,--array": "output result as an array",
  "-d,--directory": "directory only",
  "-f,--file": "file only",
  "-D,--depth": "depth of subdirectory, default to '10'",
  "-e,--eval":
    "takes object like [ {day:-1} {} ]; as (start < mtime < end), filter directly on mtime(content modify) object",
  "-E,--evalfull":
    "stat files, then filter them based on eval; {mtime: content, ctime: content + location or permission, atime: access, readtime}; " +
    "example: 'u.dateAdd({day:-1}) < mtime && u.dateAdd({day:-3}) > atime'",
})
  .addLink(
    { _: 0, args: "n", kwargs: "name" },
    { _: 1, args: "b", kwargs: "base" },
    { args: "i", kwargs: "ignored" },
    { args: "i", kwargs: "included" },
    { args: "I", kwargs: "ingoref" },
    { args: "I", kwargs: "includef" },
    { args: "a", kwargs: "array" },
    { args: "d", kwargs: "directory" },
    { args: "f", kwargs: "file" },
    { args: "D", kwargs: "depth" },
    { args: "e", kwargs: "eval" },
    { args: "E", kwargs: "evalfull" }
  )
  .addAction(async (argv) => {
    let args = argv.args;
    let name = args.n;
    let base = args.b ? args.b[0] : ".";
    let ignored = args.i ? args.i : ["!.git", "!*modules", "!mnt"];
    let ignoref = args.I;
    let array = args.a;
    let directory = args.d;
    let file = args.f;
    let depth = args.D ? args.D : 10;
    let evals = args.e;
    let evalfull = args.E;

    let options = {
      type: "files_directories",
      depth,
      directoryFilter: ignored,
    };

    if (ignoref) options = u.mapMerge(options, { fileFilter: ignoref });
    let nameArr = await un.fileReaddir(base, options);
    let result = [];

    if (!directory && !file) {
      for (let i of nameArr) if (u.contains(i.basename, name)) result.push(i);
    } else {
      for (let i of nameArr)
        if (u.stringToRegex(name).test(i.basename) && (i.dirent.isDirectory() ? directory : file)) result.push(i);
    }

    if (evals) {
      result = result.filter((i) => {
        let { mtime } = un.fileStat(i.fullPath);
        if (u.equal(evals[0], {})) evals[0] = { year: -100 };
        if (!evals[1] || u.equal(evals[1], {})) evals[1] = { year: 100 };
        return u.dateAdd(cu.jsonParser(evals[0])) < mtime && mtime < u.dateAdd(cu.jsonParser(evals[1]));
      });
    }

    if (evalfull) {
      result = result.filter((i) => {
        // eslint-disable-next-line no-unused-vars
        let { atime, ctime, mtime } = un.fileStat(i.fullPath);
        return eval(evalfull[0]);
      });
    }

    if (array) console.log(result.map((i) => i.fullPath));
    else console.log(result);
  });
