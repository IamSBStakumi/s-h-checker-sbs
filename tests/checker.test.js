const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const analyzer = require("../analyzer/analyzeYarnLock");

test("analyzeYarnLock関数が侵害されたパッケージを検出可能", () => {
  const testFilePath = path.resolve(
    __dirname,
    "fixtures",
    "compromised.yarn.lock"
  );
  const compromised = analyzer(testFilePath);

  assert(Array.isArray(compromised), "Result should be an array");
  assert(compromised.length === 2, "Should find compromised packages");
  assert(compromised[0].package === "@crowdstrike/commitlint");
  assert(compromised[0].version === "8.1.1");
  assert(compromised[1].package === "@ctrl/shared-torrent");
  assert(compromised[1].version === "6.3.1");
});
