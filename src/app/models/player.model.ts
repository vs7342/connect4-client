export class Player {
  constructor(
    public id: number,
    public Has_Turn: boolean,
    public Is_Challenger: boolean,
    public Is_Winner: boolean,
    public Color: string,
    public Last_Played: Date,
    public Game_id: number,
    public Room_id: number,
    public User_id: number
  ) {}
}
