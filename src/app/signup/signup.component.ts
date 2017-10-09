import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {UserService} from '../services/user.service';
import {ToastsManager} from 'ng2-toastr';
import {Router} from '@angular/router';
import {DataService} from "../services/data.service";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  // Access the sign up form
  @ViewChild('signupForm') signupForm: HTMLFormElement;

  constructor(
    private userService: UserService,
    private route: Router,
    private toaster: ToastsManager,
    vcr: ViewContainerRef,
    private dataService: DataService
  ) {
      this.toaster.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
  }

  /**
   * Sends a sign-up request to the API
   * Will navigate to lobby page if sign up was successful.. Else displays an error message.
   */
  onSignupClick() {
    // If form is invalid, do not proceed
    if (this.signupForm.valid) {
      const formValue = this.signupForm.value;
      // Call the sign up method of user service
      this.userService.signup(
        formValue.email,
        formValue.fname,
        formValue.lname,
        formValue.screenName,
        formValue.password
      ).subscribe(
        // Response completed successfully
        (data => {
          if (data.success) {
            // Save User data
            this.dataService.setToken(data.token);
            // Set user room id in the local storage to '1' (lobby)
            this.dataService.setCurrentUserRoom(1);
            // Navigate to Lobby
            this.route.navigate(['/lobby']);
          } else {
            // Display error message from server
            this.toaster.error(data.message, 'Sign up error');
          }
        }),
        // Response error
        (error => {
          this.toaster.error(error, 'Unable to sign up.');
        })
      );
    }
  }

  /**
   * Resets the sign up form
   */
  onResetClick() {
    this.signupForm.reset();
  }

}
