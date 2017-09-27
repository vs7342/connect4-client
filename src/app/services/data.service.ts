import {User} from '../models/user.model';

export class DataService {
  private token: string;
  private currentUser: User;
  setToken(token: string) {
    this.token = token;
  }
  getToken() {
    return this.token;
  }
  setCurrentUser(currentUser: User) {
    this.currentUser = currentUser;
  }
  getCurrentUser() {
    return this.currentUser;
  }
}
