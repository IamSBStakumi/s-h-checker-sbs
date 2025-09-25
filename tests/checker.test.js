const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const analyzer = require("../analyzer/analyzeYarnLock");
const logger = require("../console/logger");

// テストでも実行結果を確認できるようにしている
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
  logger.log("\n");

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
  logger.log("\n");

  assert(Array.isArray(result), "Result should be an array");
  assert(result.length === 0);
});

test("analyzeYarnLock関数で侵害の有無が混在したパッケージの検証にも対応できている", () => {
  const testFilePath = path.resolve(__dirname, "fixtures", "mixed.yarn.lock");

  const result = analyzer(testFilePath);
  logger.info(
    "攻撃されたパッケージが混ざっているファイルの検証にも対応可能か確認するテストのログ"
  );
  checkMessage(result);
  logger.log("\n");

  assert(Array.isArray(result), "Result should be an array");
  assert(result.length === 6, `Find ${result.length} compromised packages`);
  // 攻撃を受けた依存パッケージだが、セマンティックバージョン範囲に侵害バージョンが含まれていない
  assert(result[4].message.includes("Compromised version is not included."));
  for (const r of result) {
    // 侵害を受けたパッケージだが、該当バージョンは侵害されていない
    assert(r.package !== "oradm-to-gql");
  }
});

test("複数エントリが含まれている場合でも侵害パッケージの検出可能", () => {
  const testFilePath = path.resolve(
    __dirname,
    "fixtures",
    "multientry.yarn.lock"
  );

  const result = analyzer(testFilePath);
  logger.info("複数エントリが含まれている場合に検出可能か確認するテストのログ");
  checkMessage(result);
  logger.log("\n");

  assert(Array.isArray(result), "Result should be an array");
  assert(result.length === 1, `Find ${result.length} compromised packages`);
  assert(result[0].isMatchVersion);
});

test("マルチエイリアス形式のパッケージでも侵害パッケージの検出可能", () => {
  const testFilePath = path.resolve(
    __dirname,
    "fixtures",
    "multialias.yarn.lock"
  );

  const result = analyzer(testFilePath);
  logger.info(
    "マルチエイリアス形式のパッケージでも侵害パッケージの検出可能か確認するテストのログ"
  );
  checkMessage(result);
  logger.log("\n");

  assert(Array.isArray(result), "Result should be an array");
  assert(result.length === 1, `Find ${result.length} compromised packages`);
  console.log(result[0].version);
  assert(result[0].isMatchVersion);
});
