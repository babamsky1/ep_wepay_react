import { toWords } from "number-to-words";

export function formatCurrency(amount?: number): string {
  return `${(amount ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatAmountInWords(amount: number): string {
  if (amount === 0) return 'ZERO';
  
  const wholePart = Math.floor(amount);
  const decimalPart = Math.round((amount - wholePart) * 100);
  
  let words = toWords(wholePart);
  
  if (decimalPart > 0) {
    words += ' AND ' + toWords(decimalPart) + ' CENTAVOS';
  }
  
  return words.toUpperCase();
}