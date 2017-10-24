import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-piece',
  templateUrl: './piece.component.html',
  styleUrls: ['./piece.component.css'],
})
export class PieceComponent implements OnInit {
  // Attributes to draw the piece with color and at a specific location
  @Input() pieceColor: string;
  @Input() position_x: number;
  @Input() position_y: number;

  // Event emitter to call the playTurn method of the game board component based on position x
  @Output('columnClicked') columnClicked = new EventEmitter<number>();

  // Properties which will be bound to left and bottom position
  left: string;
  bottom: string;

  constructor() { }

  ngOnInit() {
    this.left = (this.position_x * 50) + 'px';
    this.bottom = (this.position_y * 50) + 'px';
  }

  emitColumnClicked() {
    this.columnClicked.emit(this.position_x);
  }

}
