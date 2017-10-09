import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {User} from "../models/user.model";
import {Router} from "@angular/router";
import {UserService} from "../services/user.service";
import {DataService} from "../services/data.service";
import {ToastsManager} from "ng2-toastr";

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {
  currentUser: User;
  constructor(
    private router: Router,
    private userService: UserService,
    private dataService: DataService,
    private toaster: ToastsManager,
    vcr: ViewContainerRef
  ) {
    this.toaster.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    this.currentUser = this.dataService.getCurrentUser();
  }

  /**
   * Changes room of the user in the API.. If request is successful, then updates local user object
   * Finally navigates to lobby
   */
  onBackToLobbyClick() {
    this.userService.enterRoom(1, this.currentUser.id).subscribe(
      (data => {
        if (data.success) {
          // Update the roomId in the local storage
          this.dataService.setCurrentUserRoom(1);
          // Navigate back to lobby
          this.router.navigate(['/lobby']);
        } else {
          this.toaster.error(data.message, 'Error while going back to lobby');
        }
      }),
      (error => {
        this.toaster.error(error, 'Unable to enter lobby.');
      })
    );
  }

}
