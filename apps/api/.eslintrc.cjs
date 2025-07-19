module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: {
      jsx: false,
    },
  },
  env: {
    node: true,
    es2022: true,
  },
  extends: ["eslint:recommended"],
  plugins: ["@typescript-eslint"],
  rules: {
    // 基础规则
    "no-console": "off", // 在 Workers 中允许 console.log 用于调试
    "no-debugger": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "no-unused-vars": "off", // 关闭基础规则
    "no-undef": "off", // 关闭，TypeScript 会处理
    "no-control-regex": "warn", // 文件验证中可能需要控制字符

    // TypeScript 规则
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],

    // 代码风格（放宽为警告）
    semi: ["warn", "always"],
    quotes: ["warn", "double"],
    "comma-dangle": ["warn", "always-multiline"],
  },
  ignorePatterns: [
    "node_modules",
    "dist",
    "scripts/**/*.cjs",
    "wrangler.toml",
    "*.config.js",
  ],
};
