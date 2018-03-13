import { Injectable } from '@angular/core';

import { MessageService } from './../services/message.service';

import { BaseModel } from './base.model';
import { DrawData } from './draw-data.interface';

@Injectable()
export class AppModel extends BaseModel {
    public zoom: number = 1.0;
    public data: Array<DrawData> = [];

    constructor(protected messageService: MessageService) {
        super();

        super.init();
    }
}
