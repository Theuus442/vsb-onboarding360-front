import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-status-tag',
  standalone: true,
  imports: [CommonModule, TagModule],
  template: `
    <p-tag 
      [value]="displayText()"
      [severity]="severity()"
      [icon]="icon()"
      styleClass="status-tag">
    </p-tag>
  `,
  styles: [`
    ::ng-deep .status-tag {
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-radius: 0.5rem;
      padding: 0.375rem 0.75rem;
    }
  `]
})
export class StatusTagComponent {
  @Input() status!: string;
  @Input() type: 'usuario' | 'parceiro' | 'documento' = 'usuario';

  protected readonly displayText = computed(() => {
    if (this.type === 'usuario') {
      return this.status === 'ativo' ? 'Ativo' : 'Inativo';
    } else if (this.type === 'parceiro') {
      return this.status;
    } else if (this.type === 'documento') {
      const statusMap: Record<string, string> = {
        'pendente': 'Pendente',
        'processando': 'Processando',
        'aprovado': 'Aprovado',
        'rejeitado': 'Rejeitado'
      };
      return statusMap[this.status] || this.status;
    }
    return this.status;
  });

  protected readonly severity = computed(() => {
    if (this.type === 'usuario') {
      return this.status === 'ativo' ? 'success' : 'danger';
    } else if (this.type === 'parceiro') {
      const severityMap: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
        'Ativa': 'success',
        'Inativa': 'danger',
        'Pendente': 'warning'
      };
      return severityMap[this.status] || 'info';
    } else if (this.type === 'documento') {
      const severityMap: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
        'pendente': 'warning',
        'processando': 'info',
        'aprovado': 'success',
        'rejeitado': 'danger'
      };
      return severityMap[this.status] || 'info';
    }
    return 'info';
  });

  protected readonly icon = computed(() => {
    if (this.type === 'usuario') {
      return this.status === 'ativo' ? 'pi pi-check-circle' : 'pi pi-times-circle';
    } else if (this.type === 'parceiro') {
      const iconMap: Record<string, string> = {
        'Ativa': 'pi pi-check-circle',
        'Inativa': 'pi pi-times-circle',
        'Pendente': 'pi pi-clock'
      };
      return iconMap[this.status] || 'pi pi-info-circle';
    } else if (this.type === 'documento') {
      const iconMap: Record<string, string> = {
        'pendente': 'pi pi-clock',
        'processando': 'pi pi-spin pi-spinner',
        'aprovado': 'pi pi-check-circle',
        'rejeitado': 'pi pi-times-circle'
      };
      return iconMap[this.status] || 'pi pi-info-circle';
    }
    return '';
  });
}
