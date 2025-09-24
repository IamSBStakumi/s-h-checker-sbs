# s-h-checker-sbs

Program for detecting packages infected in the npm supply chain.
![Javascript](https://img.shields.io/badge/-Javascript-F2C63C.svg?logo=javascript&style=for-the-badge)

## How to Use

1. Copy repository

```bash
git clone git@github.com:IamSBStakumi/s-h-checker-sbs.git
```

2. Granting execute permissions

```bash
chmod +x s-h-checker-sbs/checker.js
```

3. Execute

```bash
node s-h-checker-sbs/checker.js /path/to/your/projectDir
```

### To Update Compromised Package List

Copy the package list from the `Compromised Packages and Versions` section of the reference page[\*](https://socket.dev/blog/ongoing-supply-chain-attack-targets-crowdstrike-npm-packages) and paste it into `list/packageList.txt`.

Then, run the following command to update the compromised package list.

```bash
node ./list/parsePackageList.js
```

## Reference Materials

- https://socket.dev/blog/ongoing-supply-chain-attack-targets-crowdstrike-npm-packages
