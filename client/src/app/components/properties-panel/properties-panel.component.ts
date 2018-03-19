import { Component, OnInit, ComponentFactoryResolver, ViewContainerRef, ViewChild, ElementRef } from '@angular/core';

import { PropertiesRectangleComponent } from '../properties-rectangle/properties-rectangle.component';


@Component({
    selector: 'div[app-properties-panel]',
    templateUrl: './properties-panel.component.html',
    styleUrls: ['./properties-panel.component.scss']
})
export class PropertiesPanelComponent implements OnInit {
    @ViewChild('view', { read: ViewContainerRef })
    view: ViewContainerRef;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {
    }

    ngOnInit() {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(PropertiesRectangleComponent);

        //clear all content and load new
        this.view.element.nativeElement.innerHTML = '';
        this.view.createComponent(componentFactory);
        //(<AdComponent>componentRef.instance).data = adItem.data; //bind data to component
    }
}
