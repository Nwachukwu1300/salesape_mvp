// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig([
  ...storybook.configs["flat/recommended"]
]);

export default eslintConfig;
