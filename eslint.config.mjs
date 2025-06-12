import {dirname} from 'path';
import {fileURLToPath} from 'url';
import {FlatCompat} from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/generated/**',
            '**/coverage/**',
            '**/*.spec.ts',
            '**/src/app/generated/**'
        ],
    },
    ...compat.extends('next/core-web-vitals'),
    {
        files: [
            '**/*.{js,mjs,cjs,ts,jsx,tsx}'
        ],
    },
    ...compat.extends('next/typescript'),
    ...compat.extends('plugin:react-hooks/recommended'),

    {
        files: ['**/*.spec.ts', '**/*.spec.js', '**/*.test.ts', '**/*.test.js'],
        ...compat.extends('plugin:jest/recommended'),
    },
    {
        files: [
            '**/*.{js,mjs,cjs,ts,jsx,tsx}'
        ],
        rules: {
            // React/Next.js специфичные правила
            'react/prop-types': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/display-name': 'off',
            'react/no-unknown-property': 'off',

            // React Hooks правила
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': ['error', { enableDangerousAutofixThisMayCauseInfiniteLoops: true }],

            // Импорты
            'import/no-unresolved': ['error', { ignore: ['^@/.*'] }],
            'import/named': 'off',
            'import/namespace': 'off',

            // Fixes
            'semi': ['error', 'always'],
            'quotes': ['error', 'single', { 'avoidEscape': true }],
            'no-multiple-empty-lines': ['error', { 'max': 1 }],
            'no-trailing-spaces': 'error',
            'eol-last': ['error', 'always'],

            // TypeScript правила - настройка согласно предпочтениям
            '@typescript-eslint/no-unused-vars': 'off', // Отключено как в Vue конфигурации
            '@typescript-eslint/no-explicit-any': 'off', // Отключено как в Vue конфигурации
            '@typescript-eslint/explicit-function-return-type': 'off', // Опционально
            '@typescript-eslint/explicit-module-boundary-types': 'off', // Опционально
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
        }
    }
];

export default eslintConfig;
