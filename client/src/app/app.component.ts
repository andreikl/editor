import { Component, OnInit, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';
import {LayoutModule} from '@angular/cdk/layout';

import { MessageService } from './services/message.service';
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

    // default layout definition
    layout = 'horizontal';

    constructor (iconRegistry: MatIconRegistry,
        private messageService: MessageService,
        sanitizer: DomSanitizer,
        private appModel: AppModel) {

        iconRegistry.addSvgIcon(Constants.ID_LINE, sanitizer.bypassSecurityTrustResourceUrl('/assets/line.svg'));
        iconRegistry.addSvgIcon(Constants.ID_RECTANGLE, sanitizer.bypassSecurityTrustResourceUrl('/assets/rectangle.svg'));
        iconRegistry.addSvgIcon(Constants.ID_PEN, sanitizer.bypassSecurityTrustResourceUrl('/assets/pen.svg'));
        iconRegistry.addSvgIcon(Constants.ID_GRID, sanitizer.bypassSecurityTrustResourceUrl('/assets/grid.svg'));
        iconRegistry.addSvgIcon(Constants.ID_PLUS, sanitizer.bypassSecurityTrustResourceUrl('/assets/plus.svg'));
        iconRegistry.addSvgIcon(Constants.ID_MINUS, sanitizer.bypassSecurityTrustResourceUrl('/assets/minus.svg'));
        iconRegistry.addSvgIcon(Constants.ID_SAVE, sanitizer.bypassSecurityTrustResourceUrl('/assets/save.svg'));
        iconRegistry.addSvgIcon(Constants.ID_MOVE, sanitizer.bypassSecurityTrustResourceUrl('/assets/move.svg'));
    }

    ngOnInit() {
        this.messageService.subscribe(Constants.EVENT_MODEL_CHANGED, (message) => {
            if (message.data.name == Constants.EVENT_SIZE) {
                if (this.appModel.size.x > this.appModel.size.y) {
                    console.log('horizontal', this.appModel.size);
                    this.layout = 'horizontal';
                } else {
                    console.log('vertical', this.appModel.size);
                    this.layout = 'vertical';
                }
            }
        });
    }

    @HostListener('window:resize', ['$event'])
    OnResize(event) {
        this.appModel.size = {
            'x': event.target.innerWidth,
            'y': event.target.innerWidth
        }
    }
}
