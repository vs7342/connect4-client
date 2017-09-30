import { Component } from '@angular/core';
import {UserService} from './services/user.service';
import {RoomService} from './services/room.service';
import {MessageService} from './services/message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [UserService, RoomService, MessageService]
})
export class AppComponent {
}
