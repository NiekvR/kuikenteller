import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public animate = false;
  public openDetails = false;
  public promptEvent;

  constructor() {
    setTimeout(() => {
      this.animate = true;
    }, 1000);
    setTimeout(() => {
      this.openDetails = true;
    }, 2200);

    window.addEventListener('beforeinstallprompt', event => {
      this.promptEvent = event;
    });
  }

  public installPwa(): void {
    this.promptEvent.prompt();
  }
}
