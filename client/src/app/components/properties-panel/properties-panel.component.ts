import { Component, OnInit, ComponentFactoryResolver, ViewContainerRef, ViewChild, ElementRef } from '@angular/core';

import { PropertiesRectangleComponent } from '../properties-rectangle/properties-rectangle.component';
import { PropertiesIdleComponent } from '../properties-idle/properties-idle.component';
import { MessageService } from '../../services/message.service';
import { Constants } from '../../constants';
import { AppModel } from '../../models/app.model';

@Component({
    selector: 'div[app-properties-panel]',
    templateUrl: './properties-panel.component.html',
    styleUrls: ['./properties-panel.component.scss']
})
export class PropertiesPanelComponent implements OnInit {
    @ViewChild('view', { read: ViewContainerRef })
    view: ViewContainerRef;

    constructor(private appModel: AppModel, private messageService: MessageService, private componentFactoryResolver: ComponentFactoryResolver) {
    }

    ngOnInit() {
        console.log(this.appModel);
        this.messageService.subscribe(Constants.EVENT_MODEL_CHANGED, (message) => {
            switch (message.data.name) {
                case Constants.EVENT_SELECTED_PRIMITIVE:
                    console.log(Constants.EVENT_SELECTED_PRIMITIVE);
                    return this.drawWindow();
            }
        });
        this.drawWindow();
    }

    drawWindow() {
        if (this.appModel.selectedPrimitive && this.appModel.selectedPrimitive.type == Constants.ID_RECTANGLE) {
            //clear all content and load new
            //this.view.element.nativeElement.innerHTML = '';
            this.view.clear();
            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(PropertiesRectangleComponent);
            this.view.createComponent(componentFactory);
        } else {
            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(PropertiesIdleComponent);
            //clear all content and load new
            //this.view.element.nativeElement.innerHTML = '';
            this.view.clear();
            this.view.createComponent(componentFactory);
            //(<AdComponent>componentRef.instance).data = adItem.data; //bind data to component
        }
    }
}
