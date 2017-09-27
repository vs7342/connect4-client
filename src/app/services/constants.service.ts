export class ConstantsService {
  private base_api_url = 'http://localhost:80/';
  private api_key = 'some dummy key for github commit';
  getApiBaseUrl() {
    return this.base_api_url;
  }
  getApiKey() {
    return this.api_key;
  }
}
