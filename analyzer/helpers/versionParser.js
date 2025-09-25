// バージョン文字列を[major, minor, patch]配列に変換 v: string
function ParseVersion(v) {
  return v.split(".").map((n) => parseInt(n, 10));
}

// ^(キャレット)がついたSemVerのパース
function ParseCaret(range) {
  // slice関数でキャレットを除去して渡す
  const [maj, min, pat] = ParseVersion(range.slice(1));
  if (maj > 0) return { min: [maj, min, pat], max: [maj + 1, 0, 0] };
  // メジャーバージョンが0の時
  if (min > 0) return { min: [0, min, pat], max: [0, min + 1, 0] };

  // マイナーバージョンまで0の時
  return { min: [0, 0, pat], max: [0, 0, pat + 1] };
}

// ~(チルダ)がついたSemVerのパース
function ParseTilde(range) {
  // slice関数でチルダを除去して渡す
  const [maj, min, pat] = ParseVersion(range.slice(1));
  return { min: [maj, min, pat], max: [maj, min + 1, 0] };
}

module.exports = { ParseVersion, ParseCaret, ParseTilde };
