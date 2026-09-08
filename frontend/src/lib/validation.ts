export const PHONE_MAX_LENGTH = 30;

export function getPhoneValidationMessage(phone: string) {
  const value = phone.trim();
  const digitCount = (value.match(/\d/g) ?? []).length;

  if (!value) return "Phone number is required.";
  if (value.length > PHONE_MAX_LENGTH) {
    return `Phone number must be ${PHONE_MAX_LENGTH} characters or fewer.`;
  }
  if (!/^\+?[0-9][0-9\s().-]*$/.test(value)) {
    return "Use digits and optional +, spaces, parentheses, dots, or hyphens.";
  }
  if (digitCount < 7 || digitCount > 15) {
    return "Phone number must contain between 7 and 15 digits.";
  }
  return "";
}
