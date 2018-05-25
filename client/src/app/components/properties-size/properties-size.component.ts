import { Component, OnInit } from '@angular/core';

import { MessageService } from '../../services/message.service';
import { UtilsService } from '../../services/utils.service';
import { AppModel } from '../../models/app.model';

@Component({
    selector: 'app-properties-size',
    templateUrl: './properties-size.component.html',
    styleUrls: ['./properties-size.component.scss']
})
export class PropertiesSizeComponent implements OnInit {
    constructor(private appModel: AppModel, private messageService: MessageService, private utilsService: UtilsService) { }

    primitive: PrimitiveSize;

    ngOnInit() {
        if (this.appModel.selectedPrimitive) {
            this.primitive = <PrimitiveSize>this.appModel.selectedPrimitive;
        }
    }

    update() {
        if (this.appModel.selectedPrimitive) { 
            this.appModel.selectedPrimitive = this.appModel.selectedPrimitive;
        }
    }

    updateOrientation() {
        if (this.appModel.selectedPrimitive) { 
            this.utilsService.updateSizeOrientation(<PrimitiveSize>this.appModel.selectedPrimitive);
            this.appModel.selectedPrimitive = this.appModel.selectedPrimitive;
        }
    }
}
