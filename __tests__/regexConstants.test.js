const { NAME_REGEX } = require('../constants')

describe('Regex Constants', () => {
    it('NAME_REGEX should validate correct length', () => {
        expect(NAME_REGEX.test('ab')).toBe(true)
        expect(NAME_REGEX.test('a')).toBe(false)
        expect(NAME_REGEX.test('a'.repeat(51))).toBe(false)
        expect(NAME_REGEX.test('a'.repeat(50))).toBe(true)
    })
})
