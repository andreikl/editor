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

import { ControlItem } from './../../models/control-item.model';
import { Message } from './../../models/message.model';
import { Constants } from './../../constants';

import { MessageService } from './../../services/message.service';
import { HistoryService } from '../../services/history.service';
import { UtilsService } from '../../services/utils.service';
import { DrawService } from '../../services/draw.service';
import { AppModel } from './../../models/app.model';

@Component({
    selector: 'div[app-canvas]',
    templateUrl: './canvas.component.html',
    styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {
    @ViewChild('canvas')
    canvas: ElementRef;

    // edit state
    draggablePoint?: PrimitivePoint;

    constructor(private appModel: AppModel,
        private messageService: MessageService,
        private drawService: DrawService,
        private utilsService: UtilsService,
        private historyService: HistoryService) {
    }

    ngOnInit() {
        const canvas = this.canvas.nativeElement;

        // edit state
        let draggablePoint;

        this.messageService.subscribe(Constants.EVENT_MODEL_CHANGED, (message) => {
            switch (message.data.name) {
                case Constants.EVENT_HISTORY:
                    return this.drawScene(null);

                case Constants.EVENT_ZOOM:
                    return this.drawScene(null);

                case Constants.EVENT_GRID:
                    return this.drawScene(null);

                case Constants.EVENT_SELECTED_PRIMITIVE:
                    return this.drawScene(null);

                case Constants.EVENT_SIZE:
                    return this.resizeCanvas();
            }
        });

        const pointInitiator = (start: Point): Primitive => {
            if (this.draggablePoint) { // editing primitive state
                draggablePoint = this.draggablePoint;
                return draggablePoint;
            } else if (this.appModel.selectedTool == Constants.ID_MOVE) { // moving page state
                return {
                    'id': Date.now().toString(),
                    'type': this.appModel.selectedTool,
                    'start': { 'x': start.x, 'y': start.y },
                    'end': { 'x': start.x, 'y': start.y }
                }
            } else { // creating primitive state
                const point = this.utilsService.toNormal({
                    'x': start.x,
                    'y': start.y
                //}, !isNaN(this.appModel.grid));
                }, false);
                if (this.appModel.selectedTool == Constants.ID_ARC) {
                    this.appModel.selectedPrimitive = <Primitive> {
                        'id': Date.now().toString(),
                        'type': this.appModel.selectedTool,
                        'start': point,
                        'end': { 'x': point.x, 'y': point.y },
                        'startAngle': 0,
                        'endAngle': 2 * Math.PI
                    }
                } if (this.appModel.selectedTool == Constants.ID_PEN) {
                    this.appModel.selectedPrimitive = <Primitive> {
                        'id': Date.now().toString(),
                        'type': this.appModel.selectedTool,
                        'start': point,
                        'end': { 'x': point.x, 'y': point.y },
                        'points': []
                    }
                } else {
                    this.appModel.selectedPrimitive = {
                        'id': Date.now().toString(),
                        'type': this.appModel.selectedTool,
                        'start': point,
                        'end': { 'x': point.x, 'y': point.y }
                    }
                }
                return this.appModel.selectedPrimitive;
            }
        }

        const pointAccumulator = (x: Primitive, y: Point): Primitive => {
            //const point = this.utilsService.toNormal(y, !isNaN(this.appModel.grid));
            const point = this.utilsService.toNormal(y, false);
            if (draggablePoint) { // editing primitive state
                if (draggablePoint.direction == PointType.StartPoint) { // keep proportion
                    const oldx = draggablePoint.point.x;
                    const oldy = draggablePoint.point.y;
                    draggablePoint.point.x = !isNaN(this.appModel.grid)? this.appModel.grid * Math.round(point.x / this.appModel.grid): point.x;
                    draggablePoint.point.y = !isNaN(this.appModel.grid)? this.appModel.grid * Math.round(point.y / this.appModel.grid): point.y;
                    const deltax = draggablePoint.point.x - oldx;
                    const deltay = draggablePoint.point.y - oldy;
                    draggablePoint.primitive.end.x += deltax;
                    draggablePoint.primitive.end.y += deltay;
                    draggablePoint.primitive.points.forEach(o => {
                        o.x += deltax;
                        o.y += deltay;
                    });
                } else {
                    draggablePoint.point.x = !isNaN(this.appModel.grid)? this.appModel.grid * Math.round(point.x / this.appModel.grid): point.x;
                    draggablePoint.point.y = !isNaN(this.appModel.grid)? this.appModel.grid * Math.round(point.y / this.appModel.grid): point.y;
                }
                this.drawScene(null);
            } else if (this.appModel.selectedTool == Constants.ID_MOVE) { // moving page state
                this.appModel.offset = {
                    x: this.appModel.offset.x + (y.x - x.end.x) / this.appModel.zoom,
                    y: this.appModel.offset.y + (y.y - x.end.y) / this.appModel.zoom
                }
                x.end.x = y.x;
                x.end.y = y.y;
                this.drawScene(null);
            } else { // creating primitive state
                x.end.x = y.x = point.x;
                x.end.y = y.y = point.y;
                if (this.appModel.selectedTool == Constants.ID_PEN) {
                    const pen = <PrimitivePen>x;
                    const lastIndex = pen.points.length - 1;
                    if (lastIndex >= 0 && (pen.points[lastIndex].x != y.x || pen.points[lastIndex].y != y.y)) {
                        pen.points.push(y);
                    } else if (pen.points.length == 0) {
                        pen.points.push(y);
                    }
                }
                this.drawScene(x);
            }
            return x;
        }

        const addPrimitive = (data: Primitive) => {
            if (draggablePoint) {
                draggablePoint = undefined;
                this.historyService.snapshoot();
            } else if (data.type == Constants.ID_LINE ||
                data.type == Constants.ID_RECTANGLE ||
                data.type == Constants.ID_PEN ||
                data.type == Constants.ID_ARC) {

                data.start.x = !isNaN(this.appModel.grid)? this.appModel.grid * Math.round(data.start.x / this.appModel.grid): data.start.x;
                data.start.y = !isNaN(this.appModel.grid)? this.appModel.grid * Math.round(data.start.y / this.appModel.grid): data.start.y;
                data.end.x = !isNaN(this.appModel.grid)? this.appModel.grid * Math.round(data.end.x / this.appModel.grid): data.end.x;
                data.end.y = !isNaN(this.appModel.grid)? this.appModel.grid * Math.round(data.end.y / this.appModel.grid): data.end.y;
    
                this.appModel.data.push(data);
                this.historyService.snapshoot();
            }
        }

        const isSelectionOrMoving = (start, end) => {
            if (Math.abs(end.x - start.x) <= Constants.MINIMAL_SIZE && Math.abs(end.y - start.y) <= Constants.MINIMAL_SIZE)
                return true;
            else 
                return false;
        }

        // handle moving to add, edit primitive and etc, it isn't click--------
        let movingSubscription; // true if moving event need to be subscribed
        let startPoint; // undefined if right mousedown event need to be stored
        Observable.fromEvent(canvas, 'mousemove')
            .map((event: MouseEvent) => { // returns screen point and starts moving if delta reached
                const sp = this.utilsService.getScreenPoint(canvas.getBoundingClientRect(), event.pageX, event.pageY);
                if (event.buttons != 1) {
                    startPoint = undefined;
                }
                if (event.buttons == 1 && !startPoint)
                    startPoint = sp;
                if (!movingSubscription && event.buttons == 1 && startPoint && !isSelectionOrMoving(startPoint, sp)) {
                    movingSubscription = Observable.fromEvent(document, 'mousemove')
                        .map((event: MouseEvent)  => this.utilsService.getScreenPoint(canvas.getBoundingClientRect(), event.pageX, event.pageY))
                        .takeUntil(Observable.fromEvent(document, 'mouseup'))
                        .reduce(pointAccumulator, pointInitiator(startPoint))
                        .subscribe(
                            data => {
                                movingSubscription.unsubscribe();
                                movingSubscription = undefined;
                                startPoint = undefined;
                                return addPrimitive(data)
                            },
                            e => console.log("moveEvent error", e)
                        );
                }
                return sp;
            }).map((sp: Point) => { // get draggable point
                if (this.appModel.selectedPrimitive)
                    return this.utilsService.getPrimitivePoint(this.appModel.selectedPrimitive, sp);
                else 
                    return undefined;
            }).subscribe( // shows right cursor
                o => {
                    const cursor = this.canvas.nativeElement.style.cursor;
                    if (o == undefined) {
                        if (cursor != 'auto') {
                            this.canvas.nativeElement.style.cursor = 'auto';
                        }
                        this.draggablePoint = undefined;
                    } else {
                        if (cursor != 'move') {
                            this.canvas.nativeElement.style.cursor = 'move';
                        }
                        this.draggablePoint = o;
                    }
                },
                e => console.log("moveEvent error", e)
            );

        Observable.fromEvent(canvas, 'touchmove')
            .map((event: TouchEvent) => { // returns screen point and starts moving if delta reached
                const sp = this.utilsService.getScreenPoint(canvas.getBoundingClientRect(), event.touches[0].pageX, event.touches[0].pageY);
                if (!startPoint)
                    startPoint = sp;
                if (!movingSubscription && startPoint && !isSelectionOrMoving(startPoint, sp)) {
                    movingSubscription = Observable.fromEvent(document, 'touchmove')
                        .map((event: TouchEvent)  => this.utilsService.getScreenPoint(canvas.getBoundingClientRect(), event.touches[0].pageX, event.touches[0].pageY))
                        .takeUntil(Observable.fromEvent(document, 'touchend'))
                        .reduce(pointAccumulator, pointInitiator(startPoint))
                        .subscribe(
                            data => {
                                movingSubscription.unsubscribe();
                                movingSubscription = undefined;
                                startPoint = undefined;
                                return addPrimitive(data)
                            },
                            e => console.log("touchmoveEvent error", e)
                        );
                }
                return sp;
            })
            .map((sp: Point) => { // get draggable point
                if (this.appModel.selectedPrimitive)
                    return this.utilsService.getPrimitivePoint(this.appModel.selectedPrimitive, sp);
                else 
                    return undefined;
            })
            .subscribe(
                o => this.draggablePoint = o,
                e => console.log("wheelEvent error", e)
            );
        // ---------------------------

        // handle clicks to select primitive, it isn't moving--------
        let firstPrimitive;
        const selectionFinished = (start: Point, end: Point) => {
            if (isSelectionOrMoving(start, end)) {
                this.selectPrimitive(this.utilsService.toNormal({
                    'x': start.x + (end.x - start.x) / 2,
                    'y': start.y + (end.y - start.y) / 2,
                }));
                if (this.appModel.selectedTool == Constants.ID_SIZE) {
                    if (!firstPrimitive) {
                        firstPrimitive = this.appModel.selectedPrimitive;
                    } else if (this.appModel.selectedPrimitive) {
                        this.appModel.selectedPrimitive = <Primitive> {
                            'id': Date.now().toString(),
                            'type': this.appModel.selectedTool,
                            'start': this.utilsService.clone(firstPrimitive.start, false),
                            'end': this.utilsService.clone(this.appModel.selectedPrimitive.end, false),
                            'references': [
                                firstPrimitive.id,
                                this.appModel.selectedPrimitive.id
                            ]
                        }
                        this.appModel.data.push(this.appModel.selectedPrimitive);
                        this.historyService.snapshoot();

                        firstPrimitive = undefined;
                    }
                } else {
                    firstPrimitive = undefined;
                }
            }
        };
        Observable.fromEvent(canvas, 'mousedown')
            .map((event: MouseEvent) => this.utilsService.getScreenPoint(canvas.getBoundingClientRect(), event.pageX, event.pageY))
            .subscribe((start: Point) => {
                let subscription = Observable.fromEvent(document, 'mouseup')
                    .map((event: MouseEvent)  => this.utilsService.getScreenPoint(canvas.getBoundingClientRect(), event.pageX, event.pageY))
                    .subscribe((end: Point) => {
                        subscription.unsubscribe();
                        selectionFinished(start, end);
                    }, e => console.log("mouseupEvent error", e));
            }, e => console.log("mousedownEvent error", e));
        Observable.fromEvent(canvas, 'touchstart')
            .map((e: TouchEvent) => this.utilsService.toNormal(this.utilsService.getScreenPoint(canvas.getBoundingClientRect(), e.touches[0].pageX, e.touches[0].pageY)))
            .subscribe((start: Point) => {
                let subscription = Observable.fromEvent(document, 'touchend')
                    .map((endEvent: TouchEvent) => this.utilsService.toNormal(this.utilsService.getScreenPoint(canvas.getBoundingClientRect(), endEvent.changedTouches[0].pageX, endEvent.changedTouches[0].pageY)))
                    .subscribe((end: Point) => {
                        subscription.unsubscribe();
                        selectionFinished(start, end);
                    }, e => console.log("touchstopEvent error", e));
            }, e => console.log("touchstartEvent error", e));
        // --------------------------

        // zoom ---------------------
        Observable.fromEvent(canvas, 'wheel').subscribe(
            (wheelEvent: WheelEvent) => {
                wheelEvent.preventDefault();
                wheelEvent.stopPropagation();
                this.appModel.zoom += wheelEvent.wheelDelta > 0? Constants.DEFAULT_ZOOM_DELATA: -Constants.DEFAULT_ZOOM_DELATA;
            },
            e => console.log("wheelEvent error", e)
        );
        // --------------------------
    }

    resizeCanvas() {
        let canvas = this.canvas.nativeElement;
        const styles = getComputedStyle(canvas);
        canvas.width = (styles.width)? parseInt(styles.width.replace(/[^\d^\.]*/g, '')): 0;
        canvas.height = (styles.height)? parseInt(styles.height.replace(/[^\d^\.]*/g, '')): 0;
        this.drawScene(null);

        //if (styles.width && styles.height) {
        //    console.log('resize: ' + parseInt(styles.width.replace(/[^\d^\.]*/g, '')) + ', ' + parseInt(styles.height.replace(/[^\d^\.]*/g, '')));
        //}
    }

    selectPrimitive(point: Point) {
        this.appModel.selectedPrimitive = this.appModel.data.find(o => {
            switch(o.type) {
                case Constants.ID_LINE:
                    return this.utilsService.testLine(o.start, o.end, point);

                case Constants.ID_ARC:
                    //const canvas = this.canvas.nativeElement;
                    //const context = canvas.getContext("2d");
                    return this.utilsService.testEllipse(o.start, o.end, point);

                case Constants.ID_RECTANGLE:
                    return this.utilsService.testLine(o.start, {
                        'x': o.start.x,
                        'y': o.end.y
                    }, point) || this.utilsService.testLine({
                        'x': o.start.x,
                        'y': o.end.y
                    }, o.end, point) || this.utilsService.testLine(o.end, {
                        'x': o.end.x,
                        'y': o.start.y
                    }, point) || this.utilsService.testLine({
                        'x': o.end.x,
                        'y': o.start.y
                    }, o.start, point);
    
                case Constants.ID_PEN:
                    const pen = <PrimitivePen>o;
                    return pen.points.reduce((x, y) => {
                        return {
                            'res': x.res || this.utilsService.testLine(x.point, y, point),
                            'point': y
                        }
                    }, {
                        'res': false,
                        'point': o.start
                    }).res;

                default:
                    return false;
            }
        });
    }

    drawScene(data: Primitive | null) {
        const canvas = this.canvas.nativeElement;
        const context = canvas.getContext("2d");

        context.clearRect(0, 0, canvas.width, canvas.height);

        this.drawService.drawZero(canvas, context);
        this.drawService.drawGrid(canvas, context);
        this.drawService.drawNet(canvas, context);
        this.appModel.data.forEach(o => {
            this.drawService.drawPrimitive(o, context);
        });

        if (data) {
            this.drawService.drawPrimitive(data, context, !isNaN(this.appModel.grid));
        }

        this.drawService.drawSelection(context, !isNaN(this.appModel.grid));
    }
}
