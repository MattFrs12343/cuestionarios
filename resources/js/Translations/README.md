# Sistema de Tradução - Frontend React

Este diretório contém o sistema de tradução centralizado para o frontend React da aplicação.

## Estrutura

```
resources/js/
├── Translations/
│   ├── pt_BR.js          # Arquivo centralizado de traduções
│   └── README.md         # Este arquivo
└── Hooks/
    └── useTranslation.js # Hook para acessar traduções
```

## Como Usar

### 1. Importar o Hook

```javascript
import { useTranslation } from '@/Hooks/useTranslation';
```

### 2. Usar no Componente

```javascript
export default function MeuComponente() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('auth.login')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### 3. Substituição de Variáveis

```javascript
// Com uma variável
const message = t('validation.min', { min: 8 });
// Resultado: "Este campo deve ter no mínimo 8 caracteres"

// Com múltiplas variáveis
const message = t('auth.throttle', { seconds: 60 });
// Resultado: "Muitas tentativas de login. Tente novamente em 60 segundos"
```

### 4. Verificar se uma Tradução Existe

```javascript
const { has } = useTranslation();

if (has('auth.login')) {
  // A tradução existe
}
```

### 5. Obter Categoria Completa

```javascript
const { getCategory } = useTranslation();

const authTranslations = getCategory('auth');
// Retorna todo o objeto auth com todas as traduções
```

## Categorias Disponíveis

- **auth**: Autenticação (login, registro, senha, etc.)
- **common**: Textos comuns (salvar, cancelar, editar, etc.)
- **navigation**: Navegação (menu, links, etc.)
- **questionnaires**: Módulo de questionários
- **admin**: Módulo administrativo (usuários, equipes, funções)
- **validation**: Mensagens de validação
- **profile**: Perfil do usuário
- **pagination**: Paginação
- **notifications**: Notificações e mensagens
- **datetime**: Datas e tempo

## Adicionar Novas Traduções

Para adicionar novas traduções, edite o arquivo `pt_BR.js`:

```javascript
export const translations = {
  // ... traduções existentes
  
  // Nova categoria
  minha_categoria: {
    minha_chave: 'Minha tradução',
    outra_chave: 'Outra tradução com :variavel',
  },
};
```

## Boas Práticas

1. **Use chaves descritivas**: `auth.login` em vez de `login1`
2. **Organize por módulo**: Agrupe traduções relacionadas
3. **Use substituição de variáveis**: Para textos dinâmicos
4. **Mantenha consistência**: Use os mesmos termos em toda a aplicação
5. **Documente traduções complexas**: Adicione comentários quando necessário

## Exemplos Práticos

### Formulário de Login

```javascript
import { useTranslation } from '@/Hooks/useTranslation';

export default function Login() {
  const { t } = useTranslation();
  
  return (
    <form>
      <label>{t('auth.email')}</label>
      <input 
        type="email" 
        placeholder={t('auth.email_placeholder')} 
      />
      
      <label>{t('auth.password')}</label>
      <input 
        type="password" 
        placeholder={t('auth.password_placeholder')} 
      />
      
      <button>{t('auth.login')}</button>
      <a href="#">{t('auth.forgot_password')}</a>
    </form>
  );
}
```

### Mensagens de Validação

```javascript
import { useTranslation } from '@/Hooks/useTranslation';

export default function FormField({ error, minLength }) {
  const { t } = useTranslation();
  
  return (
    <div>
      <input />
      {error && (
        <span className="error">
          {t('validation.min', { min: minLength })}
        </span>
      )}
    </div>
  );
}
```

### Navegação

```javascript
import { useTranslation } from '@/Hooks/useTranslation';

export default function Navigation() {
  const { t } = useTranslation();
  
  return (
    <nav>
      <a href="/dashboard">{t('navigation.dashboard')}</a>
      <a href="/questionnaires">{t('navigation.questionnaires')}</a>
      <a href="/admin">{t('navigation.admin')}</a>
      <a href="/profile">{t('navigation.profile')}</a>
    </nav>
  );
}
```

## Suporte

Para dúvidas ou sugestões sobre o sistema de tradução, consulte a documentação do projeto ou entre em contato com a equipe de desenvolvimento.
