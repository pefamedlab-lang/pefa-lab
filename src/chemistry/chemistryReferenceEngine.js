import { chemistryTests } from './chemistryTests'

export function getReferenceRange(
  testCode,
  gender = 'male',
  age = 30
) {
  const test = chemistryTests[testCode]

  if (!test) return null

  let ageGroup = 'adult'

  if (age < 18) {
    ageGroup = 'pediatric'
  }

  const range =
    test.referenceRange?.[ageGroup]?.[gender]

  return range || null
}

export function getFlag(value, range) {
  if (!range || value === '') return ''

  if (Number(value) < range.low) return 'L'

  if (Number(value) > range.high) return 'H'

  return 'N'
}

export function getCriticalFlag(value, critical) {
  if (!critical || value === '') return ''

  if (critical.low && Number(value) < critical.low) {
    return 'CRITICAL LOW'
  }

  if (critical.high && Number(value) > critical.high) {
    return 'CRITICAL HIGH'
  }

  return ''
}

export function validateResult(value) {
  if (value === '' || value === null || value === undefined) {
    return false
  }

  return !isNaN(Number(value))
}