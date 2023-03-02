require("@babel/register")({
  presets: ["@babel/preset-typescript"],
  extensions: [".js", ".ts"],
  cache: true,
  retainLines: true,
});
let f = console.log;
console.log = function (...args) {
  f(...args);
};
module.exports = require("./dev.ts");
