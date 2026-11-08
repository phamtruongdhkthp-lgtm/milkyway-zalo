/**
 * Template parser for Zalo personalized marketing campaigns.
 * Supports:
 * - Variable interpolation: {ten_khach_hang}, {so_dien_thoai}, {danh_xung}, {ma_voucher}, {thoi_gian}
 * - Spintax randomized variations: {Xin chào|Kính chào|Chào bạn}
 */

export interface ContactData {
  name?: string;
  phone?: string;
  salutation?: string; // Anh / Chị / Bạn
  voucher?: string;
  customData?: Record<string, string>;
}

/**
 * Resolves spintax syntax like "{Xin chào|Chào bạn|Kính chào}"
 * Nested or single-level spintax is evaluated.
 */
export function resolveSpintax(text: string, seed?: number): string {
  const spintaxRegex = /\{([^{}]+)\}/g;

  let result = text;
  let hasMatches = true;
  let loopCount = 0;

  while (hasMatches && loopCount < 10) {
    loopCount++;
    hasMatches = false;

    result = result.replace(spintaxRegex, (match, choicesStr) => {
      // If it contains pipe '|', it's a spintax group
      if (choicesStr.includes('|')) {
        hasMatches = true;
        const options = choicesStr.split('|').map((s: string) => s.trim());
        const randomIndex = seed !== undefined 
          ? Math.abs(seed) % options.length 
          : Math.floor(Math.random() * options.length);
        return options[randomIndex] || '';
      }
      // If no pipe, return original match (could be a variable like {ten_khach_hang})
      return match;
    });
  }

  return result;
}

/**
 * Determines appropriate Vietnamese time greeting (buổi sáng, buổi chiều, buổi tối)
 */
export function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'buổi sáng';
  if (hour >= 12 && hour < 18) return 'buổi chiều';
  return 'buổi tối';
}

/**
 * Renders a full personalized message with variables and spintax
 */
export function renderPersonalizedMessage(
  template: string,
  contact: ContactData,
  seed?: number
): string {
  if (!template) return '';

  // Step 1: Resolve spintax
  let output = resolveSpintax(template, seed);

  // Step 2: Extract or infer variables
  const name = contact.name && contact.name.trim() !== '' ? contact.name.trim() : 'bạn';
  const phone = contact.phone || '';
  const salutation = contact.salutation || 'Anh/Chị';
  const voucher = contact.voucher || `ZL${Math.floor(100000 + Math.random() * 900000)}`;
  const time = getTimeOfDayGreeting();

  // Step 3: Replace variables (case-insensitive)
  output = output
    .replace(/\{ten_khach_hang\}/gi, name)
    .replace(/\{name\}/gi, name)
    .replace(/\{so_dien_thoai\}/gi, phone)
    .replace(/\{phone\}/gi, phone)
    .replace(/\{danh_xung\}/gi, salutation)
    .replace(/\{salutation\}/gi, salutation)
    .replace(/\{ma_voucher\}/gi, voucher)
    .replace(/\{voucher\}/gi, voucher)
    .replace(/\{thoi_gian\}/gi, time)
    .replace(/\{time\}/gi, time);

  // Custom data replacements if provided
  if (contact.customData) {
    for (const [key, val] of Object.entries(contact.customData)) {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      output = output.replace(regex, val);
    }
  }

  return output.trim();
}
