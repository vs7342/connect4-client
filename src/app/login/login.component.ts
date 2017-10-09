import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Router} from '@angular/router';
import {ToastsManager} from 'ng2-toastr';
import {UserService} from '../services/user.service';
import {DataService} from "../services/data.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // Access the form element
  @ViewChild('loginForm') loginForm: HTMLFormElement;

  constructor(
    private route: Router,
    private toaster: ToastsManager,
    vcr: ViewContainerRef,
    private userService: UserService,
    private dataService: DataService) {
      this.toaster.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
  }

  // This will check for login credentials with the API
  // Will navigate to lobby page if login is successful.. Else displays an error message.
  onLoginClick() {
    // Proceed only if form is valid
    if (this.loginForm.valid) {
      // Check for credentials here
      this.userService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe(
        (data => {
          if (data.success) {
            // Save user data
            this.dataService.setToken(data.token);
            // Set user room id in the local storage to '1' (lobby)
            this.dataService.setCurrentUserRoom(1);
            // Navigate to Lobby
            this.route.navigate(['/lobby']);
          }else {
            // Display authentication error
            this.toaster.error('Invalid email / password', 'Authentication error');
          }
        }),
        (error => {
          // Error in response
          this.toaster.error(error, 'Unable to login.');
        })
      );
    }
  }

}
