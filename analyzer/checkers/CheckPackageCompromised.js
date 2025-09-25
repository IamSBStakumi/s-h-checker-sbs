const shaiHuludCompromisedPackages = require("../../list/packageList.json");

// packageName: string, version: string
const CheckPackageCompromised = (packageName, version) => {
  const foundArr = shaiHuludCompromisedPackages.filter(
    (p) => p.package === packageName
  );
  // 侵害されたパッケージではない
  if (!foundArr || foundArr.length === 0) {
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
  let isCompromisedVersion = false;
  for (const found of foundArr) {
    isCompromisedVersion = found.version.includes(versionText);
    if (isCompromisedVersion) break;
  }

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
