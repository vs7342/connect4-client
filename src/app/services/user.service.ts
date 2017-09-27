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
}
