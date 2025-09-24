const fs = require("fs");
const logger = require("../console/logger");
const shaiHuludCompromisedPackages = require("../list/packageList.json");

const isCompromised = (packageName, version) => {
  const found = shaiHuludCompromisedPackages.find(
    (p) => p.package === packageName
  );
  if (!found) {
    return { compromised: false };
  }

  if (!version) {
    return { compromised: true, version: found.version };
  }

  const cleanVersion = version.replace(/^[\^~]/);
  const isCompromisedVersion = found.version.includes(cleanVersion);

  return {
    compromised: true,
    version: isCompromisedVersion,
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

    for (let i = 0; i < lines.length; ++i) {
      const line = lines[i].trim();

      // パッケージ名の行
      if (
        line.includes("@") &&
        line.includes(":") &&
        !line.startsWith(" ") &&
        !line.startsWith("#")
      ) {
        const packageMatch = line.match(
          /^"?([^"@]+(?:@[^"\/]+\/[^"@]+|@[^"\/]+)??)@[^"]*"?:/
        );
        if (packageMatch) {
          currentEntry = packageMatch[1];
          currentVersion = null; // Reset version for new entry
        }
      }

      // バージョンの行
      if (line.startsWith('version "') && currentEntry) {
        const versionMatch = line.match(/version "([^"]+)"/);
        if (versionMatch) {
          currentVersion = versionMatch[1];

          // 感染チェック
          const result = isCompromised(currentEntry, currentVersion);
          if (result.compromised) {
            compromised.push({
              package: currentEntry,
              version: currentVersion,
              result,
            });
          }
        }
        currentEntry = null; // 次のエントリのためにリセット
      }

      return compromised;
    }
  } catch (error) {
    logger.error("Error occurred while analyzing yarn.lock:", error);

    throw new Error("Failed to analyze yarn.lock");
  }
}

module.exports = analyzeYarnLock;
