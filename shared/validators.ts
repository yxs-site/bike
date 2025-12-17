// server/validators.ts

/**
 * Remove a formatação de uma string (pontos, traços, parênteses, espaços).
 * @param value A string a ser limpa.
 * @returns A string contendo apenas dígitos.
 */
const cleanNumber = (value: string): string => {
  return value.replace(/[^0-9]/g, "");
};

// --- Validação de CPF ---

/**
 * Implementa o algoritmo completo de validação de CPF.
 * @param cpf O CPF a ser validado (pode estar formatado ou não).
 * @returns true se o CPF for válido, false caso contrário.
 */
export function isValidCPF(cpf: string): boolean {
  const cleanedCpf = cleanNumber(cpf);

  // 1. Verificar se tem 11 dígitos
  if (cleanedCpf.length !== 11) {
    return false;
  }

  // 2. Rejeitar CPFs com todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(cleanedCpf)) {
    return false;
  }

  let sum = 0;
  let remainder: number;

  // 3. Calcular primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cleanedCpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cleanedCpf.substring(9, 10))) {
    return false;
  }

  sum = 0;
  // 4. Calcular segundo dígito verificador
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cleanedCpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cleanedCpf.substring(10, 11))) {
    return false;
  }

  // 5. CPF válido
  return true;
}

/**
 * Formata um CPF (apenas dígitos) para o padrão XXX.XXX.XXX-XX.
 * @param cpf O CPF a ser formatado (apenas dígitos).
 * @returns O CPF formatado.
 */
export function formatCPF(cpf: string): string {
  const cleanedCpf = cleanNumber(cpf).substring(0, 11);
  if (cleanedCpf.length !== 11) return cleanedCpf;

  return cleanedCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

// --- Validação de Email ---

/**
 * Valida o formato, comprimento e ausência de espaços em um email.
 * @param email O email a ser validado.
 * @returns true se o email for válido, false caso contrário.
 */
export function isValidEmail(email: string): boolean {
  // 1. Garantir que não tenha espaços
  if (email.includes(" ")) {
    return false;
  }

  // 2. Verificar comprimento máximo (320 caracteres)
  if (email.length > 320) {
    return false;
  }

  // 3. Validar formato básico (usuario@dominio.com)
  // Regex simples para formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// --- Validação de Telefone ---

/**
 * Valida o formato brasileiro de telefone (10 ou 11 dígitos).
 * @param phone O telefone a ser validado (pode estar formatado ou não).
 * @returns true se o telefone for válido, false caso contrário.
 */
export function isValidPhone(phone: string): boolean {
  const cleanedPhone = cleanNumber(phone);
  const length = cleanedPhone.length;

  // 1. Verificar se tem 10 ou 11 dígitos
  if (length !== 10 && length !== 11) {
    return false;
  }

  // 2. Rejeitar números com todos os dígitos iguais
  if (/^(\d)\1+$/.test(cleanedPhone)) {
    return false;
  }

  // 3. Validar DDD (primeiro dígito não pode ser 0)
  const ddd = parseInt(cleanedPhone.substring(0, 2));
  if (ddd < 11 || ddd > 99) {
    return false;
  }

  // 4. Se tiver 11 dígitos, o 3º deve ser 9 (celular)
  if (length === 11) {
    const thirdDigit = cleanedPhone.substring(2, 3);
    if (thirdDigit !== "9") {
      return false;
    }
  }

  // 5. O primeiro dígito do número (após o DDD) deve ser 2-9 para 10 dígitos
  // ou 9 para 11 dígitos (já verificado acima)
  const firstDigitAfterDDD = cleanedPhone.substring(2, 3);
  if (length === 10 && !/[2-9]/.test(firstDigitAfterDDD)) {
    return false;
  }

  return true;
}

/**
 * Formata um telefone (apenas dígitos) para o padrão (XX) XXXXX-XXXX (se 11 dígitos)
 * ou (XX) XXXX-XXXX (se 10 dígitos).
 * @param phone O telefone a ser formatado (apenas dígitos).
 * @returns O telefone formatado.
 */
export function formatPhone(phone: string): string {
  const cleanedPhone = cleanNumber(phone);
  const length = cleanedPhone.length;

  if (length === 11) {
    // (XX) XXXXX-XXXX
    return cleanedPhone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (length === 10) {
    // (XX) XXXX-XXXX
    return cleanedPhone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return cleanedPhone;
}

// Exportar a função de limpeza para uso interno ou em outros módulos
export { cleanNumber };

// --- Validação de CEP ---

/**
 * Valida o formato brasileiro de CEP (8 dígitos).
 * @param cep O CEP a ser validado (pode estar formatado ou não).
 * @returns true se o CEP for válido, false caso contrário.
 */
export function isValidCEP(cep: string): boolean {
  const cleanedCEP = cleanNumber(cep);
  // O CEP deve ter exatamente 8 dígitos
  return cleanedCEP.length === 8;
}

/**
 * Formata um CEP (apenas dígitos) para o padrão XXXXX-XXX.
 * @param cep O CEP a ser formatado (apenas dígitos).
 * @returns O CEP formatado.
 */
export function formatCEP(cep: string): string {
  const cleanedCEP = cleanNumber(cep).substring(0, 8);
  if (cleanedCEP.length === 8) {
    return cleanedCEP.replace(/(\d{5})(\d{3})/, "$1-$2");
  }
  return cleanedCEP;
}
