import * as io from 'socket.io-client';
export class ConstantsService {
  private base_api_url = 'http://localhost:80/';
  private socket = io('http://localhost:80/messages');
  getApiBaseUrl() {
    return this.base_api_url;
  }
  getSocket() {
    return this.socket;
  }
}
