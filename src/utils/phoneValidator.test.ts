import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeVietnamesePhone, parsePhoneListFromText } from './phoneValidator';

test('normalizeVietnamesePhone: formats +84 and 84 prefix correctly to 10 digits', () => {
  const r1 = normalizeVietnamesePhone('+84912345678');
  assert.equal(r1.isValid, true);
  assert.equal(r1.normalized, '0912345678');
  assert.equal(r1.carrier, 'Vinaphone');
  assert.equal(r1.international, '+84912345678');

  const r2 = normalizeVietnamesePhone('84987654321');
  assert.equal(r2.isValid, true);
  assert.equal(r2.normalized, '0987654321');
  assert.equal(r2.carrier, 'Viettel');
});

test('normalizeVietnamesePhone: handles spaces, dots, and hyphens', () => {
  const r = normalizeVietnamesePhone('090.345-6789');
  assert.equal(r.isValid, true);
  assert.equal(r.normalized, '0903456789');
  assert.equal(r.carrier, 'Mobifone');
});

test('normalizeVietnamesePhone: rejects invalid lengths and invalid prefixes', () => {
  const rShort = normalizeVietnamesePhone('091234567');
  assert.equal(rShort.isValid, false);
  assert.match(rShort.error || '', /Độ dài không hợp lệ/);

  const rInvalidPrefix = normalizeVietnamesePhone('0112345678');
  assert.equal(rInvalidPrefix.isValid, false);
  assert.match(rInvalidPrefix.error || '', /không thuộc nhà mạng/);

  const rLetters = normalizeVietnamesePhone('09123abcd8');
  assert.equal(rLetters.isValid, false);
});

test('parsePhoneListFromText: correctly deduplicates and identifies invalid rows', () => {
  const text = `
    0987654321, Nguyễn Văn A
    +84987654321, Duplicate Viettel
    0912345678, Trần Thị B
    0903456789
    0123456789, Invalid Prefix
    abcxyz, Invalid non-numeric
  `;

  const report = parsePhoneListFromText(text);
  assert.equal(report.validContacts.length, 3); // 0987654321, 0912345678, 0903456789
  assert.equal(report.duplicateCount, 1);
  assert.equal(report.invalidCount, 2);
  assert.equal(report.validContacts[0].name, 'Nguyễn Văn A');
});
