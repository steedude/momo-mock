import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  ignores: ['.agents/**', 'skills-lock.json', 'pnpm-lock.yaml', '.husky/**'],
})
