/**
 * Utility functions for formatting chemical formulas, equations, and IUPAC text.
 * Converts numbers in formulas to proper Unicode subscripts (e.g., H2SO4 -> H₂SO₄, Ca(OH)2 -> Ca(OH)₂)
 * and charges to superscripts (e.g., Fe3+ -> Fe³⁺, SO4 2- -> SO₄²⁻).
 */

export function toSubscriptDigits(str: string): string {
  const map: Record<string, string> = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
  };
  return str
    .split('')
    .map((c) => map[c] || c)
    .join('');
}

export function toSuperscriptDigits(str: string): string {
  const map: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
    '+': '⁺',
    '-': '⁻',
  };
  return str
    .split('')
    .map((c) => map[c] || c)
    .join('');
}

/**
 * Clean up weird characters and LaTeX artifacts, then format chemical formulas with subscripts.
 */
export function formatChemicalText(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // 1. Remove unwanted artifacts like @/, \text{}, \ce{}, LaTeX $, etc.
  cleaned = cleaned
    .replace(/@\//g, '')
    .replace(/@/g, '')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\ce\{([^}]+)\}/g, '$1')
    .replace(/\\rightarrow/g, ' → ')
    .replace(/\\longrightarrow/g, ' → ')
    .replace(/\\equiv/g, ' ≡ ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\uparrow/g, '↑')
    .replace(/\\downarrow/g, '↓')
    .replace(/\$/g, '');

  // 2. Convert explicit LaTeX subscript patterns: H_2SO_4 or H_{2}SO_{4}
  cleaned = cleaned.replace(/_\{(\d+)\}/g, (_, digits) => toSubscriptDigits(digits));
  cleaned = cleaned.replace(/_(\d+)/g, (_, digits) => toSubscriptDigits(digits));

  // 3. Convert explicit LaTeX superscript patterns: Fe^{3+} or Fe^{3}
  cleaned = cleaned.replace(/\^\{([^}]+)\}/g, (_, charge) => toSuperscriptDigits(charge));

  // 4. Convert chemical formula numbers after chemical element letters or closing brackets ), ], }
  // Examples: H2 -> H₂, SO4 -> SO₄, Ca(OH)2 -> Ca(OH)₂, CuSO4.5H2O -> CuSO₄.5H₂O
  // Avoid converting standalone numbers or numbers at the start of words like "100ml", "2.0M", "10%", "37°C"
  cleaned = cleaned.replace(/([A-Za-z\)\}\]])(\d+)/g, (match, char, digits) => {
    return char + toSubscriptDigits(digits);
  });

  // 5. Convert common ion charges like Fe3+, Cu2+, SO4 2-, Cl-
  cleaned = cleaned.replace(/([A-Za-z₀-₉]+)\s*(\d*[\+\-])/g, (match, group1, charge) => {
    if (!charge) return match;
    return group1 + toSuperscriptDigits(charge);
  });

  return cleaned;
}

/**
 * Format a single formula string (e.g. "H2SO4" -> "H₂SO₄")
 */
export function formatFormula(formula: string): string {
  if (!formula) return '';
  return formatChemicalText(formula);
}
