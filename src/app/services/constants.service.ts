import * as io from 'socket.io-client';
export class ConstantsService {
  private base_api_url = 'http://localhost:80/';
  private api_key = 'some dummy key for github commit';
  private socket = io('http://localhost:80/messages');
  getApiBaseUrl() {
    return this.base_api_url;
  }
  getApiKey() {
    return this.api_key;
  }
  getSocket() {
    return this.socket;
  }
}
