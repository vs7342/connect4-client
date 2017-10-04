import {Component, EventEmitter, Input, OnInit, Output, ViewContainerRef} from '@angular/core';
import {GameService} from '../../services/game.service';
import {ToastsManager} from 'ng2-toastr';

@Component({
  selector: 'app-outgoing-challenge',
  templateUrl: './outgoing-challenge.component.html',
  styleUrls: ['../modals.css', './outgoing-challenge.component.css']
})
export class OutgoingChallengeComponent implements OnInit {
  @Input('challengee') challengee: {id: number, Screen_Name: string};
  @Input('challengeId') challengeId: number;
  @Input('seconds_remaining') seconds_remaining = 2;
  @Output('cancel') cancel = new EventEmitter<null>();

  constructor(private gameService: GameService, private toaster: ToastsManager, vcr: ViewContainerRef) {
    this.toaster.setRootViewContainerRef(vcr);
  }

  ngOnInit() {}

  cancelChlg() {
    // Send a request to the server to cancel the challenge
    this.gameService.cancelChallenge(this.challengeId).subscribe(
      (data => {
        if (data.success) {
          // Emit a cancel event so that the modal is closed
          this.cancel.emit(null);
        } else {
          // Just display a message
          this.toaster.error(data.message, 'Error canceling challenge');
        }
      }),
      (error => {
        // Just display a message
        this.toaster.error(error, 'Error canceling challenge');
      })
    );
  }
}

