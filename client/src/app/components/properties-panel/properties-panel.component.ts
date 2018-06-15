import { Component, OnInit, ComponentFactoryResolver, ViewContainerRef, ViewChild, ElementRef } from '@angular/core';

import { PropertiesRectangleComponent } from '../properties-rectangle/properties-rectangle.component';
import { PropertiesSizeComponent } from '../properties-size/properties-size.component';
import { PropertiesIdleComponent } from '../properties-idle/properties-idle.component';
import { PropertiesArcComponent } from '../properties-arc/properties-arc.component';
import { MessageService } from '../../services/message.service';
import { AppModel } from '../../models/app.model';
import { Constants } from '../../constants';


@Component({
    selector: 'div[app-properties-panel]',
    templateUrl: './properties-panel.component.html',
    styleUrls: ['./properties-panel.component.scss']
})
export class PropertiesPanelComponent implements OnInit {
    @ViewChild('view', { read: ViewContainerRef })
    view: ViewContainerRef;

    title: string;

    constructor(private appModel: AppModel,
        private messageService: MessageService,
        private componentFactoryResolver: ComponentFactoryResolver) {
    }

    ngOnInit() {
        this.messageService.subscribe(Constants.EVENT_MODEL_CHANGED, (message) => {
            switch (message.data.name) {
                case Constants.EVENT_SELECTED_PRIMITIVE:
                    return this.drawWindow();
            }
        });
        this.drawWindow();
    }

    drawWindow() {
        if (this.appModel.selectedPrimitive && (this.appModel.selectedPrimitive.type == Constants.TYPE_RECTANGLE
            || this.appModel.selectedPrimitive.type == Constants.TYPE_LINE)) {
            //clear all content and load new
            this.view.clear();

            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(PropertiesRectangleComponent);
            this.view.createComponent(componentFactory);

            if (this.appModel.selectedPrimitive.type == Constants.TYPE_RECTANGLE) {
                this.title = 'Rectangle properies';
            } else if (this.appModel.selectedPrimitive.type == Constants.TYPE_LINE) {
                this.title = 'Line properies';
            }
        } else if (this.appModel.selectedPrimitive && this.appModel.selectedPrimitive.type == Constants.TYPE_ARC) {
            this.view.clear();

            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(PropertiesArcComponent);
            this.view.createComponent(componentFactory);

            this.title = 'Arc properies';
        } else if (this.appModel.selectedPrimitive && this.appModel.selectedPrimitive.type == Constants.TYPE_SIZE) {
            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(PropertiesSizeComponent);

            this.view.clear();
            this.view.createComponent(componentFactory);

            this.title = 'Size properies';
        } else {
            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(PropertiesIdleComponent);
            //clear all content and load new
            this.view.clear();
            this.view.createComponent(componentFactory);
            //(<AdComponent>componentRef.instance).data = adItem.data; //bind data to component

            this.title = 'No item is selected';
        }
    }
}
