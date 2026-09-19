export interface ValidationResult<T> {
  isValid: boolean;
  errors: string[];
  data?: T;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  // Accepts Egyptian and international phone formats
  return /^(\+?20|0)?1[0125][0-9]{8}$/.test(phone.replace(/[\s-]/g, '')) || phone.replace(/\D/g, '').length >= 8;
}

export interface ValidatedOrderItem {
  productId: string;
  variantId?: string;
  productName: string;
  productNameAr?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedOptions?: Record<string, any>;
}

export interface ValidatedOrderPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  address: string;
  postalCode?: string;
  isCorporate?: boolean;
  companyName?: string;
  taxNumber?: string;
  paymentMethod: string;
  notes?: string;
  items: ValidatedOrderItem[];
  discount?: number;
  shipping?: number;
}

export function validateOrderInput(body: any): ValidationResult<ValidatedOrderPayload> {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { isValid: false, errors: ['Invalid order request body.'] };
  }

  const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
  if (!customerName || customerName.length < 2) {
    errors.push('الاسم بالكامل مطلوب / Full name must be at least 2 characters.');
  }

  const customerEmail = typeof body.customerEmail === 'string' ? body.customerEmail.trim() : '';
  if (!customerEmail || !isValidEmail(customerEmail)) {
    errors.push('يرجى إدخال بريد إلكتروني صحيح / A valid email address is required.');
  }

  const customerPhone = typeof body.customerPhone === 'string' ? body.customerPhone.trim() : '';
  if (!customerPhone || !isValidPhone(customerPhone)) {
    errors.push('يرجى إدخال رقم هاتف مصري صحيح / A valid phone number is required.');
  }

  const city = typeof body.city === 'string' ? body.city.trim() : '';
  if (!city || city.length < 2) {
    errors.push('يرجى تحديد المحافظة والمدينة / City and governorate are required.');
  }

  const address = typeof body.address === 'string' ? body.address.trim() : '';
  if (!address || address.length < 3) {
    errors.push('يرجى كتابة تفاصيل العنوان والشارع بشكل واضح / A detailed address is required.');
  }

  const paymentMethod = typeof body.paymentMethod === 'string' ? body.paymentMethod.trim() : 'cod';

  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.push('Order must contain at least one item.');
  }

  const validatedItems: ValidatedOrderItem[] = [];
  if (Array.isArray(body.items)) {
    for (let i = 0; i < body.items.length; i++) {
      const item = body.items[i];
      if (!item || typeof item !== 'object') {
        errors.push(`Item #${i + 1} is invalid.`);
        continue;
      }

      if (!item.productId || typeof item.productId !== 'string') {
        errors.push(`Item #${i + 1} is missing a valid product ID.`);
      }

      const quantity = Number(item.quantity);
      if (isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
        errors.push(`Item #${i + 1} quantity must be a positive integer.`);
      }

      const unitPrice = Number(item.unitPrice ?? item.price);
      if (isNaN(unitPrice) || unitPrice < 0) {
        errors.push(`Item #${i + 1} has an invalid price.`);
      }

      validatedItems.push({
        productId: item.productId,
        variantId: item.variantId || undefined,
        productName: item.productName || item.title || item.name || 'Product',
        productNameAr: item.productNameAr || undefined,
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: Number((quantity * unitPrice).toFixed(2)),
        selectedOptions: item.selectedOptions || undefined,
      });
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      customerName,
      customerEmail,
      customerPhone,
      city,
      address,
      postalCode: body.postalCode ? String(body.postalCode).trim() : undefined,
      isCorporate: Boolean(body.isCorporate),
      companyName: body.companyName ? String(body.companyName).trim() : undefined,
      taxNumber: body.taxNumber ? String(body.taxNumber).trim() : undefined,
      paymentMethod,
      notes: body.notes ? String(body.notes).trim() : undefined,
      items: validatedItems,
      discount: typeof body.discount === 'number' && body.discount >= 0 ? body.discount : 0,
      shipping: typeof body.shipping === 'number' && body.shipping >= 0 ? body.shipping : 0,
    },
  };
}

/**
 * Parses a raw user name into first name and last name.
 * Handles standard spaced names, CamelCase/PascalCase (e.g. AhmedElMenshawy),
 * delimiter-separated names (dots, hyphens, underscores), and Arabic compound names.
 */
export function parseFullName(rawName?: string | null): { firstName: string; lastName: string } {
  if (!rawName || typeof rawName !== 'string') {
    return { firstName: '', lastName: '' };
  }

  const cleaned = rawName.trim();
  if (!cleaned) {
    return { firstName: '', lastName: '' };
  }

  // 1. If it contains whitespace already
  if (/\s+/.test(cleaned)) {
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' };
    }
    const arabicCompoundPrefixes = ['عبد', 'أبو', 'ابو', 'ابن', 'أم', 'ام'];
    if (parts.length >= 3 && arabicCompoundPrefixes.includes(parts[0])) {
      return {
        firstName: `${parts[0]} ${parts[1]}`,
        lastName: parts.slice(2).join(' ')
      };
    }
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' ')
    };
  }

  // 2. If no whitespace, handle CamelCase / PascalCase (e.g. "AhmedElMenshawy" -> "Ahmed ElMenshawy")
  const camelSplit = cleaned
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1 $2')
    .trim();

  if (camelSplit.includes(' ')) {
    const parts = camelSplit.split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' ')
    };
  }

  // 3. Delimiter-separated names (e.g. "ahmed.elmenshawy", "ahmed_elmenshawy")
  if (/[-_.]/.test(cleaned)) {
    const parts = cleaned.split(/[-_.]+/).filter(Boolean);
    if (parts.length > 1) {
      return {
        firstName: parts[0],
        lastName: parts.slice(1).join(' ')
      };
    }
  }

  // 4. Single-word name fallback
  return { firstName: cleaned, lastName: '' };
}
