import {Component, OnInit, ViewContainerRef} from '@angular/core';
import { DataService } from '../services/data.service';
import {User} from '../models/user.model';
import {Room} from '../models/room.model';
import {RoomService} from '../services/room.service';
import {ToastsManager} from 'ng2-toastr';
import {UserService} from '../services/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-room-details',
  templateUrl: './room-details.component.html',
  styleUrls: ['./room-details.component.css']
})
export class RoomDetailsComponent implements OnInit {
  lobbyDetails: Room[] = [];
  ongoingMatches: string[] = [];
  currentUser: User;
  isLobby: boolean;

  constructor(
    private dataService: DataService,
    private roomService: RoomService,
    private userService: UserService,
    private router: Router,
    private toaster: ToastsManager,
    vcr: ViewContainerRef) {
      this.toaster.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    // Get current user room id and accordingly fill the room details
    this.currentUser = this.dataService.getCurrentUser();
    const room_id = this.currentUser.Room_id;
    if (room_id === 1) {
      // This means user is in lobby and accessing this component
      this.isLobby = true;
      // Load all room details
      this.roomService.getRooms().subscribe(
        (data => {
          for (let i = 0; i < data.length; i++) {
            if (data[i].Lookup_RoomType.Name !== 'Lobby') {
              this.lobbyDetails.push(data[i].Lookup_RoomType);
            }
          }
          console.log(this.lobbyDetails);
        }),
        (error => {
          // Error in response
          this.toaster.error(error, 'Unable to fetch lobby details.');
        })
      );
    }else {
      // This means user is in some room other than lobby and accessing this component
      this.isLobby = false;
      // Load room specific details
      this.roomService.getRoomDetails(room_id, this.currentUser.id).subscribe(
        (data => {
          // Fill ongoing match details (Just p1 vs p2 stuff)
          const ongoing_games = data['ongoing_games'];
          for (let i = 0; i < ongoing_games.length; i++) {
            const ongoing_game = ongoing_games[i];
            this.ongoingMatches.push(ongoing_game.Players[0].User.Screen_Name + ' vs ' + ongoing_game.Players[1].User.Screen_Name);
          }
          console.log(this.ongoingMatches);
        }),
        (error => {
          // Error in response
          this.toaster.error(error, 'Unable to fetch room details.');
        })
      );
    }
  }

  navigateToRoom(roomId: number) {
    // TODO: Need to add a check whether the user is eligible to enter the room based on room.minimum_xp and user's xp
    // Call the room change API - If it is a success then navigate to that room and also update user object in data service
    this.userService.enterRoom(roomId, this.currentUser.id).subscribe(
      (data => {
        if (data.success) {
          // Update the roomId in the local storage
          this.dataService.setCurrentUserRoom(roomId);
          // Navigate to that room
          this.router.navigate(['/room']);
        } else {
          this.toaster.error(data.message, 'Error while entering the room');
        }
      }),
      (error => {
        this.toaster.error(error, 'Unable to enter room.');
      })
    );
  }

}
