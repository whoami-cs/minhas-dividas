# Mudanças necessárias no loan-detail.component.ts

## No modo de edição (effectiveEditMode), seção de Anexos:

Substituir o header de:
```
<header class="p-5 flex justify-between items-center border-b border-gray-200">
  <div>
    <h3 class="text-lg font-semibold text-gray-800">Anexos</h3>
    @if (!loan()) {
      <p class="text-sm text-gray-500 mt-1">Anexos disponíveis após salvar o empréstimo</p>
    }
  </div>
  @if (loan()) {
    <div class="flex items-center gap-2">
      @if (isUploadingAttachment()) {
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
          Enviando...
        </div>
      }
      <input type="file" #attachmentInputEdit hidden (change)="handleAttachmentUpload($event)" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">
      <button (click)="attachmentInputEdit.click()" [disabled]="isUploadingAttachment()" class="flex items-center gap-2 bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 disabled:bg-gray-400 transition-colors text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
        Adicionar anexo
      </button>
    </div>
  }
</header>
```

Por:
```
<header class="p-5 flex justify-between items-center border-b border-gray-200">
  <h3 class="text-lg font-semibold text-gray-800">Anexos</h3>
  <div class="flex items-center gap-2">
    <input type="file" #attachmentInputEdit hidden (change)="handleTempAttachmentUpload($event)" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">
    <button (click)="attachmentInputEdit.click()" class="flex items-center gap-2 bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors text-sm">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
      Adicionar anexo
    </button>
  </div>
</header>
```

## No modo de edição, conteúdo de Anexos:

Substituir de `@if (attachments().length > 0) {` até o `@else` por:
```
@if (tempAttachments().length > 0 || attachments().length > 0) {
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    @for (tempAtt of tempAttachments(); track $index) {
      <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate" [title]="tempAtt.file.name">{{ tempAtt.file.name }}</p>
              <p class="text-xs text-gray-500">{{ formatFileSize(tempAtt.file.size) }}</p>
            </div>
          </div>
        </div>
        <button (click)="removeTempAttachment($index)" class="w-full flex items-center justify-center gap-1 py-1.5 px-3 bg-red-50 text-red-600 text-xs font-medium rounded hover:bg-red-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Remover
        </button>
      </div>
    }
    @for (attachment of attachments(); track attachment.id) {
      <!-- Manter o código existente dos attachments -->
    }
  </div>
} @else {
  <div class="text-center py-12 text-gray-500">
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 text-gray-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    <p class="text-sm">Nenhum anexo adicionado</p>
  </div>
}
```

## No modo de edição, seção de Parcelas:

Substituir o header de:
```
<header class="p-5 flex justify-between items-center border-b border-gray-200">
  <div>
    <h3 class="text-lg font-semibold text-gray-800">Histórico de parcelas</h3>
    @if (!loan()) {
      <p class="text-sm text-gray-500 mt-1">Parcelas disponíveis após salvar o empréstimo</p>
    }
  </div>
  @if (loan()) {
    <button (click)="openInstallmentForm()" class="flex items-center gap-2 bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors text-sm">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      Adicionar parcela
    </button>
  }
</header>
```

Por:
```
<header class="p-5 flex justify-between items-center border-b border-gray-200">
  <h3 class="text-lg font-semibold text-gray-800">Histórico de parcelas</h3>
  <button (click)="openInstallmentForm()" class="flex items-center gap-2 bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors text-sm">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
    Adicionar parcela
  </button>
</header>
```

## Na tabela de parcelas do modo de edição:

Substituir as ações de:
```
<td class="py-3 px-4 text-center">
  @if (loan()) {
    <button (click)="editInstallment(installment)" class="text-slate-600 hover:text-slate-800 p-1 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>
    <button (click)="deleteInstallment(installment.parcel_number)" class="text-red-600 hover:text-red-700 p-1 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
  } @else {
    <span class="text-gray-400 text-xs">-</span>
  }
</td>
```

Por:
```
<td class="py-3 px-4 text-center">
  <button (click)="editInstallment(installment)" class="text-slate-600 hover:text-slate-800 p-1 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>
  <button (click)="deleteTempInstallment(installment.parcel_number)" class="text-red-600 hover:text-red-700 p-1 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
</td>
```
