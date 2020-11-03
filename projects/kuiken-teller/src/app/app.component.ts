import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public openDetails = false;

  constructor() {
    setTimeout(() => {
      this.openDetails = true;
    }, 1500);
  }
}
