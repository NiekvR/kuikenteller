import {Component, ElementRef, HostBinding, Input, OnInit} from '@angular/core';
import {Status, Ticket, Type} from './ticket.model';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Component({
  selector: 'tern-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements OnInit {
  @HostBinding('class.new') get new() { return this.checkStatus(Status.NEW); }
  @HostBinding('class.in-progress') get inProgress() { return this.checkStatus(Status.IN_PROGRESS); }
  @HostBinding('class.waiting') get wating() { return this.checkStatus(Status.WAITING); }
  @HostBinding('class.done') get done() { return this.checkStatus(Status.DONE); }

  @Input() ticket: Ticket;

  public open = false;
  public openEditor = false;
  public Status = Status;
  public Type = Type;

  constructor(private el: ElementRef, private http: HttpClient) { }

  ngOnInit() {
  }

  public toggle() {
    this.open = !this.open;
  }

  public getStatusLabel(status: Status): string {
    switch (status) {
      case Status.NEW: return 'nieuw';
      case Status.IN_PROGRESS: return 'we werken eraan';
      case Status.WAITING: return 'wachten op uw reactie';
      case Status.DONE: return 'opgelost';
    }
  }

  public closeTicket() {
    this.ticket.status = Status.DONE;
    this.patchTicket().subscribe();
  }

  public addReaction() {
    this.openEditor = true;
    requestAnimationFrame(() => {
      this.el.nativeElement.querySelector('textarea').focus();
    });
  }

  public sendReaction() {

    if(!!this.el.nativeElement.querySelector('textarea').value) {
      if (!this.ticket.communication) {
        this.ticket.communication = [];
      }
      this.ticket.communication.push({
        date: new Date(),
        content: this.el.nativeElement.querySelector('textarea').value,
        type: Type.USER
      });
      this.ticket.status = Status.IN_PROGRESS;
      this.patchTicket().subscribe(() => this.openEditor = false);
    }
  }

  private checkStatus(status: Status) {
    return this.ticket.status === status;
  }

  private patchTicket(): Observable<string> {
    return this.http.patch(`https://tern-support.firebaseapp.com/api/v1/ticket/${this.ticket.id}`,
      this.ticket, {responseType: 'text'});
  }
}
