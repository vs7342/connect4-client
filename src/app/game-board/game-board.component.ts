import {Component, OnDestroy, OnInit, ViewContainerRef} from '@angular/core';
import {Piece} from '../models/piece.model';
import {DataService} from "../services/data.service";
import {GameService} from "../services/game.service";
import {ToastsManager} from "ng2-toastr";
import * as io from 'socket.io-client';
import {ConstantsService} from "../services/constants.service";
import {UserService} from "../services/user.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css']
})
export class GameBoardComponent implements OnInit, OnDestroy {
  // Attributes
  pieces: Piece[];
  gameId: number;
  socket: any;
  myColor: string;
  myOpponent: string;
  isMyTurn: boolean;
  secondsRemaining: number;
  countdown: any;
  constructor(
    private dataService: DataService,
    constantsService: ConstantsService,
    private gameService: GameService,
    private userService: UserService,
    private router: Router,
    private toaster: ToastsManager,
    vcr: ViewContainerRef) {
    this.toaster.setRootViewContainerRef(vcr);

    // Initialize socket
    this.socket = io(constantsService.getGameSocketLink());
  }

  ngOnInit() {

    // First fetch the game id from local storage
    this.gameId = +this.dataService.getGameId();
    // Now fetch pieces for this game
    this.gameService.getPieces(this.gameId).subscribe(
      (data => {
        if (data.success) {
          // Initialize pieces array
          this.pieces = data.pieces;
          // Now fetch the game state and initialize the game info
          this.gameService.getMyGameState(this.gameId, this.dataService.getCurrentUser().id).subscribe(
            (resp => {
              this.myColor = resp.myColor;
              this.myOpponent = resp.myOpponent;
              this.isMyTurn = resp.isMyTurn;

              if (this.isMyTurn) {
                this.startCountdown();
              }
            }),
            (err => {
              this.toaster.error(err, 'Error retrieving game state.');
            })
          );
        }else {
          this.toaster.error('Error retrieving pieces. Please Contact Admin.');
        }
      }),
      (error => {
        this.toaster.error(error, 'Error retrieving pieces.');
      })
    );
    // Join the game_id room socket
    this.socket.emit('join-game', {
      game_id: this.gameId,
      user_id: this.dataService.getCurrentUser().id
    });
    /**
     * Socket handler to collect opponent posted piece info
     */
    this.socket.on('rcv-piece-client', data => {
      this.pieces.push(data['piece']);
      // Display that it is your turn
      this.isMyTurn = true;
      const api_response = data.api_response;
      // Now check the data and see if the game is finished
      if (api_response['Is_Game_Finished'] && api_response['Winner_User_Id'] !== this.dataService.getCurrentUser().id) {
        this.toaster.error('You Lost!');
        // Now go back to lobby
        this.goBackToLobbyAfterTimeout();
      } else {
        this.startCountdown();
      }
    });
    /**
     * Socket handler to collect opponent posted piece info
     */
    this.socket.on('game-finished', data => {
      if (data['lost_player_user_id'] === this.dataService.getCurrentUser().id) {
        this.toaster.error('You have lost due to inactivity!');
      } else {
        this.toaster.success('It seems like your opponent has left the game. You have won!!');
      }
      // Clear the timer
      clearInterval(this.countdown);
      // Now go back to lobby
      this.goBackToLobbyAfterTimeout();
    });
  }

  playTurn(position_x: number) {
    // Fetch all params needed for posting a piece=
    const user_id = this.dataService.getCurrentUser().id;
    const player = this.dataService.getPlayer('self');
    this.gameService.postPiece(
      position_x,
      player.id,
      this.gameId,
      +this.dataService.getCurrentUserRoom(),
      user_id
    ).subscribe(
      (data => {
        // Now add the piece to the pieces array
        const posted_piece = new Piece(-1, position_x, data['Position_Y'], user_id,
          {
            Color: player.Color,
            id: player.id
          }
        );
        this.pieces.push(posted_piece);

        // Now post the piece to socket (also send the post response)
        this.socket.emit('post-piece-server', {
          game_id: this.gameId,
          piece: posted_piece,
          api_response: data
        });

        // Display that your turn is over now
        this.isMyTurn = false;

        // Now check the data and see if the game is finished
        if (data['Is_Game_Finished'] && data['Winner_User_Id'] === this.dataService.getCurrentUser().id) {
          this.toaster.success('You Won! Congratulations!');
          // Now go back to lobby
          this.goBackToLobbyAfterTimeout();
        }

        // Stop the timer
        clearInterval(this.countdown);
      }),
      (error => {
        this.toaster.error(error, 'Error playing turn.');
      })
    );
  }

  goBackToLobbyAfterTimeout() {
    // Display a message that you will be redirected
    this.toaster.info('You will now be redirected to lobby since the game is finished.');
    // Start a timer of 5 seconds and redirect
    setTimeout(() => {
      this.userService.enterRoom(1, this.dataService.getCurrentUser().id).subscribe(
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
    }, 5000);
    // clearing the game id from local storage since it can mess up with room component later on
    this.dataService.setGameId(-1);
  }

  startCountdown() {
    this.secondsRemaining = 60;
    this.countdown = setInterval(() => {
      this.secondsRemaining = this.secondsRemaining - 1;
    }, 1000);
  }

  ngOnDestroy() {
    // clearing the game id from local storage since it can mess up with room component later on
    this.dataService.setGameId(-1);
  }
}
