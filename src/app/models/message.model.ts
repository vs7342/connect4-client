export class Message {
  constructor(
    public id: number,
    public To_id: number,
    public Text: string,
    public Message_Time: Date,
    public From_User_id: number,
    public From_Screen_Name: string
  ) {}
}
