import { Component, Input, OnInit } from '@angular/core';

import { ControlItem } from './../../models/control-item.model';
import { MessageService } from './../../services/message.service';

import { AppModel } from './../../models/app-model';

@Component({
    selector: 'app-controls-grid',
    templateUrl: './controls-grid.component.html',
    styleUrls: ['./controls-grid.component.scss']
})
export class ControlsGridComponent implements OnInit {
    @Input() items: ControlItem[];

    active: ControlItem;

    constructor(private messageService: MessageService, private appModel: AppModel) { }

    ngOnInit() { }

    clickHandler($event: Event, item: ControlItem) {
        const PLUS = 'plus';
        const MINUS = 'minus';

        this.active = item;
        this.messageService.send({name: "control-item", data: item});

        switch (item.id) {
            case PLUS:
                return this.appModel.zoom = this.appModel.zoom + 0.1;

            case MINUS:
                return this.appModel.zoom = this.appModel.zoom - 0.1;
        };
    }
}
