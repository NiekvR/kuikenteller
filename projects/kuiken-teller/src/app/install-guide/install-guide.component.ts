import { Component, OnInit } from '@angular/core';
import {DeviceDetectorService, DeviceInfo} from 'ngx-device-detector';
import {Router} from '@angular/router';
import {Browser} from './browser.enum';
import {OS} from './os.enum';

@Component({
  selector: 'app-install-guide',
  templateUrl: './install-guide.component.html',
  styleUrls: ['./install-guide.component.scss']
})
export class InstallGuideComponent implements OnInit {

  public Browser = Browser;
  public OS = OS;

  public deviceInfo: DeviceInfo;
  public os: string;
  public browser: string;

  constructor(private deviceService: DeviceDetectorService, private router: Router) { }

  ngOnInit(): void {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    this.browser = this.deviceInfo.browser.toLowerCase();
    this.os = this.deviceInfo.os.toLowerCase();
  }

  public back() {
    this.router.navigate(['']);
  }

  public noAndroidBrowser(): boolean {
    return this.Browser.SAMSUNG !== this.browser &&
      this.Browser.CHROME !== this.browser &&
      this.Browser.FIREFOX !== this.browser
  }
}
