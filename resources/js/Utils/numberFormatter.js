/**
 * Formatador de números para o padrão brasileiro (pt-BR)
 * 
 * Padrão brasileiro:
 * - Separador decimal: vírgula (,)
 * - Separador de milhares: ponto (.)
 */

/**
 * Formata um número para o padrão brasileiro
 * 
 * @param {number} number - Número a ser formatado
 * @param {number} decimals - Quantidade de casas decimais (padrão: 0)
 * @returns {string} Número formatado ou string vazia se inválido
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined || isNaN(number)) return '';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

/**
 * Formata um número como moeda brasileira (R$)
 * 
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado como moeda
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Formata um número como percentual
 * 
 * @param {number} value - Valor a ser formatado (0.15 = 15%)
 * @param {number} decimals - Quantidade de casas decimais (padrão: 0)
 * @returns {string} Valor formatado como percentual
 */
export const formatPercent = (value, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) return '';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Formata um número inteiro (sem casas decimais)
 * 
 * @param {number} number - Número a ser formatado
 * @returns {string} Número inteiro formatado
 */
export const formatInteger = (number) => formatNumber(number, 0);

/**
 * Formata um número decimal com 2 casas decimais
 * 
 * @param {number} number - Número a ser formatado
 * @returns {string} Número decimal formatado
 */
export const formatDecimal = (number) => formatNumber(number, 2);
