import { Injectable, inject } from '@angular/core';
import { Observable, of, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

export interface Checklist {
  id: number;
  parceiro_id: number;
  etapas: ChecklistEtapa[];
  created_at?: string;
  updated_at?: string;
}

export interface ChecklistEtapa {
  id?: number;
  nome: string;
  status: 'pendente' | 'concluido';
  checklist_id?: number;
}

export interface ChecklistCreateRequest {
  parceiro_id: number;
  etapas: { nome: string; status: 'pendente' }[];
}

export interface ChecklistUpdateRequest {
  status: 'pendente' | 'concluido';
}

@Injectable({
  providedIn: 'root'
})
export class ChecklistService {
  private readonly apiService = inject(ApiService);

  getChecklists(parceiroId?: number): Observable<Checklist[]> {
    const params: Record<string, string> = {};
    if (parceiroId) {
      params['parceiro_id'] = parceiroId.toString();
    }

    return this.apiService.get<Checklist[]>('/checklists', params);
  }

  createChecklist(dados: ChecklistCreateRequest): Observable<Checklist> {
    return this.apiService.post<Checklist>('/checklists', dados);
  }

  updateChecklistEtapa(id: number, dados: ChecklistUpdateRequest): Observable<Checklist> {
    return this.apiService.put<Checklist>(`/checklists/${id}`, dados);
  }

  deleteChecklist(id: number): Observable<void> {
    return this.apiService.delete<void>(`/checklists/${id}`);
  }

}
