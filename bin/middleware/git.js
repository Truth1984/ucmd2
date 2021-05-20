const { h, cmd, cu } = require("../head");
h.addEntry("git", "git command integration", {
  "-h,--head": "head to which branch",
  "-m,--movebranch": "move branch to target commit id, as [$branchName,$id]",
  "-M,--moveref": "move refs to target commit id, as [$refName, $id]",
  "-r,--remove": "remove $branchName, locally",
  "-R,--removefull": "remove $branchName, locally and remotely",
  "-i,--initialize": "initialize proper branches, add test and dev",
  "-b,--branch": "branch to create and jump to that branch",
  "-a,--append": "append changes as Rebase CURRENT -> HEAD as $newbranch -> $oldbranch, forcing",
  "-L,--nolog": "nolog, silence",
})
  .addLink(
    { _: 0, args: "h", kwargs: "head" },
    { args: "m", kwargs: "movebranch" },
    { args: "M", kwargs: "moveref" },
    { args: "r", kwargs: "remove" },
    { args: "R", kwargs: "removefull" },
    { args: "i", kwargs: "initialize" },
    { args: "b", kwargs: "branch" },
    { args: "a", kwargs: "append" },
    { args: "L", kwargs: "nolog" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let head = args.h;
    let movebranch = args.m;
    let moveref = args.M;
    let remove = args.r;
    let removefull = args.R;
    let initialize = args.i;
    let branch = args.b;
    let append = args.a;
    let nolog = args.L;

    let adog = () => cmd("git log --all --decorate --oneline --graph");

    if (head) cmd(`git checkout ${head}`);
    if (branch) cmd(`git branch ${branch[0]} && git checkout ${branch[0]}`);

    if (initialize) {
      cmd("git checkout -b test master && git checkout -b dev test");
      cmd("git checkout test && git push --set-upstream origin test");
      cmd("git checkout dev && git push --set-upstream origin dev");
    }

    if (movebranch) {
      if (!movebranch[1]) return cu.cmderr("move $branchName,$id not defined", "git");
      cmd(`git checkout ${movebranch[0]} && git reset --hard ${movebranch[1]}`);
    }
    if (moveref) {
      if (!moveref[1]) return cu.cmderr("move $refName,$id not defined", "git");
      cmd(`git push --force origin ${moveref[1]}:refs/heads/${moveref[0]}`);
    }
    if (append) {
      if (!append[1]) cmd(`git rebase -f ${append[0]}`);
      else cmd(`git rebase -f ${append[0]} ${append[1]}`);
    }

    if (remove) {
      console.log(`deleting local branch`, remove[0]);
      cmd(`git branch -d ${remove[0]}`);
    }
    if (removefull) {
      console.log(`deleting local branch`, removefull[0]);
      cmd(`git branch -d ${removefull[0]}`);
      console.log(`deleting remote branch`, removefull[0]);
      cmd(`git push origin --delete ${removefull[0]}`);
    }

    if (!nolog) return adog();
  });
