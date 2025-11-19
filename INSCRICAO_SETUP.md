# Sistema de Inscrição - UltraVôlei Joinville

## 📋 Configuração Inicial

### 1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Nomeie o projeto (ex: "ultravolei-joinville")
4. Siga os passos e crie o projeto

### 2. Configurar Firebase Authentication

1. No menu lateral, vá em **Authentication**
2. Clique em "Começar"
3. Ative o método **E-mail/senha**
4. Vá em **Users** e clique em "Adicionar usuário"
5. Crie um usuário administrador:
   - E-mail: `admin@ultravolei.com.br` (ou outro de sua escolha)
   - Senha: (crie uma senha segura)

### 3. Configurar Firestore Database

1. No menu lateral, vá em **Firestore Database**
2. Clique em "Criar banco de dados"
3. Escolha o modo de produção
4. Selecione uma localização (ex: `southamerica-east1`)
5. Configure as regras de segurança:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita em registrations para todos
    match /registrations/{document=**} {
      allow read, write: if true;
    }
  }
}
```

**IMPORTANTE:** Para produção, ajuste as regras para maior segurança:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /registrations/{registration} {
      // Qualquer um pode criar uma inscrição
      allow create: if true;
      // Apenas admins autenticados podem ler, atualizar ou deletar
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

### 4. Configurar Storage

1. No menu lateral, vá em **Storage**
2. Clique em "Começar"
3. Configure as regras de segurança:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /team-photos/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

### 5. Obter Credenciais do Firebase

1. No menu lateral, clique no ícone de engrenagem ⚙️ > **Configurações do projeto**
2. Role até "Seus apps"
3. Clique no ícone da web `</>`
4. Registre seu app (nome: "UltraVôlei Website")
5. Copie as credenciais do `firebaseConfig`

### 6. Configurar o Projeto

1. Abra o arquivo `firebaseConfig.ts`
2. Substitua os valores de `firebaseConfig` pelas suas credenciais:

```typescript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_AUTH_DOMAIN_AQUI",
  projectId: "SEU_PROJECT_ID_AQUI",
  storageBucket: "SEU_STORAGE_BUCKET_AQUI",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID_AQUI",
  appId: "SEU_APP_ID_AQUI"
};
```

## 🚀 Como Usar

### Para Usuários (Inscrição de Equipes)

1. Acesse: `http://localhost:3000/#/inscricao`
2. Preencha o formulário com:
   - Nome da equipe
   - Categoria (feminino/masculino/misto)
   - Foto da equipe (opcional)
   - Dados do técnico (nome, CPF, telefone, e-mail)
   - Lista de atletas com:
     - Nome completo
     - CPF e RG
     - Data de nascimento
     - Posição
     - Número do jogador
3. Clique em "Enviar Inscrição"

### Para Administradores

#### Login
1. Acesse: `http://localhost:3000/#/admin/login`
2. Use as credenciais criadas no Firebase Authentication
3. Faça login

#### Dashboard Administrativo
Após o login, você terá acesso ao painel onde pode:

- **Visualizar** todas as inscrições
- **Filtrar** por status (todas, pendentes, aprovadas, rejeitadas)
- **Aprovar** inscrições
- **Rejeitar** inscrições
- **Alterar status** de volta para pendente
- **Excluir** inscrições
- Ver **estatísticas** em tempo real
- Ver **detalhes completos** de cada equipe e atletas

## 📁 Estrutura de Arquivos Criados

```
ultravolei/
├── firebaseConfig.ts          # Configuração do Firebase
├── types.ts                    # Interfaces TypeScript (atualizado)
├── RegistrationPage.tsx        # Página de inscrição pública
├── AdminLoginPage.tsx          # Página de login administrativo
├── AdminDashboard.tsx          # Dashboard de gerenciamento
├── App.tsx                     # Rotas atualizadas
└── INSCRICAO_SETUP.md         # Este arquivo
```

## 🔐 Segurança

### Recomendações para Produção

1. **Firestore Rules:** Ajuste as regras para permitir apenas usuários autenticados a gerenciar inscrições
2. **Storage Rules:** Configure regras mais restritivas para upload de imagens
3. **Environment Variables:** Mova as credenciais do Firebase para variáveis de ambiente (.env)
4. **Rate Limiting:** Configure limites no Firebase para evitar spam

## 🎨 Funcionalidades Implementadas

✅ Formulário de inscrição com validação
✅ Upload de fotos para Firebase Storage
✅ Armazenamento de dados no Firestore
✅ Sistema de autenticação para admins
✅ Dashboard com estatísticas em tempo real
✅ Filtros por status
✅ Gerenciamento completo (aprovar/rejeitar/excluir)
✅ Interface responsiva
✅ Design consistente com o site

## 📝 Próximos Passos Opcionais

- [ ] Adicionar notificações por e-mail ao aprovar/rejeitar
- [ ] Exportar dados para Excel/CSV
- [ ] Adicionar mais filtros (por categoria, data, etc.)
- [ ] Implementar busca por nome de equipe
- [ ] Adicionar validação de CPF
- [ ] Implementar paginação para muitas inscrições
- [ ] Adicionar confirmação por e-mail ao inscrever

## 🆘 Suporte

Em caso de dúvidas:
1. Verifique o console do navegador para erros
2. Confira as configurações do Firebase
3. Verifique se as regras de segurança estão corretas
4. Teste primeiro com as regras abertas e depois restrinja

---

**Desenvolvido para UltraVôlei Joinville** 🏐
