import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { Message } from './../models/message.model';

@Injectable()
export class MessageService {
  subject = new Subject();

  constructor() { }

  public send(m: Message) {
    console.log("MessageService send: ", m);
    this.subject.next(m);
  }

  public subscribe(callback: ((m: Message) => void)) {
    return this.subject.subscribe(
      (m: Message) => {
        console.log("MessageService message", m);
        callback(m);
      },
      e => console.log("MessageService error", e),
      () => console.log("MessageService: completed")
    );
  }
}
