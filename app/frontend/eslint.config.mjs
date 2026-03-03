import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig([
  {
    ignores: ["build/**", "node_modules/**", "stories/**"],
  },
  {
    files: ["**/*.{js,cjs,mjs}"],
    rules: {},
  },
]);

export default eslintConfig;
