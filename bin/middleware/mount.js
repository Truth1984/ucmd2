const { h, cmd, u, un, cu } = require("../head");
h.addEntry(
  "mount",
  "mount or unmount a device, use `mkfs.ext4 /dev/target` to change type, change access to 0755 to use docker",
  {
    "-m,--mount": "mount target dynamically, may change name to /dev/$name",
    "-M,--mounthard": "mount directly to target directory, require [$device, $directory]",
    "-u,--unmount": "unmount target",
    "[0],-i,--mountinfo": "information of mounting device",
    "-I,--unmountinfo": "unmounted information of device",
  }
)
  .addLink(
    { args: "m", kwargs: "mount" },
    { args: "M", kwargs: "mounthard" },
    { args: "u", kwargs: "unmount" },
    { _: 0, args: "i", kwargs: "mountinfo" },
    { args: "I", kwargs: "unmountinfo" }
  )
  .addAction(async (argv) => {
    let args = argv.args;
    let mount = args.m;
    let mounthard = args.M;
    let unmount = args.u;
    let mountinfo = args.i;
    let unmountinfo = args.I;

    let findUnmount = () => {
      let list = cmd(`lsblk --noheadings --raw -o NAME,MOUNTPOINT | awk '$1~/[[:digit:]]/ && $2 == ""'`, false, true);
      return u
        .stringToArray(list, "\n")
        .map((i) => i.trim())
        .filter((i) => i != "");
    };

    if (mount) return cmd(`udisksctl mount -b ${mount}`, true);
    if (mounthard) {
      let device = mounthard[0];
      let directory = mounthard[1];
      if (u.isBad(device) || u.isBad(directory)) return cu.cmderr({ device, directory }, "mountHard");
      await un.fileMkdir(directory, true);
      return cmd(`sudo mount ${device} ${directory}`);
    }
    if (unmount) return cmd(`udisksctl unmount -b ${unmount}`, true);
    if (mountinfo) return cmd(`sudo fdisk -l ${mountinfo}`);
    if (unmountinfo) {
      let list = findUnmount();
      if (u.len(list) == 0) return console.log("there is no unmounted device");
      for (let i of list) cmd(`stat /dev/${i}`);
      return;
    }
    return cmd(
      `sudo fdisk -l && df -Th && echo -e "\nunmounted:" && lsblk --noheadings --raw -o NAME,MOUNTPOINT | awk '$1~/[[:digit:]]/ && $2 == ""'`
    );
  });
