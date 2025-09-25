# Shai-Hulud Checker

日本語 | [English](./README.md)

npm サプライチェーン攻撃によって、感染してしまったパッケージの検出用プログラム

![Javascript](https://img.shields.io/badge/-Javascript-F2C63C.svg?logo=javascript&style=for-the-badge)

## 使用方法

1. Copy repository

```bash
git clone git@github.com:IamSBStakumi/shai-hulud-checker.git
cd shai-hulud-checker
```

2. 実行権限付与(必要に応じて)

```bash
chmod +x main.js
```

3. 実行

```bash
node main.js /path/to/your/projectDir
```

### 侵害を受けたパッケージリストの更新をするには

参考資料[\*](https://socket.dev/blog/ongoing-supply-chain-attack-targets-crowdstrike-npm-packages) の`Compromised Packages and Versions`の項目から
パッケージ一覧をコピーし、 `list/packageList.txt`に貼り付ける。

そして、以下のコマンドを実行する。

```bash
node ./list/parsePackageList.js
```

## 参考資料

- https://socket.dev/blog/ongoing-supply-chain-attack-targets-crowdstrike-npm-packages
