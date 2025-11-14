import { Component, signal, computed, inject, viewChild, ElementRef, afterNextRender, effect } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="space-y-6">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900">Visão geral</h2>
        <p class="text-gray-600 mt-1">Acompanhe suas finanças em tempo real</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
            </div>
            <span class="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">Original</span>
          </div>
          <p class="text-sm font-medium text-gray-600 mb-1">Valor original</p>
          <p class="text-3xl font-bold text-gray-900">{{ totalGeneralOriginal() | currency:'BRL' }}</p>
          <p class="text-xs text-gray-500 mt-2">Sem juros</p>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            </div>
            <span class="text-xs font-semibold bg-rose-50 text-rose-700 px-3 py-1 rounded-full">Cartões</span>
          </div>
          <p class="text-sm font-medium text-gray-600 mb-1">Total em dívidas</p>
          <p class="text-3xl font-bold text-gray-900">{{ totalDebts() | currency:'BRL' }}</p>
          <p class="text-xs text-gray-500 mt-2">{{ creditCardCount() }} cartão(ões)</p>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 8-4 4 4 4"/><path d="M8 12h13a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1"/></svg>
            </div>
            <span class="text-xs font-semibold bg-amber-50 text-amber-700 px-3 py-1 rounded-full">Empréstimos</span>
          </div>
          <p class="text-sm font-medium text-gray-600 mb-1">Saldo devedor</p>
          <p class="text-3xl font-bold text-gray-900">{{ totalLoans() | currency:'BRL' }}</p>
          <p class="text-xs text-gray-500 mt-2">{{ loanCount() }} empréstimo(s)</p>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <span class="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">Total</span>
          </div>
          <p class="text-sm font-medium text-gray-600 mb-1">Dívida total</p>
          <p class="text-3xl font-bold text-gray-900">{{ totalGeneral() | currency:'BRL' }}</p>
          <p class="text-xs text-gray-500 mt-2">Todas as contas</p>
        </div>
      </div>

      @if (creditCardDebts().length > 0 || loans().length > 0) {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Distribuição das dívidas</h3>
            <div style="height: 300px;">
              <canvas #distributionChart></canvas>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Valor original vs Atual</h3>
            <div style="height: 300px;">
              <canvas #comparisonChart></canvas>
            </div>
          </div>

          @if (creditCardDebts().length > 0) {
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Maiores dívidas</h3>
              <div style="height: 300px;">
                <canvas #topDebtsChart></canvas>
              </div>
            </div>
          }

          @if (loans().length > 0) {
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Progresso dos empréstimos</h3>
              <div style="height: 300px;">
                <canvas #loanProgressChart></canvas>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class DashboardComponent {
  dataService = inject(DataService);
  
  creditCardDebts = this.dataService.creditCardDebts;
  loans = this.dataService.loans;
  
  totalDebts = computed(() => this.creditCardDebts().reduce((acc, debt) => acc + debt.current_value, 0));
  totalDebtsOriginal = computed(() => this.creditCardDebts().reduce((acc, debt) => acc + debt.original_value, 0));
  totalLoans = computed(() => this.loans().reduce((acc, loan) => acc + loan.remaining_value, 0));
  totalLoansOriginal = computed(() => this.loans().reduce((acc, loan) => acc + loan.loan_value, 0));
  totalGeneral = computed(() => this.totalDebts() + this.totalLoans());
  totalGeneralOriginal = computed(() => this.totalDebtsOriginal() + this.totalLoansOriginal());
  creditCardCount = computed(() => this.creditCardDebts().length);
  loanCount = computed(() => this.loans().length);

  distributionChartRef = viewChild<ElementRef>('distributionChart');
  comparisonChartRef = viewChild<ElementRef>('comparisonChart');
  topDebtsChartRef = viewChild<ElementRef>('topDebtsChart');
  loanProgressChartRef = viewChild<ElementRef>('loanProgressChart');

  private distributionChart?: Chart;
  private comparisonChart?: Chart;
  private topDebtsChart?: Chart;
  private loanProgressChart?: Chart;

  constructor() {
    this.loadData();
    
    afterNextRender(() => {
      setTimeout(() => this.initCharts(), 200);
    });

    effect(() => {
      const debts = this.creditCardDebts();
      const loansData = this.loans();
      
      if (debts.length > 0 || loansData.length > 0) {
        setTimeout(() => this.updateCharts(), 200);
      }
    });
  }

  private async loadData() {
    try {
      await Promise.all([
        this.dataService.fetchCreditCardDebts(),
        this.dataService.fetchLoans()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  private initCharts() {
    this.createDistributionChart();
    this.createComparisonChart();
    this.createTopDebtsChart();
    this.createLoanProgressChart();
  }

  private updateCharts() {
    if (this.distributionChart) this.distributionChart.destroy();
    if (this.comparisonChart) this.comparisonChart.destroy();
    if (this.topDebtsChart) this.topDebtsChart.destroy();
    if (this.loanProgressChart) this.loanProgressChart.destroy();
    this.initCharts();
  }

  private createDistributionChart() {
    const canvas = this.distributionChartRef()?.nativeElement;
    if (!canvas) return;

    const debtsTotal = this.totalDebts();
    const loansTotal = this.totalLoans();
    
    if (debtsTotal === 0 && loansTotal === 0) return;

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Cartões de crédito', 'Empréstimos'],
        datasets: [{
          data: [debtsTotal, loansTotal],
          backgroundColor: ['#e11d48', '#d97706'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 20, font: { size: 12 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${(ctx.parsed as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
            }
          }
        }
      }
    };

    this.distributionChart = new Chart(canvas, config);
  }

  private createComparisonChart() {
    const canvas = this.comparisonChartRef()?.nativeElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ['Cartões', 'Empréstimos'],
        datasets: [
          {
            label: 'Valor original',
            data: [this.totalDebtsOriginal(), this.totalLoansOriginal()],
            backgroundColor: '#3b82f6',
            borderRadius: 8
          },
          {
            label: 'Valor atual',
            data: [this.totalDebts(), this.totalLoans()],
            backgroundColor: '#e11d48',
            borderRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 20, font: { size: 12 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${(ctx.parsed.y as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => (value as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
            }
          }
        }
      }
    };

    this.comparisonChart = new Chart(canvas, config);
  }

  private createTopDebtsChart() {
    const canvas = this.topDebtsChartRef()?.nativeElement;
    if (!canvas) return;

    const topDebts = [...this.creditCardDebts()]
      .sort((a, b) => b.current_value - a.current_value)
      .slice(0, 5);
    
    if (topDebts.length === 0) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: topDebts.map(d => d.local),
        datasets: [{
          label: 'Valor Atual',
          data: topDebts.map(d => d.current_value),
          backgroundColor: '#e11d48',
          borderRadius: 8
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${(ctx.parsed.x as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: (value) => (value as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
            }
          }
        }
      }
    };

    this.topDebtsChart = new Chart(canvas, config);
  }

  private createLoanProgressChart() {
    const canvas = this.loanProgressChartRef()?.nativeElement;
    if (!canvas) return;

    const loanData = this.loans().map(loan => ({
      creditor: loan.creditor,
      progress: (loan.paid_installments / loan.total_installments) * 100
    }));
    
    if (loanData.length === 0) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: loanData.map(l => l.creditor),
        datasets: [{
          label: 'Progresso (%)',
          data: loanData.map(l => l.progress),
          backgroundColor: '#d97706',
          borderRadius: 8
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${(ctx.parsed.x as number).toFixed(1)}% concluído`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value) => `${value}%`
            }
          }
        }
      }
    };

    this.loanProgressChart = new Chart(canvas, config);
  }
}
