module.exports = {
  extends: ['@pairemancipation/eslint-config/strapi'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
