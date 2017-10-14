import {Injectable} from '@angular/core';
import {NetworkService} from './network.service';
import {ConstantsService} from './constants.service';

@Injectable()
export class MessageService {
  api_url: string;
  constructor(private networkService: NetworkService, private constantsService: ConstantsService) {
    this.api_url = this.constantsService.getApiBaseUrl();
  }

  /**
   * Returns an Observable based on 'message/room?Room_id={room_id}&User_id={user_id}' GET request
   * @returns {Observable}
   */
  getGroupMessages(room_id: number, user_id: number) {
    return this.networkService.httpGet(this.api_url + 'message/room?Room_id=' + room_id + '&User_id=' + user_id);
  }
  /**
   * Returns an Observable based on 'message/room' POST request
   * @returns {Observable}
   */
  sendGroupMessages(room_id: number, user_id: number, msg_text: string) {
    const postBody = {
      Text: msg_text,
      From_User_id: user_id,
      Room_id: room_id
    };
    return this.networkService.httpPost(this.api_url + 'message/room', postBody);
  }
  /**
   * Returns an Observable based on 'message/individual/conversation?user_id_1={user_id_1}&user_id_2={user_id_2}' GET request
   * @param user_id_1
   * @param user_id_2
   * @returns {Observable}
   */
  getIndividualConversation(user_id_1: number, user_id_2: number) {
    return this.networkService.httpGet(this.api_url + 'message/individual/conversation?user_id_1=' + user_id_1 + '&user_id_2=' + user_id_2);
  }

  /**
   * Returns an Observable based on 'message/individual' POST request
   * @param from_user_id
   * @param to_user_id
   * @param msg_text
   * @returns {Observable}
   */
  sendIndividualMessage(from_user_id: number, to_user_id: number, msg_text: string) {
    const postBody = {
      Text: msg_text,
      From_User_id: from_user_id,
      To_id: to_user_id
    };
    return this.networkService.httpPost(this.api_url + 'message/individual', postBody);
  }
}
