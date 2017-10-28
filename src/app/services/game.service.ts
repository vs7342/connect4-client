import {Injectable} from '@angular/core';
import {NetworkService} from './network.service';
import {ConstantsService} from './constants.service';

@Injectable()
export class GameService {
  api_url: string;
  constructor(private networkService: NetworkService, private constantsService: ConstantsService) {
    this.api_url = this.constantsService.getApiBaseUrl();
  }

  /**
   * Returns an Observable based on '/challenge' POST request
   * @param from_user_id
   * @param to_user_id
   * @returns {Observable}
   */
  postChallenge(from_user_id: number, to_user_id: number) {
    const postBody = {
      From_User_id: from_user_id,
      To_User_id: to_user_id
    };
    return this.networkService.httpPost(this.api_url + 'challenge', postBody);
  }

  /**
   * Returns an Observable based on '/challenge/incoming?To_User_id={user_id}' GET request
   * @param user_id
   * @returns {Observable}
   */
  checkIncomingChallenge(user_id: number) {
    // Constructing the URL
    const url = this.api_url + 'challenge/incoming?To_User_id=' + user_id;
    // Returning the api call observable
    return this.networkService.httpGet(url);
  }

  /**
   * Returns an Observable based on '/challenge/ongoing?Challenge_id={challenge_id}' GET request
   * @param challenge_id
   * @returns {Observable}
   */
  checkOngoingChallenge(challenge_id: number) {
    // Constructing the URL
    const url = this.api_url + 'challenge/ongoing?Challenge_id=' + challenge_id;
    // Returning the api call observable
    return this.networkService.httpGet(url);
  }

  /**
   * Returns an Observable based on '/challenge/accept' PUT request
   * @param challenge_id
   * @returns {Observable}
   */
  acceptChallenge(challenge_id: number) {
    const putBody = {
      Challenge_id: challenge_id
    };
    return this.networkService.httpPut(this.api_url + 'challenge/accept', putBody);
  }

  /**
   * Returns an Observable based on '/challenge/decline' PUT request
   * @param challenge_id
   * @returns {Observable}
   */
  declineChallenge(challenge_id: number) {
    const putBody = {
      Challenge_id: challenge_id
    };
    return this.networkService.httpPut(this.api_url + 'challenge/decline', putBody);
  }

  /**
   * Returns an Observable based on '/challenge/cancel' PUT request
   * @param challenge_id
   * @returns {Observable}
   */
  cancelChallenge(challenge_id: number) {
    const putBody = {
      Challenge_id: challenge_id
    };
    return this.networkService.httpPut(this.api_url + 'challenge/cancel', putBody);
  }

  /**
   * Basically initializes the game in the DB and returns game id and player objects
   * Returns an Observable based on '/game' POST request
   * @param challenge_id
   * @returns {Observable}
   */
  initGame(challenge_id) {
    const postBody = {
      Challenge_id: challenge_id
    };
    return this.networkService.httpPost(this.api_url + 'game', postBody);
  }

  /**
   * Returns an Observable based on '/piece' POST request
   * @param position_x
   * @param player_id
   * @param game_id
   * @param room_id
   * @param user_id
   * @returns {Observable}
   */
  postPiece(position_x, player_id, game_id, room_id, user_id) {
    const postBody = {
      Position_X: position_x,
      Player_id: player_id,
      Game_id: game_id,
      Room_id: room_id,
      User_id: user_id
    };
    return this.networkService.httpPost(this.api_url + 'piece', postBody);
  }

  /**
   * Returns an Observable based on '/pieces/all?Game_id={game_id}' GET request
   * @param game_id
   * @returns {Observable}
   */
  getPieces(game_id: number) {
    // Constructing the URL
    const url = this.api_url + 'piece/all?Game_id=' + game_id;
    // Returning the api call observable
    return this.networkService.httpGet(url);
  }

  /**
   * Returns an Observable based on '/game/state?Game_id={game_id}&User_id={user_id}' GET request
   * @param game_id
   * @param user_id
   * @returns {Observable}
   */
  getMyGameState(game_id: number, user_id: number) {
    // Constructing the URL
    const url = this.api_url + 'game/state?Game_id=' + game_id + '&User_id=' + user_id;
    // Returning the api call observable
    return this.networkService.httpGet(url);
  }
}
