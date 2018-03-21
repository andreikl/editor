import { Component, OnInit } from '@angular/core';

import { MessageService } from '../../services/message.service';
import { AppModel } from '../../models/app.model';
import { Primitive } from '../../models/primitive.interface';

@Component({
    //selector: 'app-properties-rectangle',
    templateUrl: './properties-rectangle.component.html',
    styleUrls: ['./properties-rectangle.component.scss']
})
export class PropertiesRectangleComponent implements OnInit {
    constructor(private appModel: AppModel, private messageService: MessageService) { }

    primitive: Primitive;

    ngOnInit() {
        if (this.appModel.selectedPrimitive) {
            this.primitive = this.appModel.selectedPrimitive;
        }
    }

    update() {
        if (this.appModel.selectedPrimitive) { 
            console.log(this.appModel.selectedPrimitive);
            this.appModel.selectedPrimitive = this.appModel.selectedPrimitive;
        }
    }
}
