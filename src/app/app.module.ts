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
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

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
    GameComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    ToastModule.forRoot(),
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
