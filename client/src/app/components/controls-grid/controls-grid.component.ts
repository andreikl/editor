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

    active: ControlItem;

    constructor(private messageService: MessageService,
        private historyService: HistoryService,
        private svgService: SvgService,
        private appModel: AppModel) {
    }

    ngOnInit() { }

    clickHandler($event: Event, item: ControlItem) {
        this.active = item;

        switch (item.id) {
            case Constants.ID_PLUS:
                return this.appModel.zoom = this.appModel.zoom + Constants.DEFAULT_ZOOM_DELATA;

            case Constants.ID_MINUS:
                return this.appModel.zoom = this.appModel.zoom - Constants.DEFAULT_ZOOM_DELATA;

            case Constants.ID_GRID:
                return this.appModel.grid = isNaN(this.appModel.grid)? Constants.DEFAULT_GRID: NaN;

            case Constants.ID_SAVE:
                return this.svgService.save();

            case Constants.ID_BACK:
                return this.historyService.back();

            case Constants.ID_NEXT:
                return this.historyService.next();

            case Constants.ID_LINE:
            case Constants.ID_RECTANGLE:
            case Constants.ID_PEN:
            case Constants.ID_MOVE:
                return this.appModel.selectedTool = item.id;
        };
    }
}
