import { Injectable } from '@angular/core';

import { MessageService } from './../services/message.service';

import { BaseModel } from './base.model';
import { Constants } from '../constants';

@Injectable()
export class AppModel extends BaseModel {
    public properties: string[] = [
        'zoom',
        'grid',
        'net',
        'net2',
        'offset',
        'size',
        'selectedPrimitive',
        'selectedTool',
        'history',
        'data'
    ];

    public zoom: number = Constants.DEFAULT_ZOOM;
    public grid: number = Constants.DEFAULT_GRID;
    public net: number = Constants.DEFAULT_NET;
    public net2: number = Constants.DEFAULT_NET_2;
    public offset: Point = {
        x: 0,
        y: 0
    };
    public size: Point = {
        x: -1,
        y: -1
    };
    public selectedPrimitive?: Primitive;
    public selectedTool: string | undefined;

    public history: Map<string, Primitive>[] = [];
    public data = new Map<string, Primitive>();


    constructor(protected messageService: MessageService) {
        super();

        super.init();
    }
}
