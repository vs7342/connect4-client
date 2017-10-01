import {Injectable} from '@angular/core';
import {NetworkService} from './network.service';
import {ConstantsService} from './constants.service';

@Injectable()
export class RoomService {
  api_url: string;
  constructor(private networkService: NetworkService, private constantsService: ConstantsService) {
    this.api_url = this.constantsService.getApiBaseUrl();
  }

  /**
   * Returns an Observable based on '/rooms' GET request
   * @returns {Observable}
   */
  getRooms() {
    return this.networkService.httpGet(this.api_url + 'rooms');
  }

  /**
   * Returns an Observable based on '/room/details?Room_id={room_id}&User_id={user_id}' GET request
   * @param room_id
   * @param user_id
   * @returns {Observable}
   */
  getRoomDetails(room_id: number, user_id: number) {
    // Constructing the URL
    const url = this.api_url + 'room/details?Room_id=' + room_id + '&User_id=' + user_id;
    // Returning the api call observable
    return this.networkService.httpGet(url);
  }
  /**
   * Returns an Observable based on 'socket/clients?room_id={user_id}' GET request
   * @param room_id
   * @returns {Observable}
   */
  getSocketRoomDetails(room_id: number) {
    // Constructing the URL
    const url = this.api_url + 'socket/clients?room_id=' + room_id;
    // Returning the api call observable
    return this.networkService.httpGet(url);
  }
}
