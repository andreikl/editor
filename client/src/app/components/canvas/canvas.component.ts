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
        this.messageService.subscribe(Constants.EVENT_MODEL_CHANGED, this.onModelChanged.bind(this));

        const addPrimitive = (data) => {
            if (data.type != Constants.ID_MOVE) {
                this.appModel.data.push(data);
            }
        }

        // convert point to normalised coordinate space
        const normalise = (value: number, offset: number, isGrid?: Boolean): number => {
            const nv = value / this.appModel.zoom - offset;
            return isGrid? this.GRID_SIZE * Math.round(nv / this.GRID_SIZE): nv;
        }

        const pointInitiator = (start: Point, rect): DrawData => {
            if ((this.item.id == Constants.ID_MOVE)) {
                const x = start.x - rect.left;
                const y = start.y - rect.top;
                return {
                    'type': this.item.id,
                    'x1': x,
                    'y1': y,
                    'x2': x,
                    'y2': y,
                    'points': [],
                    isActive: false
                }
            } else {
                const x = normalise(start.x - rect.left, this.appModel.offset.x, true);
                const y = normalise(start.y - rect.top, this.appModel.offset.y, true);
                //remove all acive items
                this.appModel.data.forEach(o => o.isActive = false);
                return {
                    'type': this.item.id,
                    'x1': x,
                    'y1': y,
                    'x2': x,
                    'y2': y,
                    'points': [],
                    isActive: true
                }
                    
            }
        }

        const pointAccumulator = (x: DrawData, y: Point): DrawData => {
            if ((this.item.id == Constants.ID_MOVE)) {
                this.appModel.offset = {
                    x: this.appModel.offset.x + (y.x - x.x2) / this.appModel.zoom,
                    y: this.appModel.offset.y + (y.y - x.y2) / this.appModel.zoom
                }
                console.log('x: ' + (y.x - x.x2) + ' ' + y.x + ' ' + x.x2 + 'y: ' + (y.y - x.y2));
                console.log(this.appModel.offset);
                x.x2 = y.x;
                x.y2 = y.y;
                this.drawScene(null);
            } else {
                x.x2 = y.x = normalise(y.x, this.appModel.offset.x, true);
                x.y2 = y.y = normalise(y.y, this.appModel.offset.y, true);

                const lastIndex = x.points.length - 1;
                if (lastIndex >= 0 && (x.points[lastIndex].x != y.x || x.points[lastIndex].y != y.y)) {
                    x.points.push(y);
                } else if (x.points.length == 0) {
                    x.points.push(y);
                }
                this.drawScene(x);
            }
            return x;
        }
    
        Observable.fromEvent(canvas, 'mousedown').subscribe(
            (startEvent: MouseEvent) => {
                startEvent.preventDefault();
                startEvent.stopPropagation();
                const rect = canvas.getBoundingClientRect();
                Observable.fromEvent(document, 'mousemove')
                    .map((event: MouseEvent)  => <Point> {
                        'x': (event.pageX - rect.left),
                        'y': event.pageY - rect.top
                    })
                    .takeUntil(Observable.fromEvent(document, 'mouseup'))
                    .reduce(pointAccumulator, pointInitiator({
                        'x': startEvent.pageX,
                        'y': startEvent.pageY
                    }, rect))
                    .subscribe(
                        data => addPrimitive(data),
                        e => console.log("moveEvent error", e)
                    );
            },
            e => console.log("mousedownEvent error", e)
        );

        Observable.fromEvent(canvas, 'touchstart').subscribe(
            (startEvent: TouchEvent) => {
                startEvent.preventDefault();
                startEvent.stopPropagation();
                const rect = canvas.getBoundingClientRect();
                Observable.fromEvent(document, 'touchmove')
                    .map((event: TouchEvent)  =>  <Point> {
                        'x': event.touches[0].pageX - rect.left,
                        'y': event.touches[0].pageY - rect.top
                    })
                    .takeUntil(Observable.fromEvent(document, 'touchend'))
                    .reduce(pointAccumulator, pointInitiator({
                        'x': startEvent.touches[0].pageX,
                        'y': startEvent.touches[0].pageY
                    }, rect))
                    .subscribe(
                        data => addPrimitive(data),
                        e => console.log("moveEvent error", e)
                    );
            },
            e => console.log("touchstartEvent error", e)
        );

        Observable.fromEvent(canvas, 'wheel').subscribe(
            (wheelEvent: WheelEvent) => {
                wheelEvent.preventDefault();
                wheelEvent.stopPropagation();
                this.appModel.zoom += wheelEvent.wheelDelta > 0? Constants.ZOOM_DELATA: -Constants.ZOOM_DELATA;
            },
            e => console.log("wheelEvent error", e)
        );
    }

    configureCanvas(canvas) {
        const styles = getComputedStyle(this.canvas.nativeElement);
        canvas.width = (styles.width)? parseInt(styles.width.replace(/[^\d^\.]*/g, '')): 0;
        canvas.height = (styles.height)? parseInt(styles.height.replace(/[^\d^\.]*/g, '')): 0;
        this.drawScene(null);
    }

    resizeMessage(message: Message) {
        const canvas = this.canvas.nativeElement;
        this.configureCanvas(canvas);
    }

    changeItem(message: Message) {
        this.item = message.data;
    }

    onModelChanged(message: Message) {
        switch (message.data.name) {
            case Constants.EVENT_ZOOM:
                this.drawScene(null);
        }
    }

    drawScene(data: DrawData | null) {
        const canvas = this.canvas.nativeElement;
        const context = canvas.getContext("2d");

        context.clearRect(0, 0, canvas.width, canvas.height);

        this.drawGrid(canvas, context);

        this.appModel.data.forEach(o => {
            this.drawPrimitive(o, context);
        })

        if (data) {
            this.drawPrimitive(data, context);
        }
    }

    drawGrid(canvas, context) {
        const constOffsetDelta = {
            x: this.appModel.offset.x % this.GRID_SIZE * this.appModel.zoom,
            y: this.appModel.offset.y % this.GRID_SIZE * this.appModel.zoom,
        };
        context.beginPath();
        for (let y = constOffsetDelta.y; y < canvas.height; y += this.GRID_SIZE * this.appModel.zoom) {
            context.setLineDash([1, this.GRID_SIZE * this.appModel.zoom - 1]);
            context.moveTo(constOffsetDelta.x, y);
            context.lineTo(canvas.width, y);
        }
        context.stroke();
        context.setLineDash([]);
    }

    drawLine(x1, y1, x2, y2, data, context) {
        if (data.isActive) {
            context.beginPath();
            context.arc(x1, y1, 4, 0, 2 * Math.PI);
            context.stroke();
            context.beginPath();
            context.arc(x2, y2, 4, 0, 2 * Math.PI);
            context.stroke();
        }
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
    }

    drawRect(x1, y1, x2, y2, data, context) {
        if (data.isActive) {
            context.beginPath();
            context.arc(x1, y1, 4, 0, 2 * Math.PI);
            context.stroke();
            context.beginPath();
            context.arc(x2, y2, 4, 0, 2 * Math.PI);
            context.stroke();
        }
        context.beginPath();
        context.rect(x1, y1, x2 - x1, y2 - y1);
        context.stroke();
    }

    drawPen(x1, y1, x2, y2, data, context) {
        if (data.isActive) {
            context.beginPath();
            context.arc(x1, y1, 4, 0, 2 * Math.PI);
            context.stroke();
            data.points.forEach((o, index) => {
                const x = this.appModel.zoom * (this.appModel.offset.x + o.x);
                const y = this.appModel.zoom * (this.appModel.offset.y + o.y);
                context.beginPath();
                context.arc(x, y, 4, 0, 2 * Math.PI);
                context.stroke();
            });
        } 
        context.beginPath();
        context.moveTo(x1, y1);
        data.points.forEach((o, index) => {
            const x = this.appModel.zoom * (this.appModel.offset.x + o.x);
            const y = this.appModel.zoom * (this.appModel.offset.y + o.y);
            context.lineTo(x, y);
            context.moveTo(x, y);
        });
        context.stroke();
    }

    drawPrimitive(data: DrawData, context) {
        const x1 = this.appModel.zoom * (this.appModel.offset.x + data.x1);
        const y1 = this.appModel.zoom * (this.appModel.offset.y + data.y1);
        const x2 = this.appModel.zoom * (this.appModel.offset.x + data.x2);
        const y2 = this.appModel.zoom * (this.appModel.offset.y + data.y2);

        switch(data.type) {
            case Constants.ID_LINE:
                return this.drawLine(x1, y1, x2, y2, data, context);

            case Constants.ID_RECTANGLE:
                return this.drawRect(x1, y1, x2, y2, data, context);

            case Constants.ID_PEN:
                return this.drawPen(x1, y1, x2, y2, data, context);
        }
    }
}
