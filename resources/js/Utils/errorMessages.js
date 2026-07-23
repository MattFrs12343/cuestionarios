/**
 * Função utilitária para fornecer mensagens de erro mais descritivas
 * Mapeia erros comuns de validação do Laravel para mensagens amigáveis ao usuário
 */
export const getDescriptiveErrorMessage = (field, error) => {
    // Se o erro já é descritivo, retorne-o
    if (!error) return '';
    
    // Padrões de erro comuns e suas substituições descritivas
    const errorPatterns = {
        // Erros de e-mail
        'email': {
            'required': 'Por favor, insira seu e-mail',
            'email': 'Por favor, insira um e-mail válido (exemplo: usuario@dominio.com)',
            'exists': 'Não encontramos uma conta com este e-mail',
            'invalid': 'O e-mail inserido não é válido',
        },
        // Erros de senha
        'password': {
            'required': 'Por favor, insira sua senha',
            'min': 'A senha deve ter pelo menos 8 caracteres',
            'incorrect': 'A senha inserida está incorreta. Por favor, verifique e tente novamente',
            'invalid': 'As credenciais fornecidas não correspondem aos nossos registros',
        },
        // Erros gerais de autenticação
        'auth': {
            'failed': 'As credenciais fornecidas não correspondem aos nossos registros. Por favor, verifique seu e-mail e senha',
            'throttle': 'Muitas tentativas de login. Por favor, tente novamente em alguns minutos',
            'inactive': 'Sua conta está inativa. Por favor, entre em contato com o administrador',
            'blocked': 'Sua conta foi bloqueada. Por favor, entre em contato com o suporte técnico',
        }
    };

    // Verifica se a mensagem de erro contém padrões comuns
    const lowerError = error.toLowerCase();
    
    // Verifica erros de throttle
    if (lowerError.includes('too many') || lowerError.includes('throttle') || lowerError.includes('muitas tentativas')) {
        return errorPatterns.auth.throttle;
    }
    
    // Verifica erros de autenticação falhada
    if (lowerError.includes('credentials') || lowerError.includes('invalid') || lowerError.includes('credenciais')) {
        return errorPatterns.auth.failed;
    }
    
    // Verifica erros específicos de campo
    if (errorPatterns[field]) {
        // Verifica tipos específicos de erro
        if (lowerError.includes('required') || lowerError.includes('field is required') || lowerError.includes('obrigatório')) {
            return errorPatterns[field].required || error;
        }
        if ((lowerError.includes('email') || lowerError.includes('e-mail')) && field === 'email') {
            return errorPatterns[field].email || error;
        }
        if (lowerError.includes('min') || lowerError.includes('at least') || lowerError.includes('pelo menos')) {
            return errorPatterns[field].min || error;
        }
        if (lowerError.includes('incorrect') || lowerError.includes('wrong') || lowerError.includes('incorreta')) {
            return errorPatterns[field].incorrect || error;
        }
    }
    
    // Retorna o erro original se nenhum padrão corresponder
    return error;
};

/**
 * Obtém uma mensagem de erro geral de autenticação
 */
export const getAuthErrorMessage = (errors) => {
    // Verifica se há um erro geral de autenticação
    if (errors.email && errors.password) {
        return 'Por favor, verifique seu e-mail e senha e tente novamente';
    }
    
    return null;
};
