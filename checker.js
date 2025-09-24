const fs = require("fs");
const path = require("path");
const logger = require("./console/logger");
const analyzeYarnLock = require("./analyzer/analyzeYarnLock");

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
