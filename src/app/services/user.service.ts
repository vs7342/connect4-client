import {Injectable} from '@angular/core';
import {NetworkService} from './network.service';
import {ConstantsService} from './constants.service';

@Injectable()
export class UserService {
  api_url: string;
  constructor(private networkService: NetworkService, private constantsService: ConstantsService) {
    this.api_url = this.constantsService.getApiBaseUrl();
  }

  /**
   * Returns an Observable based on '/login' POST request
   * @param email
   * @param password
   * @returns {Observable}
   */
  login(email: string, password: string) {
    const url = this.api_url + 'login';
    const postBody = {
      Email_id: email,
      Password: password
    };
    return this.networkService.httpPost(url, postBody);
  }

  /**
   * Returns an Observable based on '/signup' POST request
   * @param email
   * @param first_name
   * @param last_name
   * @param screen_name
   * @param password
   * @returns {Observable}
   */
  signup(email: string, first_name: string, last_name: string, screen_name: string, password: string) {
    const url = this.api_url + 'signup';
    const postBody = {
      Email_id: email,
      First_Name: first_name,
      Last_Name: last_name,
      Screen_Name: screen_name,
      Password: password
    };
    return this.networkService.httpPost(url, postBody);
  }

  /**
   * Returns an Observable based on '/enter/room' PUT request
   * @param room_id
   * @param user_id
   * @returns {Observable}
   */
  enterRoom(room_id: number, user_id: number) {
    const url = this.api_url + 'enter/room';
    const putBody = {
      User_id: user_id,
      Room_id: room_id
    };
    return this.networkService.httpPut(url, putBody);
  }

  logout(user_id) {
    // Call the enter/room endpoint since there is no session based stuff on server apart from changing user's room to a lobby
    const url = this.api_url + 'enter/room';
    const putBody = {
      User_id: user_id,
      Room_id: 1
    };

    // Now call the api to update the room id in DB
    return this.networkService.httpPut(url, putBody);
  }
}
