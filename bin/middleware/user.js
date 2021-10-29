const { h, cmd, u, cu } = require("../head");

h.addEntry("user", "user related operation", {
  "-g,--group": "find user group",
  "-G,--groupadd": "add group, define [$groupname, $?groupid], groupid starting from 1000",
  "-a,--add": "add user, define [$username,$?password,$?groupname,$?groupid]",
  "-A,--adduser": "add user to group, define [$user,$group]",
  "-s,--simpleadd": "add plain user, define [$username, $?groupid]",
  "-S,--simpleadddocker": "add plain user to docker group, define [$username]",
  "-r,--remove": "remove user from the group, define [$user,$group]",
  "-R,--removeuser": "remove user from system",
})
  .addLink(
    { args: "g", kwargs: "group" },
    { args: "G", kwargs: "groupadd" },
    { args: "a", kwargs: "add" },
    { args: "A", kwargs: "adduser" },
    { args: "s", kwargs: "simpleadd" },
    { args: "S", kwargs: "simpleadddocker" },
    { args: "r", kwargs: "remove" },
    { args: "R", kwargs: "removeuser" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let group = args.g;
    let groupadd = args.G;
    let add = args.a;
    let adduser = args.A;
    let simpleadd = args.s;
    let simpleadddocker = args.S;
    let remove = args.r;
    let removeuser = args.R;

    if (group) {
      if (u.len(group) > 0) return cmd(`sudo getent group | grep ${group[0]}`);
      return cmd(`sudo getent group`);
    }

    let groupIniter = (groupname, groupid) => cmd(`sudo groupadd ${groupid ? "-g " + groupid : ""} ${groupname}`);
    let userToGroup = (username, groupname) => {
      if (!username) return cu.cmderr("username not defined", "user userToGroup");
      if (!groupname) return cu.cmderr("groupname not defined", "user userToGroup");
      return cmd(`sudo usermod -a -G ${groupname} ${username}`);
    };
    let osChecker = (name) => cmd(`u os ${name}`, 0, 1) == "true";

    if (groupadd) {
      let groupname = groupadd[0];
      let groupid = groupadd[1];
      if (!groupname) return cu.cmderr("groupname not defined", "user --groupadd");
      if (groupid) return groupIniter(groupname, groupid);
    }

    if (add) {
      let username = add[0];
      let password = add[1];
      let groupname = add[2];
      let groupid = add[3];
      if (!username) return cu.cmderr("username not defined", "user --add");
      let opt = ``;
      if (osChecker("ubuntu")) opt = `--gecos "" --disabled-password`;
      cmd(`sudo adduser ${opt} ${username}`);
      if (password) cmd(`echo '${username}:${password}' | chpasswd`);

      if (groupname) groupIniter(groupname, groupid);
      if (groupname) userToGroup(username, groupname);
    }

    if (simpleadd) {
      let username = simpleadd[0];
      if (!username) return cu.cmderr("username not defined", "user --simpleadd");
      let opt = ``;
      if (osChecker("ubuntu")) opt = `--gecos "" --disabled-password`;
      cmd(`sudo adduser ${opt} --system --no-create-home ${username}`);
    }

    if (simpleadddocker) {
      let username = simpleadddocker[0];
      if (!username) return cu.cmderr("username not defined", "user --simpleadd");
      let opt = ``;
      if (osChecker("ubuntu")) opt = `--gecos "" --disabled-password`;
      cmd(`sudo adduser ${opt} --gid 1000 --system --no-create-home ${username}`);
    }

    if (adduser) {
      userToGroup(adduser[0], adduser[1]);
    }

    if (remove) {
      let username = remove[0];
      let group = remove[1];
      if (!group) return cu.cmderr("username or group not defined", "user --remove");
      return cmd(`sudo deluser ${username} ${group}`);
    }

    if (removeuser) {
      let username = removeuser[0];
      if (!username) return cu.cmderr("username not defined", "user --removeuser");
      return cmd(`sudo userdel -r ${username}`);
    }
  });
