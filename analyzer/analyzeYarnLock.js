const fs = require("fs");
const logger = require("../console/logger");
const shaiHuludCompromisedPackages = require("../list/packageList.json");

// packageName: string, version: string
const CheckPackageCompromised = (packageName, version) => {
  const found = shaiHuludCompromisedPackages.find(
    (p) => p.package === packageName
  );
  // 侵害されたパッケージではない
  if (!found) {
    return {
      compromised: false,
      message: `${packageName} is not compromised.`,
      isMatchVersion: false,
    };
  }

  // バージョンの引数が与えられず、バージョンの検証ができなかった時(ほぼ起こらないはず)
  if (!version) {
    return {
      compromised: true,
      message: `${packageName} is compromised, but version verification could not be performed.`,
      isMatchVersion: false,
    };
  }

  const versionText = version.replace(/^[\^~]/);
  const isCompromisedVersion = found.version.includes(versionText);

  // 侵害パッケージ名とバージョンが一致するかどうかでメッセージを変更
  const messageText = isCompromisedVersion
    ? `${packageName} is compromised!`
    : `${packageName} is compromised, but it is not the compromised version.`;

  return {
    compromised: true,
    message: messageText,
    isMatchVersion: isCompromisedVersion,
  };
};

// yarn.lockを解析
function analyzeYarnLock(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const compromised = [];

    const lines = content.split("\n");
    let currentEntry = null;
    let currentVersion = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // yarn.lock中のパッケージ名の行
      if (
        line.includes("@") &&
        line.includes(":") &&
        !line.startsWith(" ") &&
        !line.startsWith("#")
      ) {
        // yarn.lock中のパッケージ名情報を抽出
        const packageMatch = line.match(
          // スコープ(@始まり)の有無に関わらずパッケージ名が含まれる行がマッチするようにする
          /^"?([^"]+?(?:@[^"\/]+\/[^"@]+|@[^"\/]+)?)@[^"]*"?:/
        );
        if (packageMatch) {
          currentEntry = packageMatch[1];
          currentVersion = null; // 参照するべきバージョン情報をリセット
        }
      }

      // yarn.lock中のバージョン情報を抽出
      if (line.startsWith('version "') && currentEntry) {
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
        currentEntry = null; // 次のエントリのためにリセット
      }
    }

    return compromised;
  } catch (error) {
    logger.error("Error occurred while analyzing yarn.lock");

    throw new Error("Failed to analyze yarn.lock: " + filePath);
  }
}

module.exports = analyzeYarnLock;
