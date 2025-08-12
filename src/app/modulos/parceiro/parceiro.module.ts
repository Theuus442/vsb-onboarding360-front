import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ParceiroRoutingModule } from './parceiro-routing.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ParceiroRoutingModule
  ]
})
export class ParceiroModule { }
