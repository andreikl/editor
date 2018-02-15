import 'rxjs/add/operator/filter';
import { Subject } from 'rxjs/Subject';

import { Injectable } from '@angular/core';

import { Message } from './../models/message.model';

@Injectable()
export class MessageService {
  subject = new Subject<Message>();

  constructor() { }

  public send(m: Message) {
    this.subject.next(m);
  }

  public subscribe(name: string, callback: ((m: Message) => void)) {
    return this.subject.filter(message => message.name == name).subscribe(
      (m: Message) => {
        callback(m);
      },
      e => console.log("MessageService error", e),
      () => console.log("MessageService: completed")
    );
  }
}
