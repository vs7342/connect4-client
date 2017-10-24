import * as io from 'socket.io-client';
export class ConstantsService {
  private base_api_url = 'http://localhost:80/';
  private socket = io('http://localhost:80/messages');
  private game_socket_link = 'http://localhost:80/game';
  getApiBaseUrl() {
    return this.base_api_url;
  }
  getSocket() {
    return this.socket;
  }
  getGameSocketLink(){
    return this.game_socket_link;
  }
}
