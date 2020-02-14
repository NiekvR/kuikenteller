import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TicketComponent } from './dashboard/ticket/ticket.component';
import {CommonModule} from '@angular/common';
import { AddTicketComponent } from './dashboard/add-ticket/add-ticket.component';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [DashboardComponent, TicketComponent, AddTicketComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [DashboardComponent]
})
export class TernSupportModule { }
