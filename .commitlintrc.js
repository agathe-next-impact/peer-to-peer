module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
        'security',
      ],
    ],
    'scope-enum': [
      1,
      'always',
      ['backend', 'frontend', 'shared', 'docker', 'ci', 'docs'],
    ],
    'subject-max-length': [2, 'always', 100],
  },
};
