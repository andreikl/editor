import { Component, OnInit } from '@angular/core';

import { MessageService } from '../../services/message.service';
import { AppModel } from '../../models/app.model';

@Component({
    selector: 'app-properties-arc',
    templateUrl: './properties-arc.component.html',
    styleUrls: ['./properties-arc.component.scss']
})
export class PropertiesArcComponent implements OnInit {
    constructor(private appModel: AppModel, private messageService: MessageService) { }

    primitive: PrimitiveArc;

    ngOnInit() {
        if (this.appModel.selectedPrimitive) {
            this.primitive = <PrimitiveArc>this.appModel.selectedPrimitive;
        }
    }

    update() {
        if (this.appModel.selectedPrimitive) { 
            this.appModel.selectedPrimitive = this.appModel.selectedPrimitive;
        }
    }
}
