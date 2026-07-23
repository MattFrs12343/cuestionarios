/**
 * Formatador de datas para o padrão brasileiro (pt-BR)
 * 
 * Formatos disponíveis:
 * - 'short': DD/MM/YYYY
 * - 'long': DD de mês por extenso de YYYY
 * - 'datetime': DD/MM/YYYY HH:mm
 * - 'time': HH:mm
 */

/**
 * Formata uma data para o padrão brasileiro
 * 
 * @param {string|Date} date - Data a ser formatada
 * @param {string} format - Formato desejado ('short', 'long', 'datetime', 'time')
 * @returns {string} Data formatada ou string vazia se data inválida
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const d = new Date(date);
  
  // Verifica se a data é válida
  if (isNaN(d.getTime())) return '';
  
  const options = {
    short: { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    },
    long: { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    },
    datetime: { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }
  };
  
  const selectedOptions = options[format] || options.short;
  
  return new Intl.DateTimeFormat('pt-BR', selectedOptions).format(d);
};

/**
 * Formata uma data para o formato DD/MM/YYYY
 * 
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data formatada
 */
export const formatDateShort = (date) => formatDate(date, 'short');

/**
 * Formata uma data para o formato DD/MM/YYYY HH:mm
 * 
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data e hora formatadas
 */
export const formatDateTime = (date) => formatDate(date, 'datetime');

/**
 * Formata apenas a hora no formato HH:mm
 * 
 * @param {string|Date} date - Data/hora a ser formatada
 * @returns {string} Hora formatada
 */
export const formatTime = (date) => formatDate(date, 'time');

/**
 * Formata uma data para o formato por extenso
 * 
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data formatada por extenso
 */
export const formatDateLong = (date) => formatDate(date, 'long');
