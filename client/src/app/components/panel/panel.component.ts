import { Component, OnInit } from '@angular/core';

import { Constants } from '../../constants';

@Component({
    selector: 'div[app-panel]',
    templateUrl: './panel.component.html',
    styleUrls: ['./panel.component.scss']
})
export class PanelComponent implements OnInit {
    toolItems = Constants.TOOL_ITEMS;

    constructor() { }

    ngOnInit() {
    }
}
