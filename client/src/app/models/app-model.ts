import { Injectable } from '@angular/core';

import { BaseModel } from './base-model';
import { MessageService } from './../services/message.service';

@Injectable()
export class AppModel extends BaseModel {
    public zoom: number = 1.0;

    constructor(protected messageService: MessageService) {
        super();

        super.init();
    }
}
