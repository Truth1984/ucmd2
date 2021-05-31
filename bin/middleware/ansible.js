const { h, cmd, u, un, cu } = require("../head");
h.addEntry("ansible", "ansible related command", {
  "-n,--name": "name to put in the category or use",
  "-c,--command": "command to run on target machine",
  "-s,--script": "script to run on the target machine",
  "-a,--add": "add content to hosts file, as [$addr,$name,$description]",
  "-l,--list": "list hosts, can be pattern",
  "-p,--proxy": "proxy address, define $u_proxy in .bash_env http://user:pass@proxy:port, and fire up proxy server",
  "-D,--debug": "debug mode",
  "-C,--cat": "cat the file",
  "-E,--edit": "edit the host file",
  "-j,--json": "use json format to present host file",
})
  .addLink(
    { _: 0, args: "n", kwargs: "name" },
    { args: "c", kwargs: "command" },
    { args: "s", kwargs: "script" },
    { args: "a", kwargs: "add" },
    { args: "l", kwargs: "list" },
    { args: "p", kwargs: "proxy" },
    { args: "D", kwargs: "debug" },
    { args: "C", kwargs: "cat" },
    { args: "E", kwargs: "edit" },
    { args: "j", kwargs: "json" }
  )
  .addAction(async (argv) => {
    let args = argv.args;
    let name = args.n;
    let command = args.c;
    let script = args.s;
    let add = args.a;
    let list = args.l;
    let proxy = u.equal(args.p, []) ? process.env.u_proxy : "''";
    let debug = u.equal(args.D, []) ? "-vvv" : "";
    let cat = args.C;
    let edit = args.E;
    let json = args.j;

    let ansiblePlaybookdir = __dirname + "/../../assets/playbook.yml";
    let ansibleInventoryLocation = process.env.HOME + `/.application/ansible/hosts`;
    let preconfig =
      "DISPLAY_SKIPPED_HOSTS=false ANSIBLE_CALLBACK_WHITELIST=profile_tasks ANSIBLE_DEPRECATION_WARNINGS=False";

    if (!un.fileExist(ansibleInventoryLocation)) {
      await un.fileMkdir(un.filePathAnalyze(ansibleInventoryLocation).dirname);
      un.fileWriteSync("", false, ansibleInventoryLocation);
    }

    if (add) {
      let addrlike = add[0];
      let name = add[1];
      let desc = add[2];
      if (!add[1]) return cu.cmderr("add [$addr,$name,$desc] not complete", "ansible");

      let { user, addr, port } = cu.sshGrep(addrlike);
      let content = un.fileReadSync(ansibleInventoryLocation);
      if (u.contains(content, addr)) return console.log(`ansible already has ${addr}`);
      let contentMap = cu.iniParser(content);
      contentMap = u.mapMergeDeep(contentMap, { [name]: { [addr]: true } });

      let ipIdentify = u.reCommonFast().iplocal.test(addr) ? "local" : "remote";
      if (!contentMap[ipIdentify]) contentMap = u.mapMerge({ [ipIdentify]: {} }, contentMap);
      if (!u.contains(contentMap[ipIdentify], addr)) contentMap[ipIdentify][addr] = true;
      if (!u.contains(u.mapKeys(contentMap, name + ":vars")))
        contentMap[name + ":vars"] = {
          ansible_user: user,
          ansible_port: port,
          u_name: name,
          u_describe: desc,
        };

      let str = u.reSub(cu.iniWriter(contentMap), /(\d+.\d+.\d+.\d+)=true/, "$1");
      return un.fileWriteSync(str, true, ansibleInventoryLocation);
    }

    if (command) {
      command = u.stringReplace(command[0], { "\\$HOME": "~" });
      let line = `${preconfig} ansible-playbook ${debug} -i ${ansibleInventoryLocation} -e apb_host=${name} -e apb_http_proxy=${proxy} -e apb_runtype=shell -e "apb_shell='${command}'" ${ansiblePlaybookdir}`;
      return cmd(line, 1);
    }

    if (script) {
      script = script[0];
      if (un.fileExist(script)) return cu.cmderr("script doesn't exist", "ansible");
      let line = `${preconfig} ansible-playbook ${debug} -i ${ansibleInventoryLocation} -e apb_host=${name} -e apb_http_proxy=${proxy} -e apb_runtype=script -e apb_script='${un.filePathNormalize(
        script
      )}' ${ansiblePlaybookdir}`;
      return cmd(line, 1);
    }

    if (json) {
      let result = {};
      let users = un.ansibleUserList(json);
      let contentMap = cu.iniParser(un.fileReadSync(ansibleInventoryLocation));
      for (let i of users) {
        for (let [j, k] of u.mapEntries(contentMap)) {
          if (u.equal(k, { [i]: true })) {
            result[i] = u.deepCopy(contentMap[j + ":vars"]);
            break;
          }
        }
      }
      return console.log(result);
    }

    if (cat) return cmd(`cat ${ansibleInventoryLocation}`);
    if (edit) return cmd(`nano ${ansibleInventoryLocation}`);
    if (list) return console.log(un.ansibleUserList(list));
  });
