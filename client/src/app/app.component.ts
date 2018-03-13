import { Component, OnInit, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';

import { MessageService } from './services/message.service';
import { ControlItem } from './models/control-item.model';
import { Constants } from './constants';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = Constants.APP_TITLE;
    toolItems = Constants.TOOL_ITEMS;
    canvasItems = Constants.CANVAS_ITEMS;

    constructor (iconRegistry: MatIconRegistry,
        sanitizer: DomSanitizer,
        private messageService: MessageService) {

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

    @HostListener('window:resize', ['$event'])
    OnResize(event) {
        this.messageService.send({
            name: "size",
            data: {
                width: event.target.innerWidth,
                height: event.target.innerHeight,
            }
        });
    }
}
