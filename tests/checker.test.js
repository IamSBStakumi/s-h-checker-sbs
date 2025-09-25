const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const analyzer = require("../analyzer/analyzeYarnLock");
const logger = require("../console/logger");

function checkMessage(compromised) {
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
}

test("analyzeYarnLock関数が侵害されたパッケージを検出可能", () => {
  const testFilePath = path.resolve(
    __dirname,
    "fixtures",
    "compromised.yarn.lock"
  );
  const result = analyzer(testFilePath);
  checkMessage(result);

  assert(Array.isArray(result), "Result should be an array");
  assert(result.length === 2, "Should find compromised packages");
  assert(result[0].package === "@crowdstrike/commitlint");
  assert(result[0].version === "8.1.1");
  assert(result[0].isMatchVersion);
  assert(result[1].package === "@ctrl/shared-torrent");
  assert(result[1].version === "6.3.1");
  assert(result[1].isMatchVersion);
});
