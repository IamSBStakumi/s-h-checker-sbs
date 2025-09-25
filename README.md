# s-h-checker-sbs = Shai-Hulud Checker By SBStakumi

English | [日本語](./README-ja.md)

Program for detecting packages infected in the npm supply chain.

![Javascript](https://img.shields.io/badge/-Javascript-F2C63C.svg?logo=javascript&style=for-the-badge)

## How to Use

1. Copy repository

```bash
git clone git@github.com:IamSBStakumi/sh-checker-sbs.git
```

2. Granting execute permissions

```bash
chmod +x sh-checker-sbs/main.js
```

3. Execute

```bash
node sh-checker-sbs/main.js /path/to/your/projectDir
```

### To Update Compromised Package List

Copy the package list from the `Compromised Packages and Versions` section of the reference page[\*](https://socket.dev/blog/ongoing-supply-chain-attack-targets-crowdstrike-npm-packages) and paste it into `list/packageList.txt`.

Then, run the following command to update the compromised package list.

```bash
node ./list/parsePackageList.js
```

## Reference Materials

- https://socket.dev/blog/ongoing-supply-chain-attack-targets-crowdstrike-npm-packages
