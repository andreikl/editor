import { Component, Input, OnInit } from '@angular/core';

import { ControlItem } from './../../models/control-item.model';
import { MessageService } from './../../services/message.service';
import { SvgService } from './../../services/svg.service';


import { AppModel } from './../../models/app.model';
import { Constants } from '../../constants';

@Component({
    selector: 'app-controls-grid',
    templateUrl: './controls-grid.component.html',
    styleUrls: ['./controls-grid.component.scss']
})
export class ControlsGridComponent implements OnInit {
    @Input() items: ControlItem[];

    active: ControlItem;

    constructor(private messageService: MessageService,
        private svgService: SvgService,
        private appModel: AppModel) {
    }

    ngOnInit() { }

    clickHandler($event: Event, item: ControlItem) {
        const PLUS = 'plus';
        const MINUS = 'minus';

        this.active = item;
        this.messageService.send({name: "control-item", data: item});

        switch (item.id) {
            case Constants.ID_PLUS:
                return this.appModel.zoom = this.appModel.zoom + Constants.ZOOM_DELATA;

            case Constants.ID_MINUS:
                return this.appModel.zoom = this.appModel.zoom - Constants.ZOOM_DELATA;
            
            case Constants.ID_SAVE:
                return this.svgService.save();
        };
    }
}
