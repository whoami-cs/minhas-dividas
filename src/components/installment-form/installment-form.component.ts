import { Component, input, output, signal, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoanInstallment } from '../../models/debt.model';

@Component({
  selector: 'app-installment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-8">
      <h3 class="font-bold text-xl mb-6 text-gray-800">{{ installment() ? 'Editar' : 'Adicionar' }} parcela</h3>
      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
          <div>
            <label for="parcel_number" class="block text-sm font-medium text-gray-700 mb-1">Nº da parcela</label>
            <input id="parcel_number" formControlName="parcel_number" type="number" placeholder="1" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
            @if (form.get('parcel_number')?.hasError('parcelExists') && form.get('parcel_number')?.touched) {
              <p class="text-red-600 text-xs mt-1">Esta parcela já existe</p>
            }
          </div>
          <div>
            <label for="due_date" class="block text-sm font-medium text-gray-700 mb-1">Data de vencimento</label>
            <input id="due_date" formControlName="due_date" type="date" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
          </div>
          <div>
            <label for="installment_value" class="block text-sm font-medium text-gray-700 mb-1">Valor da parcela</label>
            <input id="installment_value" formControlName="installment_value" type="number" step="0.01" placeholder="0,00" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
          </div>
          <div>
            <label for="payment_date" class="block text-sm font-medium text-gray-700 mb-1">Data de pagamento</label>
            <input id="payment_date" formControlName="payment_date" type="date" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
          </div>
          <div>
            <label for="paid_value" class="block text-sm font-medium text-gray-700 mb-1">Valor pago</label>
            <input id="paid_value" formControlName="paid_value" type="number" step="0.01" placeholder="0,00" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
          </div>
          <div class="flex items-center justify-start bg-gray-50 border border-gray-300 rounded-lg p-3 mt-7">
            <input formControlName="paid" type="checkbox" id="paid-checkbox" class="h-4 w-4 rounded border-gray-300 text-slate-600 focus:ring-slate-500">
            <label for="paid-checkbox" class="ml-3 block text-sm font-medium text-gray-700">Parcela paga</label>
          </div>
          <div class="md:col-span-3">
            <label for="history" class="block text-sm font-medium text-gray-700 mb-1">Histórico</label>
            <textarea id="history" formControlName="history" placeholder="Detalhes do pagamento..." class="p-3 border border-gray-300 rounded-lg w-full h-24 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"></textarea>
          </div>
        </div>
        <div class="mt-8 flex gap-4 justify-end">
          <button type="button" (click)="cancel.emit()" class="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-5 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="submit" [disabled]="form.invalid" class="bg-slate-800 text-white font-semibold py-2 px-5 rounded-lg hover:bg-slate-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">Salvar</button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstallmentFormComponent implements OnInit {
  installment = input<LoanInstallment | null>();
  existingInstallments = input<LoanInstallment[]>([]);
  totalInstallments = input<number>(0);
  save = output<LoanInstallment>();
  cancel = output<void>();
  validationError = output<string>();

  private fb = inject(FormBuilder);

  form = this.fb.group({
    parcel_number: [0, [Validators.required, Validators.min(1)]],
    due_date: ['', Validators.required],
    payment_date: ['' as string | null],
    history: [''],
    paid: [false, Validators.required],
    days_late: [0],
    paid_value: [null as number | null],
    installment_value: [0, [Validators.required, Validators.min(0)]],
    amortization: [0],
    interest: [0],
    late_fee: [0],
    discount: [0],
    late_iof: [0],
  });

  ngOnInit() {
    if (this.installment()) {
      this.form.patchValue({
        ...this.installment()!,
        due_date: this.toInputDate(this.installment()!.due_date),
        payment_date: this.toInputDate(this.installment()!.payment_date),
      });
    }

    this.form.get('paid')?.valueChanges.subscribe(paid => {
        if (paid && !this.form.get('payment_date')?.value) {
            this.form.get('payment_date')?.setValue(new Date().toISOString().split('T')[0]);
        }
        if (paid && !this.form.get('paid_value')?.value) {
            this.form.get('paid_value')?.setValue(this.form.get('installment_value')?.value);
        }
    });

    this.form.get('parcel_number')?.valueChanges.subscribe(parcelNumber => {
      const isEditing = this.installment() !== null;
      const exists = this.existingInstallments().some(i => i.parcel_number === parcelNumber);
      
      if (!isEditing && exists) {
        this.form.get('parcel_number')?.setErrors({ parcelExists: true });
      } else if (this.form.get('parcel_number')?.hasError('parcelExists')) {
        this.form.get('parcel_number')?.setErrors(null);
      }
    });
  }

  private toInputDate(dateStr: string | null | undefined): string | null {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  private fromInputDate(dateStr: string | null | undefined): string | null {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  submit() {
    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.getRawValue();
    
    if (this.totalInstallments() > 0 && formValue.parcel_number > this.totalInstallments()) {
      this.validationError.emit(`O número da parcela (${formValue.parcel_number}) não pode ser maior que o total de parcelas (${this.totalInstallments()}).`);
      return;
    }

    const installmentData: LoanInstallment = {
        ...this.installment(),
        ...formValue,
        due_date: this.fromInputDate(formValue.due_date)!,
        payment_date: this.fromInputDate(formValue.payment_date),
        paid_value: formValue.paid ? (formValue.paid_value ?? formValue.installment_value) : null,
    } as LoanInstallment;

    this.save.emit(installmentData);
  }


}
