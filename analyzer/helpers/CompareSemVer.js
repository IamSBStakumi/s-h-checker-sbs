const { ParseVersion, ParseCaret, ParseTilde } = require("./versionParser");

// セマンティックバージョン範囲より大きい時1を、小さい時-1を返す
function compare(a, b) {
  for (let i = 0; i < 3; ++i) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }

  return 0;
}

// SemVer = Semantic Versioning
// pkgVer: string   使用しているセマンティックバージョン
// compromisedVer:  侵害されているバージョン
function CompareSemVer(pkgVer, compromisedVer) {
  // r: {min: [number, number, number], max: [number, number, number]}
  let r;
  if (pkgVer.startsWith("^")) r = ParseCaret(pkgVer);
  else if (pkgVer.startsWith("~")) r = ParseTilde(pkgVer);
  else r = { min: ParseVersion(pkgVer), max: ParseVersion(pkgVer) }; // キャレットもチルダもついていない時

  const cv = ParseVersion(compromisedVer);

  // セマンティックバージョン範囲に含まれている時にtrueになる。
  const isIncluded = compare(cv, r.min) >= 0 && compare(cv, r.max) < 0;

  return isIncluded;
}

module.exports = CompareSemVer;
