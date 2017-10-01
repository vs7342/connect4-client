import {Component, Input, OnInit, ViewContainerRef} from '@angular/core';
import {User} from "../models/user.model";
import {DataService} from "../services/data.service";
import {RoomService} from "../services/room.service";
import {ToastsManager} from "ng2-toastr";
import {ConstantsService} from "../services/constants.service";

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
  socket: any;

  constructor(
    private dataService: DataService,
    private roomService: RoomService,
    private constantService: ConstantsService,
    private toaster: ToastsManager,
    vcr: ViewContainerRef) {
      this.toaster.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    // Fetch logged in user details
    this.currentUser = this.dataService.getCurrentUser();
    // Socket related stuff
    this.socket = this.constantService.getSocket();
    // Join the socket io room
    this.socket.emit('join-room', {
      room_id: this.currentUser.Room_id,
      user_id: this.currentUser.id,
      user_screen_name: this.currentUser.Screen_Name
    });

    // Now fetch online players using the get
    this.roomService.getSocketRoomDetails(this.currentUser.Room_id).subscribe(
      (data => {
        // Fill available players
        if (data.success) {
          const available_players = data['users'];
          for (const singlePlayer of available_players) {
            // Display players other than the user itself
            if (singlePlayer.id !== this.currentUser.id) {
              this.onlinePlayers.push(singlePlayer);
            }
          }
        }else {
          this.toaster.error(data.message, 'Unable to fetch online users.');
        }
      }),
      (error => {
        // Error in response
        this.toaster.error(error, 'Unable to fetch online users.');
      })
    );
    /**
     * Socket handler for any user leaving the current room
     */
    this.socket.on('client-left-room', data => {
      // Remove this user from the onlinePlayers list
      const user_id_to_be_removed = data.user_id;
      const user_screen_name_to_be_removed = data.user_screen_name;
      this.onlinePlayers = this.onlinePlayers.filter(element => {
        return element.id !== user_id_to_be_removed && element.Screen_Name !== user_screen_name_to_be_removed;
      });
    });
    /**
     * Socket handler for any user joining the current room
     */
    this.socket.on('client-join-room', data => {
      // Add this user in the onlinePlayers list
      // Also check if its the same user :P
      if (this.currentUser.id !== data.user_id) {
        this.onlinePlayers.push({
          id: data.user_id,
          Screen_Name: data.user_screen_name
        });
      }
    });
  }
}
