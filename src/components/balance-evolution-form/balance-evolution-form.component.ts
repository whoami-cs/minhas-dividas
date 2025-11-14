import { Component, input, output, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoanBalanceEvolution } from '../../models/debt.model';

@Component({
  selector: 'app-balance-evolution-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-8">
      <h3 class="font-bold text-xl mb-6 text-gray-800">{{ balanceEntry() ? 'Editar' : 'Adicionar' }} Lançamento</h3>
      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div>
            <label for="launch_date" class="block text-sm font-medium text-gray-700 mb-1">Data do lançamento</label>
            <input id="launch_date" formControlName="launch_date" type="date" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
          </div>
          <div>
            <label for="reference_date" class="block text-sm font-medium text-gray-700 mb-1">Data de referência</label>
            <input id="reference_date" formControlName="reference_date" type="date" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
          </div>
          <div class="md:col-span-2">
            <label for="history" class="block text-sm font-medium text-gray-700 mb-1">Histórico</label>
            <textarea id="history" formControlName="history" placeholder="Descrição do lançamento..." class="p-3 border border-gray-300 rounded-lg w-full h-24 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"></textarea>
          </div>
          <div>
            <label for="debit" class="block text-sm font-medium text-gray-700 mb-1">Débito</label>
            <input id="debit" formControlName="debit" type="number" step="0.01" placeholder="0,00" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
          </div>
          <div>
            <label for="credit" class="block text-sm font-medium text-gray-700 mb-1">Crédito</label>
            <input id="credit" formControlName="credit" type="number" step="0.01" placeholder="0,00" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
          </div>
          <div>
            <label for="balance" class="block text-sm font-medium text-gray-700 mb-1">Saldo</label>
            <input id="balance" formControlName="balance" type="number" step="0.01" placeholder="0,00" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
          </div>
          <div>
            <label for="type" class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select id="type" formControlName="type" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
              <option value="D">Débito</option>
              <option value="C">Crédito</option>
            </select>
          </div>
        </div>
        <div class="mt-8 flex gap-4 justify-end">
          <button type="button" (click)="cancel.emit()" class="bg-gray-200 text-gray-800 font-semibold py-2 px-5 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
          <button type="submit" [disabled]="form.invalid" class="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">Salvar</button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalanceEvolutionFormComponent implements OnInit {
  balanceEntry = input<LoanBalanceEvolution | null>();
  save = output<LoanBalanceEvolution>();
  cancel = output<void>();

  private fb = inject(FormBuilder);

  form = this.fb.group({
    launch_date: ['', Validators.required],
    reference_date: ['', Validators.required],
    history: ['', Validators.required],
    debit: [0, [Validators.required, Validators.min(0)]],
    credit: [0, [Validators.required, Validators.min(0)]],
    balance: [0, Validators.required],
    type: ['D' as 'D' | 'C', Validators.required],
  });

  ngOnInit() {
    if (this.balanceEntry()) {
      this.form.patchValue({
        ...this.balanceEntry()!,
        launch_date: this.toInputDate(this.balanceEntry()!.launch_date),
        reference_date: this.toInputDate(this.balanceEntry()!.reference_date),
      });
    }
  }

  private toInputDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  private fromInputDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  submit() {
    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.getRawValue();
    const balanceData: LoanBalanceEvolution = {
      ...this.balanceEntry(),
      ...formValue,
      launch_date: this.fromInputDate(formValue.launch_date),
      reference_date: this.fromInputDate(formValue.reference_date),
    } as LoanBalanceEvolution;

    this.save.emit(balanceData);
  }
}
