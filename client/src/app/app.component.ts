import { Component, OnInit, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';
import { LayoutModule} from '@angular/cdk/layout';

import { MessageService } from './services/message.service';
import { ControlItem } from './models/control-item.model';
import { UtilsService } from './services/utils.service';
import { AppModel } from './models/app.model';
import { Constants } from './constants';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    // default layout definition
    layout = 'horizontal';

    constructor (iconRegistry: MatIconRegistry,
        private messageService: MessageService,
        private utilsService: UtilsService,
        sanitizer: DomSanitizer,
        private appModel: AppModel) {

        iconRegistry.addSvgIcon(Constants.TYPE_LINE, sanitizer.bypassSecurityTrustResourceUrl('/assets/line.svg'));
        iconRegistry.addSvgIcon(Constants.TYPE_RECTANGLE, sanitizer.bypassSecurityTrustResourceUrl('/assets/rectangle.svg'));
        iconRegistry.addSvgIcon(Constants.TYPE_ARC, sanitizer.bypassSecurityTrustResourceUrl('/assets/arc.svg'));
        iconRegistry.addSvgIcon(Constants.TYPE_SIZE, sanitizer.bypassSecurityTrustResourceUrl('/assets/pen.svg'));
        iconRegistry.addSvgIcon(Constants.TYPE_GRID, sanitizer.bypassSecurityTrustResourceUrl('/assets/grid.svg'));
        iconRegistry.addSvgIcon(Constants.TYPE_PLUS, sanitizer.bypassSecurityTrustResourceUrl('/assets/plus.svg'));
        iconRegistry.addSvgIcon(Constants.TYPE_MINUS, sanitizer.bypassSecurityTrustResourceUrl('/assets/minus.svg'));
        iconRegistry.addSvgIcon(Constants.TYPE_SAVE, sanitizer.bypassSecurityTrustResourceUrl('/assets/save.svg'));
        iconRegistry.addSvgIcon(Constants.TYPE_LOAD, sanitizer.bypassSecurityTrustResourceUrl('/assets/load.svg'));
        iconRegistry.addSvgIcon(Constants.TYPE_MOVE, sanitizer.bypassSecurityTrustResourceUrl('/assets/move.svg'));
        iconRegistry.addSvgIcon(Constants.TYPE_BACK, sanitizer.bypassSecurityTrustResourceUrl('/assets/back.svg'));
        iconRegistry.addSvgIcon(Constants.TYPE_NEXT, sanitizer.bypassSecurityTrustResourceUrl('/assets/next.svg'));
    }

    ngOnInit() {
        window.addEventListener('DOMContentLoaded', () => {
            this.appModel.size = {
                'x': window.innerWidth,
                'y': window.innerHeight
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
