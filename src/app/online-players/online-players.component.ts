import {Component, Input, OnInit, ViewContainerRef} from '@angular/core';
import {User} from "../models/user.model";
import {DataService} from "../services/data.service";
import {RoomService} from "../services/room.service";
import {ToastsManager} from "ng2-toastr";

@Component({
  selector: 'app-online-players',
  templateUrl: './online-players.component.html',
  styleUrls: ['./online-players.component.css']
})
export class OnlinePlayersComponent implements OnInit {
  // Since lobby and room will be using this component.. And players cannot challenge each other in lobby
  @Input('challengeDisabled') challengeDisabled: boolean;
  currentUser: User;
  onlinePlayers: {id: number, Screen_Name: string}[] = [];

  constructor(
    private dataService: DataService,
    private roomService: RoomService,
    private toaster: ToastsManager,
    vcr: ViewContainerRef) {
      this.toaster.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    // Fetch logged in user details
    this.currentUser = this.dataService.getCurrentUser();

    // Now fetch online players using the get
    this.roomService.getRoomDetails(this.currentUser.Room_id, this.currentUser.id).subscribe(
      (data => {
        // Fill available players
        const available_players = data['available_players'];
        for (const singlePlayer of available_players) {
          this.onlinePlayers.push(singlePlayer);
        }
      }),
      (error => {
        // Error in response
        this.toaster.error(error, 'Unable to fetch room details.');
      })
    );
  }

}
