# Correção: Refresh Automático de Token

## Problema Identificado

O token JWT expirava após 1 hora e o usuário precisava fazer login novamente, mesmo com o sistema de refresh implementado.

## Causa Raiz

O **DataService** estava usando `fetch()` diretamente em vez de `TokenService.fetchWithAuth()` em várias requisições. Isso impedia que o interceptor de refresh automático funcionasse corretamente.

### Exemplo do problema:
```typescript
// ❌ ERRADO - Não renova token automaticamente
const token = this.tokenService.getToken();
const response = await fetch(`${this.apiUrl}/loans`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// ✅ CORRETO - Renova token automaticamente
const response = await this.tokenService.fetchWithAuth(`${this.apiUrl}/loans`);
```

## Solução Aplicada

Substituídas todas as chamadas `fetch()` diretas por `tokenService.fetchWithAuth()` no arquivo `data.service.ts`:

- ✅ fetchLoans()
- ✅ fetchLoanById()
- ✅ addLoan()
- ✅ updateLoan()
- ✅ deleteLoan()
- ✅ uploadLoanAttachment()
- ✅ fetchLoanAttachments()
- ✅ deleteLoanAttachment()
- ✅ uploadDebtAttachment()
- ✅ fetchDebtAttachments()
- ✅ deleteDebtAttachment()
- ✅ fetchIncome()
- ✅ addIncome()
- ✅ updateIncome()
- ✅ deleteIncome()

## Como Funciona Agora

1. **Token expira após 1 hora**
2. **Próxima requisição retorna 401**
3. **TokenService detecta erro 401**
4. **Usa refresh_token para obter novo access_token**
5. **Refaz requisição automaticamente com novo token**
6. **Usuário não precisa fazer login novamente**

## Benefícios

- ✅ Sessão mantida por até 30 dias (validade do refresh_token)
- ✅ Usuário não é deslogado a cada hora
- ✅ Experiência contínua sem interrupções
- ✅ Segurança mantida com tokens de curta duração

## Teste

Para testar se está funcionando:

1. Faça login na aplicação
2. Aguarde mais de 1 hora (ou force expiração do token)
3. Faça qualquer ação (adicionar dívida, empréstimo, etc.)
4. A ação deve funcionar normalmente sem pedir login novamente
