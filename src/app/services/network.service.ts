import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import 'rxjs/Rx';
import {Observable} from 'rxjs/Observable';
import {ConstantsService} from './constants.service';

@Injectable()
export class NetworkService {
  constructor(private http: Http, private constantsService: ConstantsService) { }

  /**
   * Generic method to perform http GET requests.
   * @param url with query parameters
   * @returns {Observable}
   */
  httpGet(url: string) {
    return this.http.get(url, {headers: this.getHeaders('dummy')})
      .map((response: Response) => {
        return response.json();
      })
      .catch((error: Response) => {
        if (error.json().message) {
          // This means that the error body has some message in it from the server.. just return that.
          return Observable.throw(error.json().message);
        } else {
          // Return something generic
          console.error('Error in httpGet: ' + error);
          return Observable.throw('Something went wrong. Please contact Admin.');
        }
      });
  }

  /**
   * Generic method to perform http POST requests.
   * @param url
   * @param postBody
   * @returns {Observable}
   */
  httpPost(url: string, postBody: any) {
    return this.http.post(url, postBody, {headers: this.getHeaders('dummy')})
      .map((response: Response) => {
        return response.json();
      })
      .catch((error: Response) => {
        if (error.json().message) {
          // This means that the error body has some message in it from the server.. just return that.
          return Observable.throw(error.json().message);
        } else {
          // Return something generic
          console.error('Error in httpPost: ' + error);
          return Observable.throw('Something went wrong. Please contact Admin.');
        }
      });
  }

  /**
   * Generic method to perform http PUT requests.
   * @param url
   * @param putBody
   * @returns {Observable}
   */
  httpPut(url: string, putBody: any) {
    return this.http.put(url, putBody, {headers: this.getHeaders('dummy')})
      .map((response: Response) => {
        return response.json();
      })
      .catch((error: Response) => {
        if (error.json().message) {
          // This means that the error body has some message in it from the server.. just return that.
          return Observable.throw(error.json().message);
        } else {
          // Return something generic
          console.error('Error in httpPut: ' + error);
          return Observable.throw('Something went wrong. Please contact Admin.');
        }
      });
  }

  /**
   * Fetches the header which should be sent along with the request
   * Creates a header with an api-key (generic key to access api) and access-token (which is specific to user)
   * @param token
   */
  getHeaders(token: string) {
    return new Headers({
      'api-key': this.constantsService.getApiKey(),
      'access-token': token
    });
  }
}
