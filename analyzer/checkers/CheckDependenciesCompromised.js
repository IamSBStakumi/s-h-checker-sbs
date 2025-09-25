const CompareSemVer = require("../helpers/CompareSemVer");
const shaiHuludCompromisedPackages = require("../../list/packageList.json");

// packageName: string, version: string, dependent: string
// この関数において、packageNameはdependentが依存しているパッケージ
const CheckDependenciesCompromised = (packageName, version, dependent) => {
  const found = shaiHuludCompromisedPackages.find(
    (p) => p.package === packageName
  );
  // 侵害されたパッケージではない
  if (!found) {
    return {
      compromised: false,
      message: `${packageName} (This is ${dependent} depends on) is not compromised.`,
      isMatchVersion: false,
    };
  }

  // バージョンの引数が与えられず、バージョンの検証ができなかった時(ほぼ起こらないはず)
  if (!version) {
    return {
      compromised: true,
      message: `${packageName} (This is ${dependent} depends on) is compromised, but version verification could not be performed.`,
      isMatchVersion: false,
    };
  }

  const isIncludedCompromisedVersion = CompareSemVer(version, found.version);

  // 侵害パッケージ名とバージョンが一致するかどうかでメッセージを変更
  const messageText = isIncludedCompromisedVersion
    ? `${packageName} (This is ${dependent} depends on) is compromised! Compromised Version is included!`
    : `${packageName} (This is ${dependent} depends on) is compromised, but Compromised version is not included.`;

  return {
    compromised: true,
    message: messageText,
    isMatchVersion: isIncludedCompromisedVersion,
  };
};

module.exports = CheckDependenciesCompromised;
