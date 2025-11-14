import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BreadcrumbItem {
  label: string;
  action?: () => void;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="flex items-center space-x-2 text-sm mb-6">
      @for (item of items(); track $index; let isLast = $last) {
        @if (!isLast) {
          <button 
            (click)="item.action?.()" 
            class="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
            {{ item.label }}
          </button>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        } @else {
          <span class="text-gray-700 font-semibold">{{ item.label }}</span>
        }
      }
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
  items = input.required<BreadcrumbItem[]>();
}
