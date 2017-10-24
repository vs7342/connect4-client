export class Piece {
  constructor(
    public id: number,
    public Position_X: number,
    public Position_Y: number,
    public User_id: number,
    public Player: {
      Color: string,
      id: number
    }
  ) {}
}
