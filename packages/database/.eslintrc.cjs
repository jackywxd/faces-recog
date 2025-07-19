module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: ["eslint:recommended", "@typescript-eslint/recommended", "prettier"],
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error",
  },
  ignorePatterns: ["dist/**/*", "node_modules/**/*"],
};
