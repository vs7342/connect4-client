import {Component, Input, OnInit, ViewContainerRef} from '@angular/core';
import {User} from "../models/user.model";
import {DataService} from "../services/data.service";
import {RoomService} from "../services/room.service";
import {ToastsManager} from "ng2-toastr";
import {ConstantsService} from "../services/constants.service";
import {GameService} from "../services/game.service";
import {Router} from "@angular/router";

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
  // Challenge modal stuff
  isOutgoingChlgDisplayed = false;
  challengee: {id: number, Screen_Name: string};
  outgoingSecondsRemaining: number;
  outgoingChallengeId: number;
  outgoingCounter: any;

  // Incoming modal stuff
  isIncomingChlgDisplayed = false;
  challenger: {id: number, Screen_Name: string};
  incomingSecondsRemaining: number;
  incomingChallengeId: number;
  incomingCounter: any;

  constructor(
    private dataService: DataService,
    private roomService: RoomService,
    private gameService: GameService,
    private router: Router,
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

    // Keep looking for incoming challenges only in room (not in lobby)
    if (this.currentUser.Room_id !== 1) {
      this.checkIncomingChallengesHeartbeat();
    }
  }

  openOutgoingModal(user_id: number, user_screen_name: string) {
    // Start an outgoing challenge
    if (!this.challengeDisabled) {
      // Send a request to the server first before showing the modal
      this.gameService.postChallenge(this.currentUser.id, user_id).subscribe(
        (data => {
          if (data.success) {
            // Show the modal if the request was successful with appropriate details
            // Initialize appropriate details and then trigger the modal
            this.challengee = {
              id: user_id,
              Screen_Name: user_screen_name
            };
            this.outgoingSecondsRemaining = 30;
            this.outgoingChallengeId = data.data.id;
            this.isOutgoingChlgDisplayed = true;

            // Start outgoing counter
            this.startOutgoingCountdown();

            // Start the heartbeat to check the challenge status
            this.checkOutgoingChallengeHeartbeat(this.outgoingChallengeId);
          } else {
            this.toaster.error(data.message, 'Unable to challenge the player');
          }
        }),
        (error => {
          this.toaster.error(error, 'Unable to challenge the player');
        })
      );
    } else {
      this.toaster.warning('Cannot challenge a player in a lobby. Kindly enter a room to challenge someone.');
      return;
    }
  }

  /*Heartbeats to check for any incoming challenges or the challenge which has been created(sent)*/
  checkIncomingChallengesHeartbeat() {
    // No need to check this in lobby or while in game
    if (this.currentUser.Room_id === 1 || this.dataService.getGameId()) {
      return;
    }
    // Check for incoming challenges and display the modal if any
    this.gameService.checkIncomingChallenge(this.currentUser.id).subscribe(
      (data: any[]) => {
        // No need to check this in lobby or while in game
        if (this.currentUser.Room_id === 1 || this.dataService.getGameId()) {
          return;
        }
        if (data.length > 0) {
          // Display the incoming challenge modal after setting appropriate details
          this.challenger = {
            id: data[0].User.id,
            Screen_Name: data[0].User.Screen_Name
          };
          this.incomingChallengeId = data[0].id;
          this.incomingSecondsRemaining = 30;
          this.isIncomingChlgDisplayed = true;

          // Start incoming counter
          this.startIncomingCountdown();

          // Keep checking this challenge for cancellation / expiration
          this.checkIncomingChallengeStatusHeartBeat(this.incomingChallengeId);
        } else {
          // No challenges found yet.. Check for a challenge after 2 seconds
          setTimeout(() => { this.checkIncomingChallengesHeartbeat(); }, 2000);
        }
      },
      (error) => {
        // this.toaster.error(error, 'Error checking incoming challenges');
        console.error('Vidit you should check this error out : ' + error);
        setTimeout(() => { this.checkIncomingChallengesHeartbeat(); }, 2000);
      }
    );
  }

  // Checks for all 4 conditions of a single challenge posted - Accepted/Declined/Canceled/Expired
  checkOutgoingChallengeHeartbeat(challenge_id: number) {
    // Fetch the challenge first
    this.gameService.checkOngoingChallenge(challenge_id).subscribe(
      (challenge => {
        if (challenge.id) {
          // Challenge exists.. now you can check various conditions
          // 1. Accept
          if (challenge['Accepted'] === true) {
            // Stop outgoing counter
            this.stopOutgoingCountdown();
            // Hide modal
            this.isOutgoingChlgDisplayed = false;
            // First save the challenge_id and opponent_user_id for messaging purpose
            this.dataService.setCurrentChallenge(this.outgoingChallengeId);
            this.dataService.setOpponentUserId(this.challengee.id);
            // Save challengeId in local variable to use it to initialize game
            const tempOutgoingChallengeId = this.outgoingChallengeId;
            // Unset outgoing challengeId
            this.outgoingChallengeId = 0;
            // Show the message
            this.toaster.success('Opponent has accepted the challenge.. Initiating CONNECT 4..');
            // Initialize the game after 2 seconds.. while the above message is shown..
            setTimeout(() => { this.initializeGame(tempOutgoingChallengeId) ; }, 4000);
            return;
          }
          // 2. Decline
          if (challenge['Accepted'] === false) {
            // Stop outgoing counter
            this.stopOutgoingCountdown();
            // Hide modal
            this.isOutgoingChlgDisplayed = false;
            this.toaster.info('Opponent has declined the challenge');
            // Unset outgoing challengeId
            this.outgoingChallengeId = 0;
            return;
          }
          // 3. Cancelled
          if (challenge['Cancelled'] === true) {
            // Stop outgoing counter
            this.stopOutgoingCountdown();
            // Hide modal
            this.isOutgoingChlgDisplayed = false;
            // Unset outgoing challengeId
            this.outgoingChallengeId = 0;
            // No need to do anything since message display has been handled earlier
            // this.toaster.info('Challenge cancelled');
            return;
          }
          // 4. Expired
          if (challenge['Expired'] === true) {
            // Stop outgoing counter
            this.stopOutgoingCountdown();
            // Hide Modal
            this.isOutgoingChlgDisplayed = false;
            // TODO: When the counter thing is handled client side, toaster info display is not needed
            this.toaster.info('Challenge Expired');
            // Unset outgoing challengeId
            this.outgoingChallengeId = 0;
            return;
          }

          // Since none of the conditions met.. keep checking
          setTimeout(() => { this.checkOutgoingChallengeHeartbeat(challenge_id); }, 2000);
        } else {
          // Idk.. maybe just keep checking
          setTimeout(() => { this.checkOutgoingChallengeHeartbeat(challenge_id); }, 2000);
        }
      }),
      (error => {
        // this.toaster.error(error, 'Error checking outgoing challenge');
        console.error('Vidit you should check this error out : ' + error);
        setTimeout(() => { this.checkOutgoingChallengeHeartbeat(challenge_id); }, 2000);
      })
    );
  }

  // Checks for 2 of 4 conditions of single incoming challenge  - Canceled/Expired
  checkIncomingChallengeStatusHeartBeat(challenge_id: number) {
    // No need to check this in lobby
    if (this.currentUser.Room_id === 1) {
      return;
    }
    // Fetch the challenge first
    this.gameService.checkOngoingChallenge(challenge_id).subscribe(
      (challenge => {
        // No need to check this in lobby
        if (this.currentUser.Room_id === 1) {
          return;
        }
        if (challenge.id) {
          // Challenge exists.. now you can check various conditions
          // 1. Accept/Decline
          // (This is actually not needed since accept/decline will happen client side and player will be navigated automatically anyways)
          if (challenge['Accepted'] === true || challenge['Accepted'] === false) {
            // Stop the heartbeat.. we don't need it anymore
            this.isIncomingChlgDisplayed = false;
            // Stop incoming counter
            this.stopIncomingCountdown();
            return;
          }
          // 3. Cancelled
          if (challenge['Cancelled'] === true && this.isIncomingChlgDisplayed) {
            // Stop incoming counter
            this.stopIncomingCountdown();
            // Hide the modal
            this.isIncomingChlgDisplayed = false;
            this.toaster.info('Challenge has been cancelled.');
            // Again start listening to any incoming challenges
            setTimeout( () => { this.checkIncomingChallengesHeartbeat(); }, 2000);
            return;
          }
          // 4. Expired
          if (challenge['Expired'] === true && this.isIncomingChlgDisplayed) {
            // Stop incoming counter
            this.stopIncomingCountdown();
            // Hide the modal
            this.isIncomingChlgDisplayed = false;
            // TODO: When the counter thing is handled client side, toaster info display is not needed
            this.toaster.info('Challenge has been expired');
            // Again start listening to any incoming challenges
            setTimeout( () => { this.checkIncomingChallengesHeartbeat(); }, 2000);
            return;
          }

          // Since none of the conditions met.. keep checking
          setTimeout(() => { this.checkIncomingChallengeStatusHeartBeat(challenge_id); }, 2000);
        } else {
          // Idk.. maybe just keep checking
          setTimeout(() => { this.checkIncomingChallengeStatusHeartBeat(challenge_id); }, 2000);
        }
      }),
      (error => {
        // this.toaster.error(error, 'Error checking outgoing challenge');
        console.error('Vidit you should check this error out : ' + error);
        setTimeout(() => { this.checkIncomingChallengeStatusHeartBeat(challenge_id); }, 2000);
      })
    );
  }

  /*Events emitted by the incoming and outgoing challenge modal*/

  // Event emitted by outgoing challenge modal
  cancelChallenge() {
    console.log('Outgoing chlng canceled');
    // Stop outgoing counter
    this.stopOutgoingCountdown();
    // Hide the modal
    // close the modal and display a message
    this.isOutgoingChlgDisplayed = false;
    this.toaster.info('Challenge canceled');
  }

  // Event emitted by incoming challenge modal
  // Takes care of the rest 2 conditions of single incoming challenge - Accepted/Declined
  onIncomingChallengeResponse(isAccepted: number) {
    if (isAccepted === 1) {
      console.log('Incoming chlng accepted');
      // Stop incoming counter
      this.stopIncomingCountdown();
      // Close the modal
      this.isIncomingChlgDisplayed = false;
      // First save the challenge_id and opponent_user_id for messaging purpose
      this.dataService.setCurrentChallenge(this.incomingChallengeId);
      this.dataService.setOpponentUserId(this.challenger.id);
      // Show the message
      this.toaster.success('You have accepted the challenge.. Initiating CONNECT 4..');
      // Initialize the game after 2 seconds.. while the above message is shown..
      setTimeout(() => { this.initializeGame(this.incomingChallengeId) ; }, 2000);
    } else {
      console.log('Incoming chlng declined');
      // Stop incoming counter
      this.stopIncomingCountdown();
      // Display a message saying that your challenge has been declined..
      this.isIncomingChlgDisplayed = false;
      // Close the modal
      this.toaster.info('Challenge declined');
      // Since the challenge was declined.. user is idle and can be challenged
      this.checkIncomingChallengesHeartbeat();
    }
  }

  initializeGame(challengeId: number) {
    // Call initGame method of game service
    this.gameService.initGame(challengeId).subscribe(
      (data => {
        // Save game id in the local storage
        this.dataService.setGameId(data.Game_id);
        // Save Players(opponent and self) in local storage
        if (data['Players'][0].User_id === this.currentUser.id) {
          this.dataService.setPlayer('self', data['Players'][0]);
          this.dataService.setPlayer('opponent', data['Players'][1]);
        } else {
          this.dataService.setPlayer('self', data['Players'][1]);
          this.dataService.setPlayer('opponent', data['Players'][0]);
        }
        // Route to game component
        this.router.navigate(['/game']);
      }),
      (error => {
        this.toaster.error(error, 'Error occurred while initiating the game..');
      })
    );
  }

  startOutgoingCountdown() {
    this.outgoingSecondsRemaining = 30;
    this.outgoingCounter = setInterval(() => {
      this.outgoingSecondsRemaining = this.outgoingSecondsRemaining - 1;
    }, 1000);
  }

  startIncomingCountdown() {
    this.incomingSecondsRemaining = 30;
    this.incomingCounter = setInterval(() => {
      this.incomingSecondsRemaining = this.incomingSecondsRemaining - 1;
    }, 1000);
  }

  stopOutgoingCountdown() {
    clearInterval(this.outgoingCounter);
  }

  stopIncomingCountdown() {
    clearInterval(this.incomingCounter);
  }
}
