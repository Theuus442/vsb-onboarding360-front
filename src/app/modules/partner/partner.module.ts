import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/router';
import { RouterModule } from '@angular/router';

import { PartnerRoutingModule } from './partner-routing.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    PartnerRoutingModule
  ]
})
export class PartnerModule { }
