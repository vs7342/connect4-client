import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ChatComponent } from './chat/chat.component';
import { RoomDetailsComponent } from './room-details/room-details.component';
import { OnlinePlayersComponent } from './online-players/online-players.component';
import { MessageComponent } from './message/message.component';
import { GameBoardComponent } from './game-board/game-board.component';
import {RouterModule, Routes} from '@angular/router';
import { LobbyComponent } from './lobby/lobby.component';
import { RoomComponent } from './room/room.component';
import { GameComponent } from './game/game.component';
import {ToastModule} from 'ng2-toastr';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpModule} from '@angular/http';
import {ConstantsService} from './services/constants.service';
import {NetworkService} from './services/network.service';
import {DataService} from './services/data.service';
import { OutgoingChallengeComponent } from './modals/outgoing-challenge/outgoing-challenge.component';
import { IncomingChallengeComponent } from './modals/incoming-challenge/incoming-challenge.component';

const appRoutes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'lobby', component: LobbyComponent },
  { path: 'room', component: RoomComponent },
  { path: 'game', component: GameComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    ChatComponent,
    RoomDetailsComponent,
    OnlinePlayersComponent,
    MessageComponent,
    GameBoardComponent,
    LobbyComponent,
    RoomComponent,
    GameComponent,
    OutgoingChallengeComponent,
    IncomingChallengeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    ToastModule.forRoot(),
    RouterModule.forRoot(appRoutes)
  ],
  providers: [ConstantsService, NetworkService, DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
