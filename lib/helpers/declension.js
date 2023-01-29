/**
 * Сколняет существительные
 *
 * @example decline(1, ['минута', 'минуты', 'минут'])
 *
 * @param {number} count
 * @param {[string, string, string]} text_forms
 * @returns {string}
 */
export default function decline(count, text_forms) {
  const num = Math.abs(count) % 100;
  const tenReminder = num % 10;

  if (num > 10 && num < 20) {
    return text_forms[2];
  }

  if (tenReminder > 1 && tenReminder < 5) {
    return text_forms[1];
  }

  if (tenReminder == 1) {
    return text_forms[0];
  }

  return text_forms[2];
}
