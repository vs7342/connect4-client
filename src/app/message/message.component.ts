import {Component, Input, OnInit} from '@angular/core';
import {Message} from '../models/message.model';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
  // Actual message object
  @Input('msgAttr') message: Message;
  // If the message was sent by the user using the app, then the message will be right aligned
  @Input('isSentByUser') isSentByUser: boolean;
  constructor() { }

  ngOnInit() {
  }

}
