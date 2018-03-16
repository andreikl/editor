//import { Component, OnInit, HostListener } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';
import {LayoutModule} from '@angular/cdk/layout';

import { ControlItem } from './models/control-item.model';
import { Constants } from './constants';
import { AppModel } from './models/app.model';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = Constants.APP_TITLE;
    toolItems = Constants.TOOL_ITEMS;
    canvasItems = Constants.CANVAS_ITEMS;

    // layoutDefinition
    layout = [
        {
            'name': 'canvas',
            'columns':12,
            'rows': 11
        }, {
            'name': 'panel',
            'columns': 12,
            'rows': 1
        }
    ]

    constructor (iconRegistry: MatIconRegistry,
        sanitizer: DomSanitizer,
        private appModel: AppModel) {

        iconRegistry.addSvgIcon(Constants.ID_LINE, sanitizer.bypassSecurityTrustResourceUrl('/assets/line.svg'));
        iconRegistry.addSvgIcon(Constants.ID_RECTANGLE, sanitizer.bypassSecurityTrustResourceUrl('/assets/rectangle.svg'));
        iconRegistry.addSvgIcon(Constants.ID_PEN, sanitizer.bypassSecurityTrustResourceUrl('/assets/pen.svg'));
        iconRegistry.addSvgIcon(Constants.ID_GRID, sanitizer.bypassSecurityTrustResourceUrl('/assets/grid.svg'));
        iconRegistry.addSvgIcon(Constants.ID_PLUS, sanitizer.bypassSecurityTrustResourceUrl('/assets/plus.svg'));
        iconRegistry.addSvgIcon(Constants.ID_MINUS, sanitizer.bypassSecurityTrustResourceUrl('/assets/minus.svg'));
        iconRegistry.addSvgIcon(Constants.ID_SAVE, sanitizer.bypassSecurityTrustResourceUrl('/assets/grid.svg'));
        iconRegistry.addSvgIcon(Constants.ID_MOVE, sanitizer.bypassSecurityTrustResourceUrl('/assets/grid.svg'));
    }

    ngOnInit() {
    }

    /*@HostListener('window:resize', ['$event'])
    OnResize(event) {
        this.appModel.size = {
            'x': event.target.innerWidth,
            'y': event.target.innerWidth
        }
    }*/
}
