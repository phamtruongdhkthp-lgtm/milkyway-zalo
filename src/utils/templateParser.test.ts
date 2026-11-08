import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSpintax, renderPersonalizedMessage } from './templateParser';

test('resolveSpintax: selects option based on seed deterministically', () => {
  const template = '{Chào bạn|Kính chào|Xin chào}';
  const opt0 = resolveSpintax(template, 0);
  const opt1 = resolveSpintax(template, 1);
  const opt2 = resolveSpintax(template, 2);

  assert.equal(opt0, 'Chào bạn');
  assert.equal(opt1, 'Kính chào');
  assert.equal(opt2, 'Xin chào');
});

test('renderPersonalizedMessage: replaces contact variables', () => {
  const template = 'Xin chào {ten_khach_hang}, số của bạn là {so_dien_thoai}. Mã quà tặng: {ma_voucher}';
  const rendered = renderPersonalizedMessage(
    template,
    {
      name: 'Anh Tuấn',
      phone: '0988776655',
      voucher: 'SALE50',
    },
    0
  );

  assert.equal(rendered, 'Xin chào Anh Tuấn, số của bạn là 0988776655. Mã quà tặng: SALE50');
});

test('renderPersonalizedMessage: uses fallback when name is absent', () => {
  const template = 'Chào {ten_khach_hang} thân mến!';
  const rendered = renderPersonalizedMessage(template, {}, 0);
  assert.equal(rendered, 'Chào bạn thân mến!');
});
