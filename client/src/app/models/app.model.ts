import { Injectable } from '@angular/core';

import { MessageService } from './../services/message.service';

import { DrawData } from './draw-data.interface';
import { Point } from './point.interface';
import { BaseModel } from './base.model';

@Injectable()
export class AppModel extends BaseModel {
    public zoom: number = 10.0;
    public offset: Point = {
        x: 0,
        y: 0
    };
    public data: Array<DrawData> = [];

    constructor(protected messageService: MessageService) {
        super();

        super.init();
    }
}
