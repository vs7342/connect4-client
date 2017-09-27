export class User {
  constructor(
    private id: string,
    private Email_id: string,
    private First_Name: string,
    private Screen_Name: string,
    private Win_Count: number,
    private Games_Played: number,
    private User_Since: Date,
    private Experience: number,
    private Room_id: number
  ) {}
}
