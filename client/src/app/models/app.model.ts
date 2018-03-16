import { Injectable } from '@angular/core';

import { MessageService } from './../services/message.service';

import { DrawData } from './draw-data.interface';
import { Point } from './point.interface';
import { BaseModel } from './base.model';
import { Constants } from '../constants';

@Injectable()
export class AppModel extends BaseModel {
    public zoom: number = Constants.DEFAULT_ZOOM;
    public grid: number = Constants.DEFAULT_GRID;
    public offset: Point = {
        x: 0,
        y: 0
    };
    public size: Point = {
        x: -1,
        y: -1
    };
    public data: Array<DrawData> = [];

    constructor(protected messageService: MessageService) {
        super();

        super.init();
    }
}
