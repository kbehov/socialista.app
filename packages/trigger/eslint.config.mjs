import { config } from '@socialista/eslint-config/base'

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    ignores: ['.trigger/**'],
  },
]
