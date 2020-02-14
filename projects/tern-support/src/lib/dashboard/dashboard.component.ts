import {Component, Input, OnInit} from '@angular/core';
import {Ticket, Communication, Status} from './ticket/ticket.model';
import { HttpClient } from '@angular/common/http';
import {tick} from '@angular/core/testing';

@Component({
  selector: 'tern-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  @Input() userId: string;
  @Input() project: string;
  @Input() animated: boolean;

  public tickets: Ticket[];
  public showLegend = false;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    if(!!this.userId) {
      this.getTickets();
    }
  }

  public addTicket(ticket: Ticket) {
    this.tickets.unshift(ticket);
    localStorage.setItem('tickets', JSON.stringify(this.tickets));
  }

  private getTickets() {
    const data = localStorage.getItem('tickets');
    let localtickets: Ticket[];
    if(!!data) {
      localtickets = JSON.parse(data);
      localtickets.forEach(ticket => this.jsonToTicket(ticket, ticket.id))
    } else {
      localStorage.setItem('tickets', JSON.stringify([]));
    }

    if(!localtickets || this.hasOpenTickets(localtickets)) {
      this.http.get<Ticket>(`https://tern-support.firebaseapp.com/api/v1/ticket/project/${this.project}/user/${this.userId}`)
        .subscribe(data => {
          const tickets = [];
          Object.keys(data)
            .forEach(key => {
              tickets.push(this.jsonToTicket(data[key], key));
            });
          this.tickets = tickets.sort((a, b) => this.getMostRecentDateFromTicket(b).getTime() - this.getMostRecentDateFromTicket(a).getTime());
          localStorage.setItem('tickets', JSON.stringify(this.tickets));
        });
    } else {
      this.tickets = localtickets.sort((a, b) => this.getMostRecentDateFromTicket(b).getTime() - this.getMostRecentDateFromTicket(a).getTime());
    }
  }

  private getMostRecentDateFromTicket(ticket: Ticket) {
    return !!ticket.communication && ticket.communication.length > 0 ? this.getMostRecentReactionDate([...ticket.communication]) : ticket.date;
  }

  private getMostRecentReactionDate(communication: Communication[]): Date {
    return communication.sort((a, b) => b.date.getTime() - a.date.getTime())[0].date
  }

  private setDate(date: any): Date {
    return !!(<any>date)._seconds ? new Date((<any>date)._seconds * 1000): new Date((<string>date));
  }

  private hasOpenTickets(tickets: Ticket[]) {
    return tickets.filter(ticket => ticket.status != Status.DONE).length > 0;
  }

  private jsonToTicket(jsonTicket: any, id: string): Ticket {
    jsonTicket.date = this.setDate(jsonTicket.date);
    if (!!jsonTicket.communication) {
      jsonTicket.communication.forEach((comm => comm.date = this.setDate(comm.date)));
    }
    jsonTicket.id = id;
    return jsonTicket as Ticket;
  }

}
