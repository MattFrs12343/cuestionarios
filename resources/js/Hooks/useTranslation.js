import { usePage } from '@inertiajs/react';
import { translations } from '@/Translations/pt_BR';

/**
 * Hook customizado para acessar traduções em português do Brasil
 * 
 * @returns {Object} Objeto contendo a função de tradução
 * 
 * @example
 * const { t } = useTranslation();
 * 
 * // Uso básico
 * t('auth.login') // retorna: 'Entrar'
 * 
 * // Com substituição de variáveis
 * t('validation.min', { min: 8 }) // retorna: 'Este campo deve ter no mínimo 8 caracteres'
 * 
 * // Com múltiplas substituições
 * t('pagination.showing', { from: 1, to: 10, total: 100 })
 */
export function useTranslation() {
  const { props } = usePage();
  
  /**
   * Função de tradução que busca strings traduzidas usando notação de ponto
   * e suporta substituição de variáveis
   * 
   * @param {string} key - Chave da tradução usando notação de ponto (ex: 'auth.login')
   * @param {Object} replacements - Objeto com valores para substituir na string traduzida
   * @returns {string} String traduzida com substituições aplicadas
   */
  const t = (key, replacements = {}) => {
    // Divide a chave em partes usando o ponto como separador
    const keys = key.split('.');
    let value = translations;
    
    // Navega pelo objeto de traduções usando as chaves
    for (const k of keys) {
      value = value?.[k];
      
      // Se não encontrar a chave, retorna a própria chave como fallback
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    // Se o valor encontrado não for uma string, retorna a chave
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }
    
    // Aplica as substituições de variáveis
    // Suporta tanto :variable quanto {variable}
    let translatedString = value;
    
    Object.entries(replacements).forEach(([replaceKey, replaceValue]) => {
      // Substitui padrões como :min, :max, etc.
      translatedString = translatedString.replace(
        new RegExp(`:${replaceKey}`, 'g'),
        replaceValue
      );
      
      // Substitui padrões como {min}, {max}, etc.
      translatedString = translatedString.replace(
        new RegExp(`\\{${replaceKey}\\}`, 'g'),
        replaceValue
      );
    });
    
    return translatedString;
  };
  
  /**
   * Função auxiliar para verificar se uma chave de tradução existe
   * 
   * @param {string} key - Chave da tradução
   * @returns {boolean} true se a chave existe, false caso contrário
   */
  const has = (key) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        return false;
      }
    }
    
    return typeof value === 'string';
  };
  
  /**
   * Função auxiliar para obter todas as traduções de uma categoria
   * 
   * @param {string} category - Categoria de traduções (ex: 'auth', 'common')
   * @returns {Object} Objeto com todas as traduções da categoria
   */
  const getCategory = (category) => {
    return translations[category] || {};
  };
  
  return { 
    t,
    has,
    getCategory,
    translations 
  };
}

export default useTranslation;
