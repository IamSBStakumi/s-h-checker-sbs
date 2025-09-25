const fs = require("fs");
const logger = require("../console/logger");
const CheckPackageCompromised = require("./checkers/CheckPackageCompromised");
const CheckDependenciesCompromised = require("./checkers/CheckDependenciesCompromised");

function analyzeYarnLock(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const compromised = [];

    const lines = content.split("\n");
    let currentEntry = null;
    let currentVersion = null;
    let dependEntry = null;
    let dependVersion = null;
    let isDependency = false;

    // dependencies:に含まれるパッケージ検出用の正規表現
    const devRegex = /^"?[@A-Za-z0-9._\-\/]+"?\s+"[^"]+"$/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // 空行なら変数をリセット
      if (line === "") {
        currentEntry = null;
        currentVersion = null;
        dependEntry = null;
        dependVersion = null;
        isDependency = false;

        continue;
      }

      // 依存パッケージ検証モードのフラグを立てる
      if (currentEntry && line.startsWith("dependencies:")) {
        isDependency = true;
      }

      // yarn.lock中の依存パッケージ名の行
      if (
        line.includes("@") &&
        line.includes(":") &&
        !line.startsWith(" ") &&
        !line.startsWith("#") &&
        !isDependency
      ) {
        // yarn.lock中の依存パッケージ名情報を抽出
        // 複数エントリが含まれる場合を考慮
        const entries = line
          .split(",")
          .map((e) => e.trim().replace(/^"|"$/g, ""));
        const packageMatch = entries[0].match(
          // スコープ(@始まり)の有無に関わらずパッケージ名が含まれる行がマッチするようにする
          /^(@?[^@]+\/?[^@]*)(?:@npm:)?@(.+)$/
        );
        if (packageMatch) {
          currentEntry = packageMatch[1];
        }
      }

      // yarn.lock中における依存パッケージのバージョン情報を抽出
      if (line.startsWith('version "') && currentEntry && !isDependency) {
        const versionMatch = line.match(/version "([^"]+)"/);
        if (versionMatch) {
          currentVersion = versionMatch[1];

          // 感染チェック
          const result = CheckPackageCompromised(currentEntry, currentVersion);
          if (result.compromised) {
            compromised.push({
              package: currentEntry,
              version: currentVersion,
              message: result.message,
              isMatchVersion: result.isMatchVersion,
            });
          }
        }
      }

      // 依存パッケージが依存しているパッケージも検証
      if (!line.startsWith('version "') && devRegex.test(line)) {
        const [pkg, ver] = line.trim().split(/\s+/, 2);
        // ダブルクォートを除去
        dependEntry = pkg.replace(/^"|"$/g, "");
        dependVersion = ver.replace(/^"|"$/g, "");
        const result = CheckDependenciesCompromised(
          dependEntry,
          dependVersion,
          currentEntry
        );
        if (result.compromised) {
          compromised.push({
            package: dependEntry,
            version: dependVersion,
            message: result.message,
            isMatchVersion: result.isMatchVersion,
          });
        }
      }
    }

    return compromised;
  } catch (error) {
    logger.error("Error occurred while analyzing yarn.lock");

    throw new Error("Failed to analyze yarn.lock: " + filePath);
  }
}

module.exports = analyzeYarnLock;
