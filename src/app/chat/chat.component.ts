import {
  AfterViewChecked,
  AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Message } from '../models/message.model';
import {DataService} from '../services/data.service';
import {MessageService} from '../services/message.service';
import {ToastsManager} from 'ng2-toastr';
import {ConstantsService} from "../services/constants.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  // Component using the chat component will set this attribute - To separate group and individual message logic
  @Input('isGroupChat') isGroupChat: boolean;
  // For scrolling
  @ViewChild('allMessages') allMessages: ElementRef;
  // Attributes needed to load messages
  messages: Message[] = [];
  currentUserId: number;
  currentUserScreenName: string;
  roomId: number;
  opponentUserId: number;
  socket: any;
  constructor(
    private dataService: DataService,
    private messageService: MessageService,
    private constantService: ConstantsService,
    private toaster: ToastsManager,
    vcr: ViewContainerRef
  ) {
    toaster.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    // Initialize socket
    this.socket = this.constantService.getSocket();
    // Get logged in user details
    const currentUser = this.dataService.getCurrentUser();
    this.currentUserId = currentUser.id;
    this.currentUserScreenName = currentUser.Screen_Name;
    this.roomId = currentUser.Room_id;
    // Check the chat type - Individual or group
    if (this.isGroupChat) {
      // Access the group chat service and initialize messages array
      this.messageService.getGroupMessages(this.roomId, this.currentUserId).subscribe(
        (data => {
          if (data.success) {
            const dataMessages = data.messages;
            for (let i = 0; i < dataMessages.length; i++) {
              const singleMsg = dataMessages[i];
              const singleMsgToPush = new Message(singleMsg.id,
                currentUser.Room_id,
                singleMsg.Text,
                singleMsg.Message_Time,
                singleMsg.From_User_id,
                singleMsg.User.Screen_Name);
              this.messages.push(singleMsgToPush);
            }
            console.log(this.messages);
          } else {
            // Display an error message
            this.toaster.error(data.message, 'Error fetching message');
          }
        }),
        (error => {
          // Display an error message
          this.toaster.error(error, 'Error fetching message');
        })
      );
    }else {
      // Access the individual chat service and initialize messages array
      this.opponentUserId = +this.dataService.getOpponentUserId();
      this.messageService.getIndividualConversation(this.opponentUserId, this.currentUserId).subscribe(
        (data => {
          if (data.success) {
            const dataMessages = data.messages;
            for (let i = 0; i < dataMessages.length; i++) {
              const singleMsg = dataMessages[i];
              const singleMsgToPush = new Message(singleMsg.id,
                -1,
                singleMsg.Text,
                singleMsg.Message_Time,
                singleMsg.From_User_id,
                singleMsg.User.Screen_Name);
              this.messages.push(singleMsgToPush);
            }
            console.log(this.messages);
          } else {
            // Display an error message
            this.toaster.error(data.message, 'Error fetching individual conversation.');
          }
        }),
        (error => {
          // Display an error message
          this.toaster.error(error, 'Error fetching individual conversation.');
        })
      );
    }

    /**
     * Socket handler to receive messages in that room
     */
    this.socket.on('client-rcv-room-msg', data => {
      // push the message to messages array
      this.messages.push(new Message(
        data.message_id,
        data.To_id,
        data.Text,
        data.Message_Time,
        data.From_User_id,
        data.Screen_Name
      ));
    });
    /**
     * Socket handler to receive individual messages from opponent
     */
    this.socket.on('client-rcv-ind-msg', data => {
      // Push message to array only if the 'To_id' is same as currentUserId
      if (data.To_id === this.currentUserId) {
        this.messages.push(new Message(
          data.message_id,
          data.To_id,
          data.Text,
          data.Message_Time,
          data.From_User_id,
          data.Screen_Name
        ));
      }
    });
  }

  onSendClick(txtArea: HTMLTextAreaElement) {
    // Fetch txtArea value and validate
    const msgValue = txtArea.value;
    if (msgValue.length <= 250) {
      // Display error if no message was entered
      if (msgValue.length <= 0) {
        return this.toaster.error('Kindly enter message text', 'Validation Error');
      }
      // Check for individual or group messages
      if (this.isGroupChat) {
        // Send Group Message
        // Access send method of message service
        this.messageService.sendGroupMessages(this.roomId, this.currentUserId, msgValue).subscribe(
          (data => {
            if (data.success) {
              // Update messages array of the component
              const postedMsg = data.message;
              this.messages.push(new Message(
                postedMsg.id,
                postedMsg.To_id,
                postedMsg.Text,
                postedMsg.Message_Time,
                postedMsg.From_User_id,
                this.currentUserScreenName
              ));
              // Reset text area
              txtArea.value = '';
              // Send message to socket
              this.socket.emit('send-room-message', {
                // This is needed by the socket to identify the room number
                room_id: this.roomId,
                // Details to construct Message object
                message_id: postedMsg.id,
                To_id: postedMsg.To_id,
                Text: postedMsg.Text,
                Message_Time: postedMsg.Message_Time,
                From_User_id: postedMsg.From_User_id,
                Screen_Name: this.currentUserScreenName
              });
            }else {
              // Display error toast
              this.toaster.error(data.message, 'Error sending message');
            }
          }),
          (error => {
            // Display error toast
            this.toaster.error(error, 'Error sending message');
          })
        );
      } else {
        // Send individual message
        this.messageService.sendIndividualMessage(this.currentUserId, this.opponentUserId, msgValue).subscribe(
          (data => {
            if (data.success) {
              // Update messages array of the component
              const postedMsg = data.message;
              this.messages.push(new Message(
                postedMsg.id,
                postedMsg.To_id,
                postedMsg.Text,
                postedMsg.Message_Time,
                postedMsg.From_User_id,
                this.currentUserScreenName
              ));
              // Reset text area
              txtArea.value = '';
              // Send message to socket
              this.socket.emit('send-ind-message', {
                // Details to construct Message object
                message_id: postedMsg.id,
                To_id: postedMsg.To_id,
                Text: postedMsg.Text,
                Message_Time: postedMsg.Message_Time,
                From_User_id: postedMsg.From_User_id,
                Screen_Name: this.currentUserScreenName
              });
            }else {
              // Display error toast
              this.toaster.error(data.message, 'Error sending message to opponent');
            }
          }),
          (error => {
            // Display error toast
            this.toaster.error(error, 'Error sending message to opponent');
          })
        );
      }
    }else {
      this.toaster.error('Msg text too long', 'Validation Error');
    }
  }
  ngAfterViewChecked() {
    // Scroll to the bottom of message list
    this.allMessages.nativeElement.scrollTop = this.allMessages.nativeElement.scrollHeight;
  }

}
