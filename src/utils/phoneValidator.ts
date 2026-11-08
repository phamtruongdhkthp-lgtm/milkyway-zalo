/**
 * Vietnamese phone normalization and validation utility.
 * Supports all Vietnamese carrier prefixes (Viettel, Vinaphone, Mobifone, Vietnamobile, Gmobile, Itelecom, Wintel)
 * Handles +84, 84, 0... prefixes and common punctuation (dashes, spaces, dots).
 */

export interface PhoneValidationResult {
  isValid: boolean;
  raw: string;
  normalized: string; // standard 10-digit format starting with 0 (e.g., 0912345678)
  international: string; // standard 84 format (e.g., +84912345678)
  carrier?: string;
  error?: string;
}

export interface ParsedContactLine {
  phone: string;
  name?: string;
  extra?: string;
}

const CARRIER_PREFIXES: Record<string, string> = {
  // Viettel
  '086': 'Viettel',
  '096': 'Viettel',
  '097': 'Viettel',
  '098': 'Viettel',
  '032': 'Viettel',
  '033': 'Viettel',
  '034': 'Viettel',
  '035': 'Viettel',
  '036': 'Viettel',
  '037': 'Viettel',
  '038': 'Viettel',
  '039': 'Viettel',

  // Mobifone
  '089': 'Mobifone',
  '090': 'Mobifone',
  '093': 'Mobifone',
  '070': 'Mobifone',
  '079': 'Mobifone',
  '077': 'Mobifone',
  '076': 'Mobifone',
  '078': 'Mobifone',

  // Vinaphone
  '088': 'Vinaphone',
  '091': 'Vinaphone',
  '094': 'Vinaphone',
  '081': 'Vinaphone',
  '082': 'Vinaphone',
  '083': 'Vinaphone',
  '084': 'Vinaphone',
  '085': 'Vinaphone',

  // Vietnamobile
  '092': 'Vietnamobile',
  '056': 'Vietnamobile',
  '058': 'Vietnamobile',

  // Gmobile
  '099': 'Gmobile',
  '059': 'Gmobile',

  // Itelecom
  '087': 'Itelecom',

  // Wintel
  '055': 'Wintel',
};

export function normalizeVietnamesePhone(rawInput: string): PhoneValidationResult {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      isValid: false,
      raw: String(rawInput ?? ''),
      normalized: '',
      international: '',
      error: 'Số điện thoại trống',
    };
  }

  // Remove whitespace, dashes, dots, parentheses, slashes
  let cleaned = rawInput.trim().replace(/[\s\-\.\(\)\/\\+]/g, '');

  // Handle +84 / 84 prefix
  if (cleaned.startsWith('84')) {
    cleaned = '0' + cleaned.slice(2);
  }

  // Check if non-digits remain
  if (!/^\d+$/.test(cleaned)) {
    return {
      isValid: false,
      raw: rawInput,
      normalized: cleaned,
      international: '',
      error: 'Chứa ký tự không phải chữ số',
    };
  }

  // Vietnamese mobile phone numbers are exactly 10 digits starting with 0
  if (cleaned.length !== 10) {
    return {
      isValid: false,
      raw: rawInput,
      normalized: cleaned,
      international: '',
      error: `Độ dài không hợp lệ (${cleaned.length} số, chuẩn là 10 số)`,
    };
  }

  if (!cleaned.startsWith('0')) {
    return {
      isValid: false,
      raw: rawInput,
      normalized: cleaned,
      international: '',
      error: 'Số điện thoại phải bắt đầu bằng số 0',
    };
  }

  const prefix = cleaned.substring(0, 3);
  const carrier = CARRIER_PREFIXES[prefix];

  if (!carrier) {
    return {
      isValid: false,
      raw: rawInput,
      normalized: cleaned,
      international: '',
      error: `Đầu số [${prefix}] không thuộc nhà mạng viễn thông Việt Nam`,
    };
  }

  return {
    isValid: true,
    raw: rawInput,
    normalized: cleaned,
    international: '+84' + cleaned.slice(1),
    carrier,
  };
}

export interface ParsePhoneListReport {
  totalLines: number;
  validContacts: { phone: string; normalized: string; name?: string; carrier?: string }[];
  duplicateCount: number;
  invalidCount: number;
  invalidItems: { line: string; error: string }[];
}

/**
 * Parses a raw multiline TXT text containing phone numbers.
 * Supports:
 * - Pure phone number on each line (e.g. "0912345678")
 * - Comma or tab separated lines (e.g. "0912345678, Nguyễn Văn A, Khách VIP")
 * - Semicolon or pipe separated lines (e.g. "0987654321|Lê Thị Mai")
 */
export function parsePhoneListFromText(text: string): ParsePhoneListReport {
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const seen = new Set<string>();
  const validContacts: { phone: string; normalized: string; name?: string; carrier?: string }[] = [];
  const invalidItems: { line: string; error: string }[] = [];
  let duplicateCount = 0;

  for (const line of lines) {
    // Attempt to split by delimiter
    const parts = line.split(/[,;\t|]/).map(p => p.trim());
    const rawPhone = parts[0] || '';
    const name = parts[1] || undefined;

    const validated = normalizeVietnamesePhone(rawPhone);

    if (!validated.isValid) {
      invalidItems.push({
        line,
        error: validated.error || 'Không hợp lệ',
      });
      continue;
    }

    if (seen.has(validated.normalized)) {
      duplicateCount++;
      continue;
    }

    seen.add(validated.normalized);
    validContacts.push({
      phone: validated.normalized,
      normalized: validated.normalized,
      name,
      carrier: validated.carrier,
    });
  }

  return {
    totalLines: lines.length,
    validContacts,
    duplicateCount,
    invalidCount: invalidItems.length,
    invalidItems,
  };
}
