const shaiHuludCompromisedPackages = require("../../list/packageList.json");

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

module.exports = CheckPackageCompromised;
