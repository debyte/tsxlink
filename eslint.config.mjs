import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default tseslint.config(
  {
    ignores: ["dist/"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "@stylistic/indent": ["warn", 2],
      "@stylistic/quotes": ["warn", "double"],
      "@stylistic/max-len": ["warn", { "code": 80, "tabWidth": 2 }],
    },
  }
);
