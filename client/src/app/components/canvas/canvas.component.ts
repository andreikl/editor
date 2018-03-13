import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { MessageService } from './../../services/message.service';

import { ControlItem } from './../../models/control-item.model';
import { Message } from './../../models/message.model';
import { Constants } from './../../constants';

import { DrawData } from '../../models/draw-data.interface';
import { Point } from '../../models/point.interface';
import { AppModel } from './../../models/app.model';

@Component({
    selector: 'app-canvas',
    templateUrl: './canvas.component.html',
    styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {
    GRID_SIZE: number = 5;
    scale: number = 1;

    @ViewChild('canvas') 
    canvas: ElementRef;

    item: ControlItem = <ControlItem>{ id: "rectangle", name: "Rectangle", isActive: false };

    constructor(private messageService: MessageService, private appModel: AppModel) { }

    ngOnInit() {
        const canvas = this.canvas.nativeElement;
        this.configureCanvas(canvas);

        this.messageService.subscribe("size", this.resizeMessage.bind(this));
        this.messageService.subscribe("control-item", this.changeItem.bind(this));
        this.messageService.subscribe(Constants.EVENT_MODEL_CHANGED, this.onModelChanging.bind(this));


        const mouseEvents$ = Observable.fromEvent(canvas, 'mousedown').subscribe(
            (startEvent: MouseEvent) => {
                const rect = canvas.getBoundingClientRect();
                Observable.fromEvent(document, 'mousemove')
                    .map((event: MouseEvent)  => <Point> {
                        'x': event.pageX - rect.left,
                        'y': event.pageY - rect.top
                    })
                    .takeUntil(Observable.fromEvent(document, 'mouseup'))
                    .reduce(this.pointAccumulator.bind(this), <DrawData> {
                        'type': this.item.id,
                        'x1': startEvent.pageX - rect.left,
                        'y1': startEvent.pageY - rect.top,
                        'x2': startEvent.pageX - rect.left,
                        'y2': startEvent.pageY - rect.top,
                        'points': []
                    })
                    .subscribe(
                        data => {
                            this.appModel.data.push(data);
                        },
                        e => console.log("moveEvent error", e)
                    );
            },
            e => console.log("mousedownEvent error", e)
        );

        const touchEvents$ = Observable.fromEvent(canvas, 'touchstart').subscribe(
            (startEvent: TouchEvent) => {
                const rect = canvas.getBoundingClientRect();
                Observable.fromEvent(document, 'touchmove')
                .map((event: TouchEvent)  =>  <Point> {
                    'x': event.touches[0].pageX - rect.left,
                    'y': event.touches[0].pageY - rect.top
                })
                .takeUntil(Observable.fromEvent(document, 'touchend'))
                .reduce(this.pointAccumulator.bind(this), <DrawData> {
                    'type': this.item.id,
                    'x1': startEvent.touches[0].pageX - rect.left,
                    'y1': startEvent.touches[0].pageY - rect.top,
                    'x2': startEvent.touches[0].pageX - rect.left,
                    'y2': startEvent.touches[0].pageY - rect.top,
                    'points': []
                })
                .subscribe(
                    data => {
                        this.appModel.data.push(data);
                    },
                    e => console.log("moveEvent error", e)
                );
              },
              e => console.log("touchstartEvent error", e)
          );
    }

    pointAccumulator(x: DrawData, y: Point): DrawData {
        x.x2 = y.x;
        x.y2 = y.y;
        x.points.push(y);
        this.drawScene(x, this.appModel.zoom);
        return x;
    }

    configureCanvas(canvas) {
        const styles = getComputedStyle(this.canvas.nativeElement);
        canvas.width = (styles.width)? parseInt(styles.width.replace(/[^\d^\.]*/g, '')): 0;
        canvas.height = (styles.height)? parseInt(styles.height.replace(/[^\d^\.]*/g, '')): 0;
        this.drawScene(null, this.appModel.zoom);
    }

    resizeMessage(message: Message) {
        const canvas = this.canvas.nativeElement;
        this.configureCanvas(canvas);
    }

    changeItem(message: Message) {
        this.item = message.data;
        console.log("item changed: ", message.data);
    }

    onModelChanging(message: Message) {
        switch (message.data.name) {
            case Constants.EVENT_ZOOM:
                this.drawScene(null, this.appModel.zoom);
        }
    }

    drawScene(data: any, zoom: number) {
      const canvas = this.canvas.nativeElement;
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);

      this.drawGrid(canvas, context, zoom);

      if (this.item) {
          this.appModel.data.forEach(o => {
              this.drawPrimitive(o, context, zoom);
          })

          this.drawPrimitive(data, context, zoom);
      }
    }

    drawGrid(canvas, context, zoom: number) {
        context.beginPath();
        for (let y = 0.0; y < canvas.height; y += this.GRID_SIZE * zoom) {
            context.setLineDash([1, this.GRID_SIZE * zoom]);
            context.moveTo(0, y);
            context.lineTo(canvas.width, y);
        }
        context.stroke();
    }

    drawPrimitive(data: DrawData, context, zoom) {
        context.setLineDash([]);

        if (data == null) {
            return;
        }

        const x1 = Math.round(data.x1 / this.GRID_SIZE) * this.GRID_SIZE * zoom;
        const y1 = Math.round(data.y1 / this.GRID_SIZE) * this.GRID_SIZE * zoom;
        const x2 = Math.round(data.x2 / this.GRID_SIZE) * this.GRID_SIZE * zoom;
        const y2 = Math.round(data.y2 / this.GRID_SIZE) * this.GRID_SIZE * zoom;

        switch(data.type) {
            case "line":
                context.beginPath();
                context.moveTo(x1, y1);
                context.lineTo(x2, y2);
                context.stroke();
                break;

            case "rectangle":
                context.beginPath();
                context.rect(x1, y1, x2 - x1, y2 - y1);
                context.stroke();
                break;

            case "pen":
                context.beginPath();
                context.moveTo(data.x1 * zoom, data.y1 * zoom);
                data.points.forEach(o => {
                    context.lineTo(o.x, o.y);
                    context.moveTo(o.x, o.y);
                });
                context.stroke();
        }
    }
}
