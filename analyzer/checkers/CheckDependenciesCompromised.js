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

  const isCompromisedVersion = CompareSemVer(version, found.version);

  // 侵害パッケージ名とバージョンが一致するかどうかでメッセージを変更
  const messageText = isCompromisedVersion
    ? `${packageName} (This is ${dependent} depends on) is compromised!`
    : `${packageName} (This is ${dependent} depends on) is compromised, but it is not the compromised version.`;

  return {
    compromised: true,
    message: messageText,
    isMatchVersion: isCompromisedVersion,
  };
};

module.exports = CheckDependenciesCompromised;
