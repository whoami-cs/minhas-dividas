import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'parseDate',
  standalone: true,
})
export class ParseDatePipe implements PipeTransform {
  transform(value: string | null | undefined): Date | null {
    if (!value || typeof value !== 'string') {
      return null;
    }

    // Ignora o placeholder de data inválido
    if (value.toLowerCase() === 'dd/mm/yyyy' || value === '') {
        return null;
    }

    const parts = value.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!parts) {
      // Tenta fazer o parse de outros formatos que o `new Date()` pode suportar
      const date = new Date(value);
      return !isNaN(date.getTime()) ? date : null;
    }

    // parts será ['dd/MM/yyyy', 'dd', 'MM', 'yyyy']
    const day = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10) - 1; // Mês é 0-indexado no JS Date
    const year = parseInt(parts[3], 10);

    const date = new Date(year, month, day);
    
    // Verificação final de validade
    if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
        return date;
    }

    return null;
  }
}
