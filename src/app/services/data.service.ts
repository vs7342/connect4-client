import {User} from '../models/user.model';
import deleteProperty = Reflect.deleteProperty;
import {Player} from "../models/player.model";

export class DataService {

  verifyToken() {
    // Fetch the token from local storage
    const token = localStorage.getItem('token');

    // If the token is present, then proceed with validation
    if (token) {
      // Now check if the token is valid - 'exp' value
      const payload = JSON.parse(atob(token.split('.')[1]));
      // This will return true if token is not expired.. else it will
      return payload.exp > Date.now() / 1000;
    } else {
      // Return false since token variable was not found in the local storage
      return false;
    }
  }

  setToken(token: string) {
    // Set the 'token' variable in the local storage
    localStorage.setItem('token', token);
  }

  getToken() {
    // Get the 'token' variable from the local storage
    const token = localStorage.getItem('token');
    // Check if a valid token is present.. else return blank string
    if (token && this.verifyToken()) {
      return token;
    }else {
      return '';
    }
  }

  getCurrentUser() {
    let user: User;
    // First get the token
    const token = this.getToken();
    if (token) {
      // Since token is valid, extract payload info from it
      let payload = JSON.parse(atob(token.split('.')[1]));
      // Delete the exp and iat attributes from the payload
      Reflect.deleteProperty(payload, 'exp');
      Reflect.deleteProperty(payload, 'iat');

      // Cast it into a 'User' type object
      user = payload;

      // If the roomId is stored in the localStorage, then assign the Room_Id of user to that value
      if (this.getCurrentUserRoom()) {
        user.Room_id = +this.getCurrentUserRoom();
      }

      return user;
    } else {
      // I guess just log out.. navigate to home page
      return null;
    }
  }

  setCurrentUserRoom(roomId: number) {
    localStorage.setItem('roomId', roomId.toString());
  }

  getCurrentUserRoom() {
    return localStorage.getItem('roomId');
  }

  setCurrentChallenge(challengeId: number) {
    localStorage.setItem('challengeId', challengeId.toString());
  }

  getCurrentChallenge() {
    return localStorage.getItem('challengeId');
  }

  setOpponentUserId(opponentUserId: number) {
    localStorage.setItem('opponentUserId', opponentUserId.toString());
  }

  getOpponentUserId() {
    return localStorage.getItem('opponentUserId');
  }

  setGameId(gameId: number) {
    if (gameId === -1) {
      localStorage.setItem('gameId', '');
    }else {
      localStorage.setItem('gameId', gameId.toString());
    }
  }

  getGameId() {
    return localStorage.getItem('gameId');
  }

  setPlayer(player_type: string, player_obj: Player) {
    localStorage.setItem('player_' + player_type, JSON.stringify(player_obj));
  }

  getPlayer(player_type: string): Player {
    return JSON.parse(localStorage.getItem('player_' + player_type));
  }
}
