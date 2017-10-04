import {Component, EventEmitter, Input, OnInit, Output, ViewContainerRef} from '@angular/core';
import {GameService} from '../../services/game.service';
import {ToastsManager} from 'ng2-toastr';

@Component({
  selector: 'app-incoming-challenge',
  templateUrl: './incoming-challenge.component.html',
  styleUrls: ['../modals.css', './incoming-challenge.component.css']
})
export class IncomingChallengeComponent implements OnInit {
  @Input('challenger') challenger: {id: number, Screen_Name: string};
  @Input('challengeId') challengeId: number;
  @Input('seconds_remaining') seconds_remaining: number;
  @Output('close') close = new EventEmitter<number>();
  constructor(private gameService: GameService, private toaster: ToastsManager, vcr: ViewContainerRef) {
    this.toaster.setRootViewContainerRef(vcr);
  }

  ngOnInit() {}

  acceptChlg() {
    // Send a request to the server that the challenge has been accepted
    this.gameService.acceptChallenge(this.challengeId).subscribe(
      (data => {
        if (data.success) {
          // Emit close event with 1 so that the modal can be closed and a relevant message can be displayed
          // Also navigating to root will be handled in the parent component
          this.close.emit(1);
        } else {
          // Just display the message
          this.toaster.error(data.message, 'Error accepting challenge');
        }
      }),
      (error => {
        // Just display the message
        this.toaster.error(error, 'Error accepting challenge');
      })
    );
  }
  declineChlg() {
    // Send a request to the server that the challenge has been declined
    this.gameService.declineChallenge(this.challengeId).subscribe(
      (data => {
        if (data.success) {
          // Emit close event with 0 so that the modal can be closed and a relevant message can be displayed
          this.close.emit(0);
        } else {
          // Just display the message
          this.toaster.error(data.message, 'Error declining challenge');
        }
      }),
      (error => {
        // Just display the message
        this.toaster.error(error, 'Error declining challenge');
      })
    );
  }

}
