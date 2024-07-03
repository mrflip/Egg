module.exports = {
  root: true,
  env: {
    node: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
  ],
  rules: {
    'no-constant-condition': ['error', { checkLoops: false }],
    'no-undef': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' }],
    'vue/html-closing-bracket-newline': 'off',
    'vue/html-indent':                  'off',
    'vue/attributes-order':             'off',
    'vue/order-in-components':          'off',
    'vue/no-multi-spaces':              'off',
    'vue/attribute-hyphenation':        'off',
    'vue/v-on-event-hyphenation':       'off',
    'vue/multi-word-component-names' :  'off',
    'vue/html-self-closing': [
      'error',
      {
        html: {
          normal: 'never',
          void: 'always',
        },
      },
    ],
    'vue/max-attributes-per-line': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/singleline-html-element-content-newline': 'off',
  },
};
