import { CustomerInformation, CheckoutFormErrors } from "@/types/checkout";

/**
 * Normalizes Persian and Arabic numbers to English digits, removes spaces and hyphens.
 */
export function normalizeDigits(input: string): string {
  if (!input) return "";

  const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const arabicIndicMap = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  let normalized = input;

  for (let i = 0; i < 10; i++) {
    normalized = normalized.replace(persianDigits[i], String(i));
    normalized = normalized.replace(new RegExp(arabicIndicMap[i], "g"), String(i));
  }

  // Remove spaces and hyphens for phone & postal code
  return normalized.trim();
}

/**
 * Normalizes Iranian phone numbers to 09XXXXXXXXX format.
 */
export function normalizeIranianPhone(phone: string): string {
  let normalized = normalizeDigits(phone).replace(/[\s-]/g, "");
  if (normalized.startsWith("+98")) {
    normalized = "0" + normalized.slice(3);
  } else if (normalized.startsWith("0098")) {
    normalized = "0" + normalized.slice(4);
  } else if (normalized.startsWith("98") && normalized.length === 12) {
    normalized = "0" + normalized.slice(2);
  }
  return normalized;
}

/**
 * Validates Iranian mobile numbers.
 * Accepted normalized format: 09XXXXXXXXX (11 digits starting with 09)
 */
export function isValidIranianMobile(phone: string): boolean {
  const normalized = normalizeIranianPhone(phone);
  return /^09\d{9}$/.test(normalized);
}

/**
 * Validates Iranian 10-digit postal code.
 */
export function isValidPostalCode(postalCode: string): boolean {
  const normalized = normalizeDigits(postalCode).replace(/[\s-]/g, "");
  return /^\d{10}$/.test(normalized);
}

/**
 * Validates checkout customer form fields.
 */
export function validateCustomerForm(customer: CustomerInformation): {
  isValid: boolean;
  errors: CheckoutFormErrors;
  normalizedCustomer: CustomerInformation;
} {
  const errors: CheckoutFormErrors = {};

  const normalizedPhone = normalizeIranianPhone(customer.phone);
  const normalizedPostalCode = normalizeDigits(customer.postalCode).replace(/[\s-]/g, "");

  if (!customer.firstName.trim()) {
    errors.firstName = "نام را وارد کنید";
  }

  if (!customer.lastName.trim()) {
    errors.lastName = "نام خانوادگی را وارد کنید";
  }

  if (!normalizedPhone) {
    errors.phone = "شماره موبایل را وارد کنید";
  } else if (!isValidIranianMobile(normalizedPhone)) {
    errors.phone = "شماره موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)";
  }

  if (!customer.province) {
    errors.province = "استان را انتخاب کنید";
  }

  if (!customer.city) {
    errors.city = "شهر را انتخاب کنید";
  }

  if (!customer.address.trim()) {
    errors.address = "آدرس دقیق را وارد کنید";
  }

  if (!normalizedPostalCode) {
    errors.postalCode = "کد پستی را وارد کنید";
  } else if (!isValidPostalCode(normalizedPostalCode)) {
    errors.postalCode = "کد پستی باید ۱۰ رقم باشد";
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    normalizedCustomer: {
      ...customer,
      phone: normalizedPhone,
      postalCode: normalizedPostalCode,
    },
  };
}
