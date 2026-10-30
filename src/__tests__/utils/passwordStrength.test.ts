import { describe, it, expect } from 'vitest';
import { isStrongPassword, getPasswordStrength } from '@/utils/passwordStrength';

describe('isStrongPassword', () => {
    it.each([
        ['Heslo1234', true],
        ['Abcdefg1', true],
        ['heslo1234', false],
        ['HesloHeslo', false],
        ['Hes1', false],
        ['', false],
    ])('%j => %s', (value, expected) => expect(isStrongPassword(value)).toBe(expected));

    it('zhoduje sa s pravidlami backendu (min. 8 znakov, veľké písmeno, číslica)', () => {
        expect(isStrongPassword('Abcdefg1')).toBe(true);
        expect(isStrongPassword('Abcdef1')).toBe(false);
    });
});

describe('getPasswordStrength', () => {
    it('prázdne heslo: empty, skóre 0', () => {
        const r = getPasswordStrength('');
        expect(r).toMatchObject({ labelKey: 'empty', score: 0, isWeak: true, isStrong: false });
    });

    it('heslo splňujúce 0 alebo 1 pravidlo je weak', () => {
        expect(getPasswordStrength('abc').labelKey).toBe('weak');
        expect(getPasswordStrength('abcdefghij').labelKey).toBe('weak');
    });

    it('heslo splňujúce 2 pravidlá je medium', () => {
        const r = getPasswordStrength('abcdefg1');
        expect(r).toMatchObject({ labelKey: 'medium', score: 2, isWeak: false, isStrong: false });
    });

    it('heslo splňujúce všetky pravidlá je strong', () => {
        const r = getPasswordStrength('Heslo1234');
        expect(r).toMatchObject({ labelKey: 'strong', score: 3, isStrong: true, isWeak: false });
    });

    it('vráti stav každého pravidla v poli checks', () => {
        const r = getPasswordStrength('abc1');
        expect(r.checks).toEqual([
        { key: 'length', valid: false },
        { key: 'uppercase', valid: false },
        { key: 'number', valid: true },
        ]);
    });
});