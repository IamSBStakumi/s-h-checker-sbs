const fs = require("fs");
const path = require("path");

function parsePackageList(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const lastAtIndex = line.lastIndexOf("@");
      if (lastAtIndex === -1) {
        console.warn(`Warning: Invalid package entry "${line}". Skipping.`);
        return null;
      }

      return {
        package: line.slice(0, lastAtIndex),
        version: line.slice(lastAtIndex + 1),
      };
    });
}

const inputPath = path.resolve(__dirname, "packageList.txt");
const outputPath = path.resolve(__dirname, "packageList.json");

const raw = fs.readFileSync(inputPath, "utf-8");

const parsed = parsePackageList(raw);

fs.writeFileSync(outputPath, JSON.stringify(parsed, null, 2), "utf-8");

console.log(`Parsed package list written to ${outputPath}`);
