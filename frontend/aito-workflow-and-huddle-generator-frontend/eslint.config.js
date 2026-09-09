import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import security from 'eslint-plugin-security'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      // WI-06: eslint-plugin-security's own flat-config recommended preset. It registers the
      // "security" plugin and turns its 14 rules on as warnings -- see eslint.config.js's own
      // history and the WI-06 report for which findings were fixed vs. accepted as safe.
      security.configs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
])
