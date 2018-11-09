/* eslint-env node */
module.exports = {
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: '2018'
  },
  env: {
    browser: true,
    es6: true,
    amd: true
  },
  extends: ['eslint:recommended', 'plugin:vue/essential', '@vue/prettier'],
  rules: {
    'no-console': 'error',
    'no-debugger': 'error'
  }
};
