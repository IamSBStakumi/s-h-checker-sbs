const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const analyzer = require("../analyzer/analyzeYarnLock");
const logger = require("../console/logger");

function checkMessage(compromised) {
  if (compromised.length > 0) {
    for (const pkg of compromised) {
      if (pkg.isMatchVersion) {
        logger.danger(`Package: ${pkg.package}, Version: ${pkg.version}`);
        logger.danger(`${pkg.message}`);
      } else {
        // 侵害されたパッケージはあるが、バージョンは一致しなかった時
        logger.info(`Package: ${pkg.package}, Version: ${pkg.version}`);
        logger.info(`${pkg.message}`);
      }
    }
  } else {
    logger.success("No compromised packages found.");
  }
}

test("analyzeYarnLock関数が侵害されたパッケージを検出可能", () => {
  const testFilePath = path.resolve(
    __dirname,
    "fixtures",
    "compromised.yarn.lock"
  );
  const result = analyzer(testFilePath);
  logger.info("侵害パッケージ検出テストのログ");
  checkMessage(result);
  logger.log("\n\n");

  assert(Array.isArray(result), "Result should be an array");
  assert(result.length === 4, `Find ${result.length} compromised packages`);
  assert(result[0].package === "@crowdstrike/commitlint");
  assert(result[0].version === "8.1.1");
  assert(result[0].isMatchVersion);
  assert(result[1].package === "@ctrl/shared-torrent");
  assert(result[1].version === "6.3.1");
  assert(result[1].isMatchVersion);
});

test("analyzeYarnLock関数で侵害されていないパッケージは出力しない", () => {
  const testFilePath = path.resolve(__dirname, "fixtures", "safe.yarn.lock");

  const result = analyzer(testFilePath);
  logger.info(
    "侵害されていないパッケージは検出しないことを確認するテストのログ"
  );
  checkMessage(result);
  logger.log("\n\n");

  assert(Array.isArray(result), "Result should be an array");
  assert(result.length === 0);
});
