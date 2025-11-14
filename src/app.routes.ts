import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CreditCardDebtsComponent } from './components/credit-card-debts/credit-card-debts.component';
import { LoansComponent } from './components/loans/loans.component';
import { IncomeComponent } from './components/income/income.component';
import { SavingsGoalsComponent } from './components/savings-goals/savings-goals.component';

export const routes: Routes = [
  { path: '', redirectTo: '/painel', pathMatch: 'full' },
  { path: 'login', children: [] },
  { path: 'painel', component: DashboardComponent },
  { path: 'dividas', component: CreditCardDebtsComponent },
  { path: 'emprestimos', component: LoansComponent },
  { path: 'rendimentos', component: IncomeComponent },
  { path: 'metas', component: SavingsGoalsComponent },
  { path: '**', redirectTo: '/painel' }
];
