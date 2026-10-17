export function money(value, currency) {
  if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value))) return 'Not recorded';
  try { return new Intl.NumberFormat('en-IN', currency ? { style:'currency', currency } : { minimumFractionDigits:2, maximumFractionDigits:2 }).format(Number(value)); }
  catch { return `${currency || ''} ${Number(value).toFixed(2)}`.trim(); }
}
export const currencyLabel = currency => currency || 'Currency not recorded';
export function dateLabel(value) { const date = value ? new Date(value) : null; return date && Number.isFinite(date.getTime()) ? date.toLocaleDateString() : 'Not recorded'; }
export function ratingLabel(value){const rating=Number(value);return value!==null&&value!==undefined&&value!==''&&Number.isFinite(rating)&&rating>=1&&rating<=5?rating.toFixed(1):'Not rated';}
export function coursePriceLabel(course){return course.price===0?'Free':money(course.price,course.currency);}
