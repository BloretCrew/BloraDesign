import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist/**', 'reference/**', '**/node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      // 原生对话框会露出系统界面，3.0 一律用 toast() / confirm() / bd-modal
      'no-alert': 'error',
    },
  },
  {
    // 测试代码：DOM 查询的结果由测试断言兜底，允许非空断言
    files: ['tests/**'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
);
