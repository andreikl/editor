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

import { Primitive } from '../../models/primitive.interface';
import { Point } from '../../models/point.interface';
import { AppModel } from './../../models/app.model';
import { UtilsService } from '../../services/utils.service';
import { DrawService } from '../../services/draw.service';
import { HistoryService } from '../../services/history.service';

enum PointType {
    StartPoint,
    MiddlePoint,
    EndPoint
};

interface DraggablePoint {
    direction: PointType;
    point: Point;
    primitive: Primitive;
};

@Component({
    selector: 'div[app-canvas]',
    templateUrl: './canvas.component.html',
    styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {
    @ViewChild('canvas')
    canvas: ElementRef;

    draggablePoint?: DraggablePoint;

    constructor(private appModel: AppModel,
        private messageService: MessageService,
        private drawService: DrawService,
        private utilsService: UtilsService,
        private historyService: HistoryService) {
    }

    ngOnInit() {
        const canvas = this.canvas.nativeElement;

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

        const pointInitiator = (start: Point, rect): Primitive => {
            if (this.draggablePoint) { // editing primitive state
                draggablePoint = this.draggablePoint;
                return draggablePoint;
            } else if (this.appModel.selectedTool == Constants.ID_MOVE) { // moving page state
                const x = start.x - rect.left;
                const y = start.y - rect.top;
                return {
                    'type': this.appModel.selectedTool,
                    'start': { 'x': x, 'y': y },
                    'end': { 'x': x, 'y': y },
                    'points': []
                }
            } else { // creating primitive state
                const point = this.utilsService.toNormal({
                    'x': start.x - rect.left,
                    'y': start.y - rect.top
                }, !isNaN(this.appModel.grid));

                console.log('Offset:', this.appModel.offset);
                console.log('Point:', {
                    'x': start.x - rect.left,
                    'y': start.y - rect.top
                });
                console.log('Normal point:', point);
                //const x = this.toNormal(start.x - rect.left, this.appModel.offset.x, !isNaN(this.appModel.grid));
                //const y = this.toNormal(start.y - rect.top, this.appModel.offset.y, !isNaN(this.appModel.grid));
                this.appModel.selectedPrimitive = {
                    'type': this.appModel.selectedTool,
                    'start': point,
                    'end': { 'x': point.x, 'y': point.y },
                    'points': []
                }
                return this.appModel.selectedPrimitive;
            }
        }

        const pointAccumulator = (x: Primitive, y: Point): Primitive => {
            const point = this.utilsService.toNormal(y, !isNaN(this.appModel.grid));
            if (draggablePoint) { // editing primitive state
                draggablePoint.point.x = point.x;
                draggablePoint.point.y = point.y;
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
                    const lastIndex = x.points.length - 1;
                    if (lastIndex >= 0 && (x.points[lastIndex].x != y.x || x.points[lastIndex].y != y.y)) {
                        x.points.push(y);
                    } else if (x.points.length == 0) {
                        x.points.push(y);
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
            } else {
                // check if it is just a click
                if (Math.abs(data.end.x - data.start.x) < Constants.MINIMAL_SIZE && Math.abs(data.end.y - data.start.y) < Constants.MINIMAL_SIZE) {
                    this.selectPrimitive(data);
                } else if (data.type != Constants.ID_MOVE) {
                    this.appModel.data.push(data);
                    this.historyService.snapshoot();
                }
            }
        }

        Observable.fromEvent(canvas, 'mousedown').subscribe(
            (startEvent: MouseEvent) => {
                startEvent.preventDefault();
                startEvent.stopPropagation();
                const rect = canvas.getBoundingClientRect();
                Observable.fromEvent(document, 'mousemove')
                    .map((event: MouseEvent)  => <Point> {
                        'x': event.pageX - rect.left,
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
                this.appModel.zoom += wheelEvent.wheelDelta > 0? Constants.DEFAULT_ZOOM_DELATA: -Constants.DEFAULT_ZOOM_DELATA;
            },
            e => console.log("wheelEvent error", e)
        );

        Observable.fromEvent(canvas, 'mousemove')
            .map((event: MouseEvent) => {
                if (this.appModel.selectedPrimitive) {
                    const rect = canvas.getBoundingClientRect();
                    const sc = Constants.SELECTION_CIRCLE;
                    const x = event.pageX - rect.left;
                    const y = event.pageY - rect.top;

                    const p1 = this.utilsService.fromNormal(this.appModel.selectedPrimitive.start);
                    const p2 = this.utilsService.fromNormal(this.appModel.selectedPrimitive.end);
                    if (x >= p1.x - sc && x <= p1.x + sc && y >= p1.y - sc && y <= p1.y + sc) {
                        return <DraggablePoint> {
                            'point': this.appModel.selectedPrimitive.start,
                            'direction': PointType.StartPoint,
                            'primitive': this.appModel.selectedPrimitive
                        };
                    } else if (x >= p2.x - sc && x <= p2.x + sc && y >= p2.y - sc && y <= p2.y + sc) {
                        return <DraggablePoint> {
                            'point': this.appModel.selectedPrimitive.end,
                            'direction': PointType.EndPoint,
                            'primitive': this.appModel.selectedPrimitive
                        };
                    } else {
                        return this.appModel.selectedPrimitive.points.filter(point => {
                            const p = this.utilsService.fromNormal(point);
                            return x >= p.x - sc && x <= p.x + sc && y >= p.y - sc && y <= p.y + sc;
                        }).map(point => <DraggablePoint> {
                            'point': point,
                            'direction': PointType.MiddlePoint,
                            'primitive': this.appModel.selectedPrimitive
                        }).find(point => true);
                    }
                }
                return undefined;
            })
            .subscribe(
                o => {
                    if (o != undefined) {
                        this.canvas.nativeElement.style.cursor = 'move';
                        this.draggablePoint = o;
                    } else {
                        this.canvas.nativeElement.style.cursor = 'auto';
                        this.draggablePoint = undefined;
                    }
                },
                e => console.log("wheelEvent error", e)
            );
    }

    resizeCanvas() {
        let canvas = this.canvas.nativeElement;
        const styles = getComputedStyle(canvas);
        canvas.width = (styles.width)? parseInt(styles.width.replace(/[^\d^\.]*/g, '')): 0;
        canvas.height = (styles.height)? parseInt(styles.height.replace(/[^\d^\.]*/g, '')): 0;
        this.drawScene(null);

        if (styles.width && styles.height) {
            console.log('resize: ' + parseInt(styles.width.replace(/[^\d^\.]*/g, '')) + ', ' + parseInt(styles.height.replace(/[^\d^\.]*/g, '')));
        }
    }

    selectPrimitive(data: Primitive) {
        this.appModel.selectedPrimitive = this.appModel.data.find(o => {
            switch(o.type) {
                case Constants.ID_LINE:
                    return this.utilsService.testLine(o.start, o.end, data.start);

                case Constants.ID_RECTANGLE:
                    return this.utilsService.testLine(o.start, {
                        'x': o.start.x,
                        'y': o.end.y
                    }, data.start) || this.utilsService.testLine({
                        'x': o.start.x,
                        'y': o.end.y
                    }, o.end, data.start) || this.utilsService.testLine(o.end, {
                        'x': o.end.x,
                        'y': o.start.y
                    }, data.start) || this.utilsService.testLine({
                        'x': o.end.x,
                        'y': o.start.y
                    }, o.start, data.start);
    
                case Constants.ID_PEN:
                    return o.points.reduce((x, y) => {
                        return {
                            'res': x.res || this.utilsService.testLine(x.point, y, data.start),
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
        this.drawScene(null);
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
            this.drawService.drawPrimitive(data, context);
        }

        this.drawService.drawSelection(context);
    }
}
