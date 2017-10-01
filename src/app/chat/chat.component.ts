import {
  AfterViewChecked,
  AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Message } from '../models/message.model';
import {DataService} from '../services/data.service';
import {MessageService} from '../services/message.service';
import {ToastsManager} from 'ng2-toastr';

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
  constructor(
    private dataService: DataService,
    private messageService: MessageService,
    private toaster: ToastsManager,
    vcr: ViewContainerRef
  ) {
    toaster.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
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
    }
  }

  onSendClick(txtArea: HTMLTextAreaElement) {
    // Fetch txtArea value and validate
    const msgValue = txtArea.value;
    if (msgValue.length <= 250) {
      // Display error if no message was entered
      if (msgValue.length <= 0) {
        return this.toaster.error('Kindly enter message text', 'Validation Error');
      }
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
    }else {
      this.toaster.error('Msg text too long', 'Validation Error');
    }
  }
  ngAfterViewChecked() {
    // Scroll to the bottom of message list
    this.allMessages.nativeElement.scrollTop = this.allMessages.nativeElement.scrollHeight;
  }

}
