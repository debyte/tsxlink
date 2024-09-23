const stylistic = require("@stylistic/eslint-plugin");

module.exports = {
  plugins: {
    "@stylistic": stylistic,
  },
  rules: {
    "@stylistic/indent": ["warn", 2],
    "@stylistic/quotes": ["warn", "double"],
    "@stylistic/max-len": ["warn", { "code": 80, "tabWidth": 2 }],
  },
  ignores: [
    "dist/*",
  ],
};
