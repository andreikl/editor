import { Component, OnInit, ComponentFactoryResolver, ViewContainerRef, ViewChild, ElementRef } from '@angular/core';

import { PropertiesRectangleComponent } from '../properties-rectangle/properties-rectangle.component';
import { PropertiesIdleComponent } from '../properties-idle/properties-idle.component';
import { PropertiesArcComponent } from '../properties-arc/properties-arc.component';
import { MessageService } from '../../services/message.service';
import { HistoryService } from '../../services/history.service';
import { ControlItem } from '../../models/control-item.model';
import { SvgService } from '../../services/svg.service';
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
    pageItems = Constants.PAGE_ITEMS;

    constructor(private appModel: AppModel,
        private historyService: HistoryService,
        private svgService: SvgService,
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

    clickHandler($event: Event, item: ControlItem) {
        switch (item.id) {
            case Constants.ID_PLUS:
                return this.appModel.zoom = this.appModel.zoom + Constants.DEFAULT_ZOOM_DELATA;

            case Constants.ID_MINUS:
                return this.appModel.zoom = this.appModel.zoom - Constants.DEFAULT_ZOOM_DELATA;

            case Constants.ID_GRID:
                return this.appModel.grid = isNaN(this.appModel.grid)? Constants.DEFAULT_GRID: NaN;

            case Constants.ID_SAVE:
                return this.svgService.save();

            case Constants.ID_BACK:
                return this.historyService.back();

            case Constants.ID_NEXT:
                return this.historyService.next();

            case Constants.ID_MOVE:
                return this.appModel.selectedTool = item.id;
        };
    }

    drawWindow() {
        if (this.appModel.selectedPrimitive && (this.appModel.selectedPrimitive.type == Constants.ID_RECTANGLE
            || this.appModel.selectedPrimitive.type == Constants.ID_LINE
            || this.appModel.selectedPrimitive.type == Constants.ID_PEN)) {
            //clear all content and load new
            this.view.clear();

            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(PropertiesRectangleComponent);
            this.view.createComponent(componentFactory);

            if (this.appModel.selectedPrimitive.type == Constants.ID_RECTANGLE) {
                this.title = 'Rectangle properies';
            } else if (this.appModel.selectedPrimitive.type == Constants.ID_LINE) {
                this.title = 'Line properies';
            } else if (this.appModel.selectedPrimitive.type == Constants.ID_PEN) {
                this.title = 'Pen properies';
            }
        } else if (this.appModel.selectedPrimitive && this.appModel.selectedPrimitive.type == Constants.ID_ARC) {
            this.view.clear();

            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(PropertiesArcComponent);
            this.view.createComponent(componentFactory);

            this.title = 'Arc properies';
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
