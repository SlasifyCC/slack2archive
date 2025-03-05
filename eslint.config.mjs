import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    files: ["**/*.ts"], // 针对 TypeScript 文件
    ignores: ["dist/**", "node_modules/**"], // 忽略的文件
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": ts,
      prettier,
    },
    rules: {
      ...ts.configs["recommended"].rules,
      ...eslintConfigPrettier.rules,
      "prettier/prettier": "error",
    },
    ignores: ["dist/**", "node_modules/**"],
  },
];
