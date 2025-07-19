const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["eslint:recommended", "@next/eslint-config-next", "./base.js"],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
    browser: true,
  },
  plugins: ["only-warn"],
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    // Ignore dotfiles
    ".*.js",
    "node_modules/",
    "dist/",
    ".next/",
    "out/",
  ],
  overrides: [
    {
      files: ["*.js?(x)", "*.ts?(x)"],
    },
  ],
};
