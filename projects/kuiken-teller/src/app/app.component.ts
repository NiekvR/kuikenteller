import {Component, OnInit} from '@angular/core';
import {StorageService} from './core/services/storage/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public openDetails = false;

  constructor(private storageService: StorageService) {
    setTimeout(() => {
      this.openDetails = true;
    }, 1500);
  }

  ngOnInit() {
    this.storageService.clearSightingsFromEarlierYears();
  }
}
