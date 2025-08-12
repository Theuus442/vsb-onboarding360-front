import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DocumentosRoutingModule } from './documentos-routing.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    DocumentosRoutingModule
  ]
})
export class DocumentosModule { }
