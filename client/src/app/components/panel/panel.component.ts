import { Component, OnInit } from '@angular/core';

import { Constants } from '../../constants';

import { HistoryService } from '../../services/history.service';
import { SvgService } from '../../services/svg.service';

import { ControlItem } from '../../models/control-item.model';
import { AppModel } from '../../models/app.model';

@Component({
    selector: 'div[app-panel]',
    templateUrl: './panel.component.html',
    styleUrls: ['./panel.component.scss']
})
export class PanelComponent implements OnInit {
    toolItems = Constants.TOOL_ITEMS;
    pageItems = Constants.PAGE_ITEMS;
    fileItems = Constants.FILE_ITEMS;

    constructor(private appModel: AppModel,
        private historyService: HistoryService,
        private svgService: SvgService,
    ) { }

    ngOnInit() {
    }

    clickHandler($event: Event, item: ControlItem) {
        switch (item.id) {
            case Constants.TYPE_PLUS:
                return this.appModel.zoom = this.appModel.zoom + Constants.DEFAULT_ZOOM_DELATA;

            case Constants.TYPE_MINUS:
                return this.appModel.zoom = this.appModel.zoom - Constants.DEFAULT_ZOOM_DELATA;

            case Constants.TYPE_GRID:
                return this.appModel.grid = isNaN(this.appModel.grid)? Constants.DEFAULT_GRID: NaN;

            case Constants.TYPE_SAVE:
                return this.svgService.save();

            case Constants.TYPE_BACK:
                return this.historyService.back();

            case Constants.TYPE_NEXT:
                return this.historyService.next();

            case Constants.TYPE_MOVE:
                return this.appModel.selectedTool = item.id;
        };
    }

    loadHandler(event: any) {
        event.stopPropagation();
        event.preventDefault();

        // get first file
        const getFile = (): File | undefined => {
            if (event.target.files && event.target.files.length > 0) {
                return event.target.files[0];
            } else if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
                return event.dataTransfer.files[0];
            }
            return undefined;
        }
        const file = getFile();
        if (file) {
            this.svgService.load(file);
        }
    }
}
