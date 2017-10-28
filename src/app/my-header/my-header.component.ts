import {Component, Input, OnInit} from '@angular/core';
import {UserService} from '../services/user.service';
import {Router} from '@angular/router';
import {DataService} from '../services/data.service';
import {User} from '../models/user.model';

@Component({
  selector: 'app-my-header',
  templateUrl: './my-header.component.html',
  styleUrls: ['./my-header.component.css']
})
export class MyHeaderComponent implements OnInit {

  isLoggedIn: boolean;
  user: User;
  @Input() onSignupPage: boolean;

  constructor(private dataService: DataService, private router: Router, private userService: UserService) {}

  ngOnInit() {
    if (!this.onSignupPage) {
      this.checkIfLoggedIn();
    }
  }

  checkIfLoggedIn() {
    this.user = this.dataService.getCurrentUser();
    if (this.user) {
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
      this.router.navigate(['']);
    }
  }

  logout() {
    // Call the logout method in user service
    this.isLoggedIn = false;
    this.userService.logout(this.user.id).subscribe(
      data => {
        this.dataService.setToken('');
        this.router.navigate(['']);
      },
      error => {
        this.dataService.setToken('');
        this.router.navigate(['']);
      }
    );
  }

}
