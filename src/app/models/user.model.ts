export class User {
  constructor(
    public id: number,
    public Email_id: string,
    public First_Name: string,
    public Screen_Name: string,
    public Win_Count: number,
    public Games_Played: number,
    public User_Since: Date,
    public Experience: number,
    public Room_id: number
  ) {}
}
