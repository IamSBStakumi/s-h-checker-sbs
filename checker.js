const fs = require("fs");
const path = require("path");
const shaiHuludCompromisedPackages = require("./list/packageList.json");

// 色付きコンソール出力
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

const logger = {
  error: (msg) => console.log(`${colors.red}x ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}i ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  danger: (msg) => console.log(`${colors.red}🚨 ${msg}${colors.reset}`),
};

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

function scanDirectory(targetPath) {
  const absolutePath = path.resolve(targetPath);

  if (!fs.existsSync(absolutePath)) {
    logger.error(`The path does not exist: ${absolutePath}`);
    return;
  }

  if (!fs.statSync(absolutePath).isDirectory()) {
    log.error(`Path is not a directory: ${absolutePath}`);
    return;
  }

  // yarn.lockのパス
  const yarnLockPath = path.join(absolutePath, "yarn.lock");

  if (!fs.existsSync(yarnLockPath)) {
    logger.error(`yarn.lock not found in the directory: ${absolutePath}`);
    return;
  }

  let compromised = [];

  try {
    compromised = analyzeYarnLock(yarnLockPath);
    logger.info("Analyzed yarn.lock successfully: " + absolutePath);
  } catch (error) {
    return;
  }

  if (compromised.length > 0) {
    logger.danger(`Found ${compromised.length} compromised packages!`);

    for (const pkg of compromised) {
      logger.danger(`Package: ${pkg.package}, Version: ${pkg.version}`);
    }
  } else {
    logger.success("No compromised packages found.");
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    logger.error("検査対象のディレクトリを指定してください。");
    process.exit(1);
  }

  const targetPath = args[0];
  scanDirectory(targetPath);
}

// main関数を実行
main();
