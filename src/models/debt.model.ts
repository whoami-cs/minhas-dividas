export interface CreditCardDebt {
  id?: number;
  created_at?: string;
  local: string;
  debt_date: string;
  original_value: number;
  current_value: number;
  growth_percentage: number;
  interest_value: number;
  last_update_date: string;
  next_month_estimate: number;
  observation: string | null;
  negotiated: boolean;
  discount_percentage: number | null;
  paid_value: number | null;
  is_frozen: boolean;
  monthly_history?: MonthlyDebtHistory[];
  attachments?: DebtAttachment[];
}

export interface MonthlyDebtHistory {
  month: string;
  value: number;
  interest: number;
  payment?: number;
}

export interface LoanInstallment {
  parcel_number: number;
  due_date: string;
  payment_date: string | null;
  history: string;
  paid: boolean;
  days_late: number;
  paid_value: number | null;
  installment_value: number;
  amortization: number;
  interest: number;
  late_fee: number;
  discount: number;
  late_iof: number;
}

export interface LoanBalanceEvolution {
  launch_date: string;
  reference_date: string;
  history: string;
  debit: number;
  credit: number;
  balance: number;
  type: 'D' | 'C';
}

export interface DebtAttachment {
  id?: number;
  created_at?: string;
  debt_id: number;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  description: string | null;
  user_id?: string;
}

export interface LoanAttachment {
  id?: number;
  created_at?: string;
  loan_id: number;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  description: string | null;
  user_id?: string;
}

export interface Loan {
  id?: number;
  created_at?: string;
  contract_number: string | null;
  loan_date: string;
  creditor: string;
  loan_value: number;
  interest_value: number;
  final_value: number;
  total_installments: number;
  paid_installments: number;
  remaining_installments: number;
  remaining_value: number;
  last_payment_date: string;
  status: 'Ativo' | 'Quitado' | 'Inativo';
  observations: string | null;
  installments: LoanInstallment[];
  balance_evolution: LoanBalanceEvolution[];
  attachments?: LoanAttachment[];
}

export interface NegotiationOffer {
  id?: number;
  created_at?: string;
  debt_id: number;
  offer_date: string;
  discount_percentage: number;
  offer_value: number;
  original_value: number;
  accepted: boolean;
  notes: string | null;
}

export interface Income {
  id?: number;
  created_at?: string;
  user_id?: string;
  source: string;
  amount: number;
  income_date: string;
  recurrence: 'unique' | 'monthly' | 'weekly' | 'annual';
  category: string | null;
  is_active: boolean;
  observations: string | null;
}

export interface SavingsGoal {
  id?: number;
  created_at?: string;
  updated_at?: string;
  goal_name: string;
  target_type: 'debt' | 'loan';
  target_id: number;
  target_amount: number;
  monthly_contribution: number;
  saved_amount: number;
  estimated_months: number | null;
  target_date: string | null;
  status: 'active' | 'completed' | 'paused';
  notes: string | null;
  ai_suggestion: any;
}

export interface GoalSimulation {
  targetName: string;
  targetAmount: number;
  monthlyContribution: number;
  monthsToSave: number;
  futureValue: number;
  totalInterestGrowth: number;
  hasOffer: boolean;
  offerAmount: number | null;
  recommendation: string;
}

export interface AmortizationSimulation {
  loanName: string;
  amortizationAmount: number;
  installmentsSaved: number;
  newRemainingInstallments: number;
  interestSaved: number;
  recommendation: string;
}