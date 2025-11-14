import { Injectable, signal, inject } from '@angular/core';
import { environment } from '../environments/environment';
import { CreditCardDebt, Loan, LoanAttachment, DebtAttachment, NegotiationOffer, Income, SavingsGoal } from '../models/debt.model';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl = environment.apiUrl;

  creditCardDebts = signal<CreditCardDebt[]>([]);
  loans = signal<Loan[]>([]);
  negotiationOffers = signal<NegotiationOffer[]>([]);
  income = signal<Income[]>([]);
  savingsGoals = signal<SavingsGoal[]>([]);
  apiError = signal<string | null>(null);
  apiOffline = signal<boolean>(false);
  
  // Signals para controlar estados dos componentes
  selectedDebt = signal<CreditCardDebt | null>(null);
  selectedLoan = signal<Loan | null>(null);
  isLoanEditMode = signal(false);
  isLoanAddingNew = signal(false);

  private authService = inject(AuthService);
  private tokenService = inject(TokenService);

  resetComponentStates() {
    this.selectedDebt.set(null);
    this.selectedLoan.set(null);
    this.isLoanEditMode.set(false);
    this.isLoanAddingNew.set(false);
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async fetchCreditCardDebts() {
    try {
      const response = await this.tokenService.fetchWithAuth(`${this.apiUrl}/debts`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar dívidas: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      this.creditCardDebts.set(data || []);
      this.apiError.set(null);
    } catch (error: any) {
      console.error('Error fetching credit card debts:', error);
      this.apiOffline.set(true);
      this.apiError.set(error.message || 'Falha ao conectar com a API');
      throw error;
    }
  }

  async addCreditCardDebt(debt: Omit<CreditCardDebt, 'id' | 'created_at'>) {
    try {
      const user = this.authService.currentUser();
      const response = await this.tokenService.fetchWithAuth(`${this.apiUrl}/debts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...debt, user_id: user?.id })
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || `Erro ao adicionar dívida: ${response.status}`);
      }
      if (data) {
        this.creditCardDebts.update(debts => [data, ...debts]);
      }
      this.apiError.set(null);
    } catch (error: any) {
      console.error('Error adding credit card debt:', error);
      this.apiError.set(error.message || 'Falha ao adicionar dívida');
      throw error;
    }
  }

  async updateCreditCardDebt(debt: CreditCardDebt) {
    try {
      const response = await this.tokenService.fetchWithAuth(`${this.apiUrl}/debts/${debt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(debt)
      });
      
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || `Erro ao atualizar dívida: ${response.status}`);
      }
      if (data) {
        this.creditCardDebts.update(debts => debts.map(d => d.id === data.id ? data : d));
      }
      this.apiError.set(null);
    } catch (error: any) {
      console.error('Error updating credit card debt:', error);
      this.apiError.set(error.message || 'Falha ao atualizar dívida');
      throw error;
    }
  }

  async deleteCreditCardDebt(id: number) {
    try {
      const response = await this.tokenService.fetchWithAuth(`${this.apiUrl}/debts/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(`Erro ao excluir dívida: ${response.status} ${response.statusText}`);
      }
      this.creditCardDebts.update(debts => debts.filter(d => d.id !== id));
      this.apiError.set(null);
    } catch (error: any) {
      console.error('Error deleting credit card debt:', error);
      this.apiError.set(error.message || 'Falha ao excluir dívida');
      throw error;
    }
  }

  async fetchLoans() {
    try {
      const response = await this.tokenService.fetchWithAuth(`${this.apiUrl}/loans`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar empréstimos: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      this.loans.set((data || []).map(loan => ({
        ...loan,
        installments: [],
        balance_evolution: []
      })));
      this.apiError.set(null);
    } catch (error: any) {
      console.error('Error fetching loans:', error);
      this.apiOffline.set(true);
      this.apiError.set(error.message || 'Falha ao conectar com a API');
      throw error;
    }
  }

  async fetchLoanById(id: number): Promise<Loan | null> {
    try {
      const response = await this.tokenService.fetchWithAuth(`${this.apiUrl}/loans/${id}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar empréstimo: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      this.apiError.set(null);
      return data;
    } catch (error: any) {
      console.error('Error fetching loan by id:', error);
      this.apiError.set(error.message || 'Falha ao buscar empréstimo');
      throw error;
    }
  }

  async addLoan(loan: Omit<Loan, 'id' | 'created_at'>) {
    try {
      const user = this.authService.currentUser();
      const response = await this.tokenService.fetchWithAuth(`${this.apiUrl}/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...loan, user_id: user?.id })
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || `Erro ao adicionar empréstimo: ${response.status}`);
      }
      if (data) {
        this.loans.update(loans => [data, ...loans]);
      }
      this.apiError.set(null);
    } catch (error: any) {
      console.error('Error adding loan:', error);
      this.apiError.set(error.message || 'Falha ao adicionar empréstimo');
      throw error;
    }
  }

  async updateLoan(loan: Loan) {
    try {
      const response = await this.tokenService.fetchWithAuth(`${this.apiUrl}/loans/${loan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loan)
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || `Erro ao atualizar empréstimo: ${response.status}`);
      }
      if (data) {
        this.loans.update(loans => loans.map(l => l.id === data.id ? data : l));
      }
      this.apiError.set(null);
    } catch (error: any) {
      console.error('Error updating loan:', error);
      this.apiError.set(error.message || 'Falha ao atualizar empréstimo');
      throw error;
    }
  }

  async deleteLoan(id: number) {
    try {
      const response = await this.tokenService.fetchWithAuth(`${this.apiUrl}/loans/${id}`, { 
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`Erro ao excluir empréstimo: ${response.status} ${response.statusText}`);
      }
      this.loans.update(loans => loans.filter(l => l.id !== id));
      this.apiError.set(null);
    } catch (error: any) {
      console.error('Error deleting loan:', error);
      this.apiError.set(error.message || 'Falha ao excluir empréstimo');
      throw error;
    }
  }



  async uploadLoanAttachment(file: File, loanId: number, description?: string): Promise<LoanAttachment | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (description) {
        formData.append('description', description);
      }

      const response = await this.tokenService.fetchWithAuth(`${this.apiUrl}/loan-attachments/${loanId}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Erro ao fazer upload do anexo: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading loan attachment:', error);
      return null;
    }
  }

  async fetchLoanAttachments(loanId: number): Promise<LoanAttachment[]> {
    try {
      const response = await this.tokenService.fetchWithAuth(`${this.apiUrl}/loan-attachments/${loanId}`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar anexos: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching loan attachments:', error);
      return [];
    }
  }

  async deleteLoanAttachment(attachmentId: number, fileUrl: string): Promise<boolean> {
    try {
      const response = await this.tokenService.fetchWithAuth(`${this.apiUrl}/loan-attachments/${attachmentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir anexo: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting loan attachment:', error);
      return false;
    }
  }



  async uploadDebtAttachment(file: File, debtId: number, description?: string): Promise<DebtAttachment | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (description) {
        formData.append('description', description);
      }

      const response = await this.tokenService.fetchWithAuth(`${this.apiUrl}/debt-attachments/${debtId}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Erro ao fazer upload do anexo: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading debt attachment:', error);
      return null;
    }
  }

  async fetchDebtAttachments(debtId: number): Promise<DebtAttachment[]> {
    try {
      const response = await this.tokenService.fetchWithAuth(`${this.apiUrl}/debt-attachments/${debtId}`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar anexos: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching debt attachments:', error);
      return [];
    }
  }

  async deleteDebtAttachment(attachmentId: number): Promise<boolean> {
    try {
      const response = await this.tokenService.fetchWithAuth(`${this.apiUrl}/debt-attachments/${attachmentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir anexo: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting debt attachment:', error);
      return false;
    }
  }

  async fetchNegotiationOffers(debtId: number) {
    try {
      const response = await fetch(`${this.apiUrl}/negotiation-offers/debt/${debtId}`);
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching negotiation offers:', error);
      return [];
    }
  }

  async addNegotiationOffer(offer: Omit<NegotiationOffer, 'id' | 'created_at'>) {
    try {
      const response = await fetch(`${this.apiUrl}/negotiation-offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offer)
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding negotiation offer:', error);
      return null;
    }
  }

  async updateNegotiationOffer(offer: NegotiationOffer) {
    try {
      const response = await fetch(`${this.apiUrl}/negotiation-offers/${offer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offer)
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating negotiation offer:', error);
      return null;
    }
  }

  async deleteNegotiationOffer(id: number) {
    try {
      await fetch(`${this.apiUrl}/negotiation-offers/${id}`, { method: 'DELETE' });
      return true;
    } catch (error) {
      console.error('Error deleting negotiation offer:', error);
      return false;
    }
  }

  async fetchIncome() {
    try {
      const response = await this.tokenService.fetchWithAuth(`${this.apiUrl}/income`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar rendimentos: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      this.income.set(data || []);
      this.apiError.set(null);
    } catch (error: any) {
      console.error('Error fetching income:', error);
      this.apiError.set(error.message || 'Falha ao conectar com a API');
      throw error;
    }
  }

  async addIncome(income: Omit<Income, 'id' | 'created_at'>) {
    try {
      const user = this.authService.currentUser();
      const response = await this.tokenService.fetchWithAuth(`${this.apiUrl}/income`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...income, user_id: user?.id })
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || `Erro ao adicionar rendimento: ${response.status}`);
      }
      if (data) {
        this.income.update(incomes => [data, ...incomes]);
      }
      this.apiError.set(null);
    } catch (error: any) {
      console.error('Error adding income:', error);
      this.apiError.set(error.message || 'Falha ao adicionar rendimento');
      throw error;
    }
  }

  async updateIncome(income: Income) {
    try {
      const response = await this.tokenService.fetchWithAuth(`${this.apiUrl}/income/${income.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(income)
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || `Erro ao atualizar rendimento: ${response.status}`);
      }
      if (data) {
        this.income.update(incomes => incomes.map(i => i.id === data.id ? data : i));
      }
      this.apiError.set(null);
    } catch (error: any) {
      console.error('Error updating income:', error);
      this.apiError.set(error.message || 'Falha ao atualizar rendimento');
      throw error;
    }
  }

  async deleteIncome(id: number) {
    try {
      const response = await this.tokenService.fetchWithAuth(`${this.apiUrl}/income/${id}`, { 
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`Erro ao excluir rendimento: ${response.status} ${response.statusText}`);
      }
      this.income.update(incomes => incomes.filter(i => i.id !== id));
      this.apiError.set(null);
    } catch (error: any) {
      console.error('Error deleting income:', error);
      this.apiError.set(error.message || 'Falha ao excluir rendimento');
      throw error;
    }
  }

  async fetchSavingsGoals() {
    try {
      const response = await fetch(`${this.apiUrl}/payment-plans`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar metas: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      this.savingsGoals.set(data || []);
      this.apiError.set(null);
    } catch (error: any) {
      console.error('Error fetching savings goals:', error);
      this.apiError.set(error.message || 'Falha ao conectar com a API');
      throw error;
    }
  }

  async addSavingsGoal(goal: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const response = await fetch(`${this.apiUrl}/payment-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal)
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || `Erro ao adicionar meta: ${response.status}`);
      }
      if (data) {
        this.savingsGoals.update(goals => [data, ...goals]);
      }
      this.apiError.set(null);
    } catch (error: any) {
      console.error('Error adding savings goal:', error);
      this.apiError.set(error.message || 'Falha ao adicionar meta');
      throw error;
    }
  }

  async updateSavingsGoal(goal: SavingsGoal) {
    try {
      const response = await fetch(`${this.apiUrl}/payment-plans/${goal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal)
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || `Erro ao atualizar meta: ${response.status}`);
      }
      if (data) {
        this.savingsGoals.update(goals => goals.map(g => g.id === data.id ? data : g));
      }
      this.apiError.set(null);
    } catch (error: any) {
      console.error('Error updating savings goal:', error);
      this.apiError.set(error.message || 'Falha ao atualizar meta');
      throw error;
    }
  }

  async deleteSavingsGoal(id: number) {
    try {
      const response = await fetch(`${this.apiUrl}/payment-plans/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(`Erro ao excluir meta: ${response.status} ${response.statusText}`);
      }
      this.savingsGoals.update(goals => goals.filter(g => g.id !== id));
      this.apiError.set(null);
    } catch (error: any) {
      console.error('Error deleting savings goal:', error);
      this.apiError.set(error.message || 'Falha ao excluir meta');
      throw error;
    }
  }

  async simulateGoal(targetType: 'debt' | 'loan', targetId: number, monthlyContribution: number) {
    try {
      const response = await fetch(`${this.apiUrl}/payment-plans/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, monthlyContribution })
      });
      return await response.json();
    } catch (error) {
      console.error('Error simulating goal:', error);
      throw error;
    }
  }

  async simulateAmortization(loanId: number, amortizationAmount: number) {
    try {
      const response = await fetch(`${this.apiUrl}/payment-plans/simulate-amortization`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loanId, amortizationAmount })
      });
      return await response.json();
    } catch (error) {
      console.error('Error simulating amortization:', error);
      throw error;
    }
  }
}
