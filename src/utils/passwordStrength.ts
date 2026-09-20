export type PasswordStrengthLevel = 'empty' | 'weak' | 'medium' | 'strong';

export interface PasswordStrengthResult {
  score: number;
  labelKey: PasswordStrengthLevel;
  color: string;
  isStrong: boolean;
  isWeak: boolean;
  checks: Array<{ key: 'length' | 'uppercase' | 'number'; valid: boolean }>;
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
}

export function getPasswordStrength(password: string): PasswordStrengthResult {
  const checks = [
    { key: 'length', valid: password.length >= 8 },
    { key: 'uppercase', valid: /[A-Z]/.test(password) },
    { key: 'number', valid: /\d/.test(password) },
  ] as const;

  const validCount = checks.filter((rule) => rule.valid).length;

  if (!password) {
    return {
      score: 0,
      labelKey: 'empty',
      color: 'var(--color-line)',
      isStrong: false,
      isWeak: true,
      checks: [...checks],
    };
  }

  if (isStrongPassword(password)) {
    return {
      score: 3,
      labelKey: 'strong',
      color: 'var(--color-sage)',
      isStrong: true,
      isWeak: false,
      checks: [...checks],
    };
  }

  if (validCount <= 1) {
    return {
      score: 1,
      labelKey: 'weak',
      color: 'var(--color-alert)',
      isStrong: false,
      isWeak: true,
      checks: [...checks],
    };
  }

  return {
    score: 2,
    labelKey: 'medium',
    color: 'var(--color-warning)',
    isStrong: false,
    isWeak: false,
    checks: [...checks],
  };
}
