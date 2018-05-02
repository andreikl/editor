import { Component, Input, OnInit } from '@angular/core';

import { ControlItem } from './../../models/control-item.model';
import { MessageService } from './../../services/message.service';
import { HistoryService } from '../../services/history.service';
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

    active: ControlItem | undefined;

    constructor(private messageService: MessageService,
        private historyService: HistoryService,
        private svgService: SvgService,
        private appModel: AppModel) {
    }

    ngOnInit() {
        this.messageService.subscribe(Constants.EVENT_MODEL_CHANGED, (message) => {
            if (message.data.name == Constants.EVENT_SELECTED_TOOL && !this.appModel.selectedTool) {
                this.active = undefined;
            }
        });
     }

    clickHandler($event: Event, item: ControlItem) {
        this.active = item;

        switch (item.id) {
            case Constants.ID_LINE:
            case Constants.ID_RECTANGLE:
            case Constants.ID_PEN:
            case Constants.ID_ARC:
            case Constants.ID_SIZE:
                return this.appModel.selectedTool = item.id;
        };
    }
}
