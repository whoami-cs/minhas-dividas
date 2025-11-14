import { Component, Input, inject, signal, OnInit, OnChanges } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { NegotiationOffer } from '../../models/debt.model';
import { ParseDatePipe } from '../../pipes/parse-date.pipe';

@Component({
  selector: 'app-negotiation-offers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe, ParseDatePipe],
  template: `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-800">Ofertas de renegociação</h3>
        @if (!readOnly) {
          <button (click)="toggleForm($event)" class="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Nova oferta
          </button>
        }
      </div>

      @if (showForm()) {
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200" (click)="$event.stopPropagation()">
          <form [formGroup]="offerForm" (ngSubmit)="saveOffer()">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Valor original</label>
                <input formControlName="original_value" type="number" step="0.01" placeholder="0.00" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Porcentagem</label>
                <input formControlName="discount_percentage" type="number" step="0.01" placeholder="0.00" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                <input formControlName="offer_value" type="number" step="0.01" placeholder="0.00" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input formControlName="offer_date" type="date" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500">
              </div>
            </div>
            <div class="mb-4">
              <label class="flex items-center gap-2">
                <input type="checkbox" formControlName="accepted" class="w-4 h-4 text-slate-600 border-gray-300 rounded focus:ring-slate-500">
                <span class="text-sm font-medium text-gray-700">Aceita</span>
              </label>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea formControlName="notes" rows="2" placeholder="Detalhes da oferta..." class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"></textarea>
            </div>
            <div class="flex gap-2 justify-end">
              <button type="button" (click)="cancelForm()" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              <button type="submit" [disabled]="offerForm.invalid" class="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:bg-gray-400 transition-colors">Salvar</button>
            </div>
          </form>
        </div>
      }

      @if (tempOffers().length > 0) {
        <div class="space-y-3">
          @for (offer of tempOffers(); track offer.id) {
            <div class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start mb-2">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-sm font-medium text-gray-600">{{ offer.offer_date | parseDate | date:'dd/MM/yyyy' }}</span>
                    <span class="px-2 py-1 text-xs font-bold rounded-full" [ngClass]="offer.accepted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'">
                      {{ offer.accepted ? 'Aceita' : 'Pendente' }}
                    </span>
                  </div>
                  <div class="grid grid-cols-3 gap-4">
                    <div>
                      <span class="text-xs text-gray-500">Valor original</span>
                      <p class="text-lg font-bold text-gray-900">{{ offer.original_value | currency:'BRL' }}</p>
                    </div>
                    <div>
                      <span class="text-xs text-gray-500">Porcentagem</span>
                      <p class="text-lg font-bold text-green-600">{{ offer.discount_percentage }}%</p>
                    </div>
                    <div>
                      <span class="text-xs text-gray-500">Valor</span>
                      <p class="text-lg font-bold text-gray-900">{{ offer.offer_value | currency:'BRL' }}</p>
                    </div>
                  </div>
                  @if (offer.notes) {
                    <p class="text-sm text-gray-600 mt-2">{{ offer.notes }}</p>
                  }
                </div>
                @if (!readOnly) {
                  <div class="flex gap-2">
                    <button (click)="editOffer(offer)" class="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors" title="Editar oferta">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                    @if (!offer.accepted) {
                      <button (click)="acceptOffer(offer)" class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Aceitar oferta">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </button>
                    }
                    <button (click)="deleteOffer(offer.id!)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir oferta">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p class="text-gray-500 text-sm">Nenhuma oferta registrada</p>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (showDeleteConfirm()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm animate-fade-in" (click)="showDeleteConfirm.set(false)">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in" (click)="$event.stopPropagation()">
            <div class="p-6">
              <div class="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 text-center mb-2">Excluir oferta?</h3>
              <p class="text-gray-600 text-center mb-6">Tem certeza que deseja excluir esta oferta de renegociação? Esta ação não pode ser desfeita.</p>
            </div>
            <div class="bg-gray-50 px-6 py-4 flex gap-3 justify-end rounded-b-2xl">
              <button (click)="showDeleteConfirm.set(false)" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              <button (click)="confirmDelete()" class="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">Sim, excluir</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class NegotiationOffersComponent implements OnInit, OnChanges {
  @Input() debtId!: number;
  @Input() readOnly = false;
  
  private dataService = inject(DataService);
  private fb = inject(FormBuilder);

  offers = signal<NegotiationOffer[]>([]);
  tempOffers = signal<NegotiationOffer[]>([]);
  showForm = signal(false);
  editingOfferId = signal<number | null>(null);
  showDeleteConfirm = signal(false);
  deletingOfferId = signal<number | null>(null);

  ngOnChanges() {
    console.log('NegotiationOffersComponent - readOnly:', this.readOnly, 'debtId:', this.debtId);
  }

  offerForm = this.fb.group({
    original_value: [0, [Validators.required, Validators.min(0)]],
    discount_percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    offer_value: [0, [Validators.required, Validators.min(0)]],
    offer_date: ['', Validators.required],
    accepted: [false],
    notes: [''],
  });

  async ngOnInit() {
    await this.loadOffers();
  }

  async loadOffers() {
    const data = await this.dataService.fetchNegotiationOffers(this.debtId);
    this.offers.set(data);
    this.tempOffers.set([...data]);
  }

  getOffers() {
    return this.tempOffers();
  }

  saveOffer() {
    if (this.offerForm.invalid) return;

    const formValue = this.offerForm.getRawValue();
    const offerData = {
      debt_id: this.debtId,
      original_value: formValue.original_value!,
      discount_percentage: formValue.discount_percentage!,
      offer_value: formValue.offer_value!,
      offer_date: this.fromInputDate(formValue.offer_date!),
      accepted: formValue.accepted!,
      notes: formValue.notes || null,
    };

    if (this.editingOfferId()) {
      const existingIndex = this.tempOffers().findIndex(o => o.id === this.editingOfferId());
      if (existingIndex !== -1) {
        const updated = [...this.tempOffers()];
        updated[existingIndex] = { ...offerData, id: this.editingOfferId()!, created_at: updated[existingIndex].created_at } as NegotiationOffer;
        this.tempOffers.set(updated);
      }
    } else {
      const tempId = Date.now();
      const newOffer = { ...offerData, id: tempId, created_at: new Date().toISOString() } as NegotiationOffer;
      this.tempOffers.set([...this.tempOffers(), newOffer]);
    }
    this.cancelForm();
  }

  editOffer(offer: NegotiationOffer) {
    this.offerForm.patchValue({
      original_value: offer.original_value,
      discount_percentage: offer.discount_percentage,
      offer_value: offer.offer_value,
      offer_date: this.toInputDate(offer.offer_date),
      accepted: offer.accepted,
      notes: offer.notes || ''
    });
    this.editingOfferId.set(offer.id!);
    this.showForm.set(true);
  }

  acceptOffer(offer: NegotiationOffer) {
    const updated = { ...offer, accepted: true };
    const index = this.tempOffers().findIndex(o => o.id === offer.id);
    if (index !== -1) {
      const updatedOffers = [...this.tempOffers()];
      updatedOffers[index] = updated;
      this.tempOffers.set(updatedOffers);
    }
  }

  deleteOffer(id: number) {
    this.deletingOfferId.set(id);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete() {
    const id = this.deletingOfferId();
    if (id !== null) {
      this.tempOffers.set(this.tempOffers().filter(o => o.id !== id));
    }
    this.showDeleteConfirm.set(false);
    this.deletingOfferId.set(null);
  }

  toggleForm(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.showForm.set(true);
  }

  cancelForm() {
    this.showForm.set(false);
    this.editingOfferId.set(null);
    this.offerForm.reset({
      original_value: 0,
      discount_percentage: 0,
      offer_value: 0,
      offer_date: '',
      accepted: false,
      notes: ''
    });
  }

  private toInputDate(dateStr: string): string {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  }

  private fromInputDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  async persistChanges() {
    const originalOffers = this.offers();
    const tempOffers = this.tempOffers();
    
    const toDelete = originalOffers.filter(o => !tempOffers.find(t => t.id === o.id));
    const toAdd = tempOffers.filter(o => o.id >= 1000000000000);
    const toUpdate = tempOffers.filter(o => {
      const original = originalOffers.find(orig => orig.id === o.id);
      return original && o.id < 1000000000000 && JSON.stringify(original) !== JSON.stringify(o);
    });
    
    for (const offer of toDelete) {
      await this.dataService.deleteNegotiationOffer(offer.id!);
    }
    
    for (const offer of toAdd) {
      const { id, created_at, ...offerData } = offer;
      await this.dataService.addNegotiationOffer(offerData);
    }
    
    for (const offer of toUpdate) {
      await this.dataService.updateNegotiationOffer(offer);
    }
    
    await this.loadOffers();
  }
}
