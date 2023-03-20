import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {from} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Auth, signInWithEmailAndPassword} from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public loginForm: FormGroup;
  public loged = false;
  public permission: boolean;

  constructor(private formBuilder: FormBuilder, private afAuth: Auth, private router: Router) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    })
  }

  submit() {
    if(this.loginForm.valid) {
      from(signInWithEmailAndPassword(this.afAuth, this.loginForm.controls.email.value, this.loginForm.controls.password.value))
        .pipe(tap(() => this.loged = true))
        .subscribe(() => this.router.navigate(['admin']));
    }
  }
}
