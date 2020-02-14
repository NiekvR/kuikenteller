import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Status, Ticket} from '../ticket/ticket.model';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';

@Component({
  selector: 'tern-add-ticket',
  templateUrl: './add-ticket.component.html',
  styleUrls: ['./add-ticket.component.scss'],
  animations: [
    trigger('openClose', [
      state('open', style({
        height: '*'
      })),
      state('closed', style({
        height: '0'
      })),
      transition('open => closed', [
        animate('0.3s')
      ]),
      transition('closed => open', [
        animate('0.5s')
      ]),
    ]),
    trigger('step', [
      state('1', style({
        transform: '*'
      })),
      state('2', style({
        transform: 'translate(-25%, 0)'
      })),
      state('3', style({
        transform: 'translate(-50%, 0)'
      })),
      state('4', style({
        transform: 'translate(-75%, 0)'
      })),
      transition('1 <=> 2', [
        animate('0.5s')
      ]),
      transition('2 <=> 3', [
        animate('0.5s')
      ]),
      transition('3 <=> 4', [
        animate('0.5s')
      ])
    ]),
  ],
})
export class AddTicketComponent implements OnInit {
  @ViewChild('title', { static: false }) title;
  @ViewChild('content', { static: false }) content;
  @ViewChild('device', { static: false }) device;

  @Input() project: string;
  @Input() user: string;
  @Input() animated: boolean;

  @Output() refresh = new EventEmitter<Ticket>();

  public ticketForm: FormGroup;

  public open = false;
  public toggleMainButton = false;
  public step = 1;
  public steps = 4;

  constructor(private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit() {
    this.createForm();
    if(!this.animated) {
      this.toggle();
    }
  }

  public toggle() {
    this.step = 1;
    this.createForm();
    if(this.animated) {
      this.open = !this.open;
      setTimeout(() => {
        this.toggleMainButton = !this.toggleMainButton
      }, this.open ? 500 : 300)
    } else {
      this.open = true;
    }
  }

  public navigate(step: number) {
    if(step < 0 || this.canMoveToNextStep()) {
      this.step += step;
      setTimeout(() => {
        this.selectTextField();
      }, 500);
    }
  }

  public getProgress() {
    return (this.step / this.steps * 100).toString() + '%';
  }

  public canMoveToNextStep(): boolean {
    let canMove = false;
    switch(this.step) {
      case 1: canMove = true;
        break;
      case 2: canMove = this.ticketForm.controls['title'].valid;
        break;
      case 3: canMove = this.ticketForm.controls['question'].valid;
        break;
    }

    return canMove;
  }

  public sendTicket() {
    const ticket: Ticket = this.createTicket();
    (<any>ticket).page = 'test';
    this.http.post('https://tern-support.firebaseapp.com/api/v1/ticket', ticket, {responseType: 'text'})
      .pipe(catchError(error => {
        return throwError(error);
      }))
      .subscribe(() => {
        this.refresh.emit(ticket);
        if(this.animated) {
          setTimeout(() => {
            this.toggle();
          }, 3000)
        } else {
          this.toggle();
        }
      })
  }

  private createTicket(): Ticket {
    let ticket: Ticket = this.ticketForm.value;
    ticket.date = new Date();
    ticket.project = this.project;
    ticket.status = Status.NEW;
    ticket.user = this.user;

    return ticket;
  }

  private createForm() {
    this.ticketForm = this.fb.group({
      title: [null, [Validators.required]],
      question: [null, [Validators.required]],
      device: [null, [Validators.required]],
      browser: [null, [Validators.required]],
    });
  }

  private selectTextField() {
    switch(this.step) {
      case 2: this.title.nativeElement.focus(); break;
      case 3: this.content.nativeElement.focus(); break;
      case 4: this.device.nativeElement.focus(); break;
      default: break;
    }
  }
}
