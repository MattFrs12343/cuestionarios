/**
 * Formatador de datas para o padrão brasileiro (pt-BR)
 * 
 * Formatos disponíveis:
 * - 'short': DD/MM/YYYY
 * - 'long': DD de mês por extenso de YYYY
 * - 'datetime': DD/MM/YYYY HH:mm
 * - 'time': HH:mm
 */

const MESES_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

/**
 * Extrai ano/mês/dia de uma data "pura" (sem hora) sem passar por `Date`,
 * que interpreta strings "YYYY-MM-DD" como meia-noite UTC. Em um navegador
 * com fuso horário atrás de UTC (ex. America/Sao_Paulo, -03:00), isso faz o
 * dia exibido retroceder um dia em relação ao que foi realmente salvo —
 * mesmo quando o backend manda a data com hora/offset (ex.
 * "2024-01-15T03:00:00.000000Z"), já que o prefixo YYYY-MM-DD segue sendo o
 * dia correto no fuso do servidor (America/Sao_Paulo, sempre atrás de UTC).
 */
const parseDateOnly = (date) => {
  const match = String(date).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  return { year: +match[1], month: +match[2], day: +match[3] };
};

/**
 * Formata uma data para o padrão brasileiro
 *
 * @param {string|Date} date - Data a ser formatada
 * @param {string} format - Formato desejado ('short', 'long', 'datetime', 'time')
 * @returns {string} Data formatada ou string vazia se data inválida
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';

  // 'short'/'long' representam uma data de calendário (data_exame,
  // data_nascimento): parse direto do texto, sem Date/fuso horário.
  if (format === 'short' || format === 'long') {
    const parsed = parseDateOnly(date);
    if (!parsed) return '';

    const { year, month, day } = parsed;

    if (format === 'long') {
      return `${String(day).padStart(2, '0')} de ${MESES_PT[month - 1]} de ${year}`;
    }

    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  }

  // 'datetime'/'time' representam um instante real (created_at, etc.):
  // aí sim a hora local do navegador é a informação correta a mostrar.
  const d = new Date(date);

  if (isNaN(d.getTime())) return '';

  const options = {
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

  const selectedOptions = options[format] || options.datetime;

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
