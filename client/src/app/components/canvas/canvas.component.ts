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

    item: ControlItem = <ControlItem>{ id: "rectangle", name: "Rectangle", isActive: false };
    draggablePoint?: DraggablePoint;

    constructor(private messageService: MessageService, private appModel: AppModel) { }

    ngOnInit() {
        const canvas = this.canvas.nativeElement;

        let draggablePoint;

        this.messageService.subscribe("control-item", (message) => {
            this.item = message.data;
        });

        this.messageService.subscribe(Constants.EVENT_MODEL_CHANGED, (message) => {
            switch (message.data.name) {
                case Constants.EVENT_ZOOM:
                    return this.drawScene(null);

                case Constants.EVENT_GRID:
                    console.log('grid:' + this.appModel.grid);
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
            } else if ((this.item.id == Constants.ID_MOVE)) { // moving page state
                const x = start.x - rect.left;
                const y = start.y - rect.top;
                return {
                    'type': this.item.id,
                    'start': { 'x': x, 'y': y },
                    'end': { 'x': x, 'y': y },
                    'points': []
                }
            } else { // creating primitive state
                const x = this.toNormal(start.x - rect.left, this.appModel.offset.x, !isNaN(this.appModel.grid));
                const y = this.toNormal(start.y - rect.top, this.appModel.offset.y, !isNaN(this.appModel.grid));
                this.appModel.selectedPrimitive = {
                    'type': this.item.id,
                    'start': { 'x': x, 'y': y },
                    'end': { 'x': x, 'y': y },
                    'points': []
                }
                return this.appModel.selectedPrimitive;
            }
        }

        const pointAccumulator = (x: Primitive, y: Point): Primitive => {
            if (draggablePoint) { // editing primitive state
                draggablePoint.point.x = this.toNormal(y.x, this.appModel.offset.x, !isNaN(this.appModel.grid));
                draggablePoint.point.y = this.toNormal(y.y, this.appModel.offset.y, !isNaN(this.appModel.grid));
                this.drawScene(null);
            } else if ((this.item.id == Constants.ID_MOVE)) { // moving page state
                this.appModel.offset = {
                    x: this.appModel.offset.x + (y.x - x.end.x) / this.appModel.zoom,
                    y: this.appModel.offset.y + (y.y - x.end.y) / this.appModel.zoom
                }
                x.end.x = y.x;
                x.end.y = y.y;
                this.drawScene(null);
            } else { // creating primitive state
                x.end.x = y.x = this.toNormal(y.x, this.appModel.offset.x, !isNaN(this.appModel.grid));
                x.end.y = y.y = this.toNormal(y.y, this.appModel.offset.y, !isNaN(this.appModel.grid));
                if (this.item.id == Constants.ID_PEN) {
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
            } else {
                // check if it is just a click
                if (data.end.x - data.start.x < Constants.MINIMAL_SIZE && data.end.y - data.start.y < Constants.MINIMAL_SIZE) {
                    this.selectPrimitive(data);
                } else if (data.type != Constants.ID_MOVE) {
                    this.appModel.data.push(data);
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

                    const x1 = this.fromNormal(this.appModel.selectedPrimitive.start.x, this.appModel.offset.x);
                    const y1 = this.fromNormal(this.appModel.selectedPrimitive.start.y, this.appModel.offset.y);
                    const x2 = this.fromNormal(this.appModel.selectedPrimitive.end.x, this.appModel.offset.x);
                    const y2 = this.fromNormal(this.appModel.selectedPrimitive.end.y, this.appModel.offset.y);
                    console.log(x2, y2);
                    if (x >= x1 - sc && x <= x1 + sc && y >= y1 - sc && y <= y1 + sc) {
                        return <DraggablePoint> {
                            'point': this.appModel.selectedPrimitive.start,
                            'direction': PointType.StartPoint,
                            'primitive': this.appModel.selectedPrimitive
                        };
                    } else if (x >= x2 - sc && x <= x2 + sc && y >= y2 - sc && y <= y2 + sc) {
                        return <DraggablePoint> {
                            'point': this.appModel.selectedPrimitive.end,
                            'direction': PointType.EndPoint,
                            'primitive': this.appModel.selectedPrimitive
                        };
                    } else {
                        return this.appModel.selectedPrimitive.points.filter(point => {
                            const px = this.fromNormal(point.x, this.appModel.offset.x);
                            const py = this.fromNormal(point.y, this.appModel.offset.y);
                            return x >= px - sc && x <= px + sc && y >= py - sc && y <= py + sc;
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

    ngAfterViewInit() {
        this.resizeCanvas();
    }

    // convert point to normalised coordinate space
    toNormal(value: number, offset: number, isGrid?: Boolean) {
        const nv = (value - offset) / this.appModel.zoom;
        return isGrid? this.appModel.grid * Math.round(nv / this.appModel.grid): nv;
    }

    fromNormal(value: number, offset: number) {
        return (value + offset) * this.appModel.zoom;
    }

    resizeCanvas() {
        let canvas = this.canvas.nativeElement;
        const styles = getComputedStyle(canvas);
        canvas.width = (styles.width)? parseInt(styles.width.replace(/[^\d^\.]*/g, '')): 0;
        canvas.height = (styles.height)? parseInt(styles.height.replace(/[^\d^\.]*/g, '')): 0;
        this.drawScene(null);
    }

    selectPrimitive(data: Primitive) {
        const dot = (x, y) => x.x * y.x + x.y * y.y;

        const testLine = (a: Point, b: Point, point: Point) => {
            const ab = {
                'x': b.x - a.x,
                'y': b.y - a.y,
            }

            const ac = {
                'x': point.x - a.x,
                'y': point.y - a.y,
            }

            const bc = {
                'x': point.x - b.x,
                'y': point.y - b.y,
            }
            const e = dot(ac, ab);

            let dist = NaN;
            if (e <= 0.0) {
                dist = dot(ac, ac);
            } else {
                const f = dot(ab, ab);
                if (e >= f) {
                    dist = dot(bc, bc);
                } else {
                    dist = dot(ac, ac) - e * e / f;
                }
            }

            // closest point implementation
            // project point into ab, computing parametrized position d(t) = a + t * (b - a)
            let t = dot(ac, ab) / dot(ab, ab);

            // if point outside ab, attach t to the closest endpoint
            if (t < 0.0) t = 0.0;
            if (t > 1.0) t = 1.0;

            // compute the closest point on ab
            const d = {
                'x': ab.x * t + a.x,
                'y': ab.y * t + a.y
            }

            //draw projection to line
            /*const canvas = this.canvas.nativeElement;
            const context = canvas.getContext("2d");
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(d.x, d.y);
            context.stroke();*/

            return (dist < Constants.SELECTION_CIRCLE * Constants.SELECTION_CIRCLE)? true: false;
        }

        this.appModel.selectedPrimitive = this.appModel.data.find(o => {
            switch(o.type) {
                case Constants.ID_LINE:
                    return testLine(o.start, o.end, data.start);

                case Constants.ID_RECTANGLE:
                    return testLine({
                       'x': o.start.x,
                       'y': o.start.y
                    }, {
                        'x': o.start.x,
                        'y': o.end.y
                    }, data.start) || testLine({
                        'x': o.start.x,
                        'y': o.end.y
                    }, {
                        'x': o.end.x,
                        'y': o.end.y
                    }, data.start) || testLine({
                        'x': o.end.x,
                        'y': o.end.y
                    }, {
                        'x': o.end.x,
                        'y': o.start.y
                    }, data.start) || testLine({
                        'x': o.end.x,
                        'y': o.start.y
                    }, {
                        'x': o.start.x,
                        'y': o.start.y
                    }, data.start);
    
                case Constants.ID_PEN:
                    return o.points.reduce((x, y) => {
                        return {
                            'res': x.res || testLine(x.point, y, data.start),
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

        this.drawZero(canvas, context);
        this.drawGrid(canvas, context);
        this.drawNet(canvas, context);
        this.appModel.data.forEach(o => {
            this.drawPrimitive(o, context);
        });

        if (data) {
            this.drawPrimitive(data, context);
        }

        this.drawSelection(context);
    }

    drawZero(canvas, context) {
        const zeroPoint = {
            x: this.fromNormal(0, this.appModel.offset.x),
            y: this.fromNormal(0, this.appModel.offset.y)
        }
        if (zeroPoint.x >= 0 && zeroPoint.x <= canvas.width && zeroPoint.y >= 0 && zeroPoint.y <= canvas.height) {
            context.beginPath();
            context.arc(zeroPoint.x, zeroPoint.y, Constants.SELECTION_CIRCLE, 0, 2 * Math.PI);
            context.fill();
        }
    }

    drawGrid(canvas, context) {
        if (!isNaN(this.appModel.grid)) {
            const constOffsetDelta = {
                x: this.appModel.offset.x % this.appModel.grid * this.appModel.zoom,
                y: this.appModel.offset.y % this.appModel.grid * this.appModel.zoom,
            };
            context.beginPath();
            for (let y = constOffsetDelta.y; y < canvas.height; y += this.appModel.grid * this.appModel.zoom) {
                context.setLineDash([1, this.appModel.grid * this.appModel.zoom - 1]);
                context.moveTo(constOffsetDelta.x, y);
                context.lineTo(canvas.width, y);
            }
            context.stroke();
            context.setLineDash([]);
        }
    }

    drawNet(canvas, context) {
        if (!isNaN(this.appModel.net)) {
            const constOffsetDelta = {
                x: this.appModel.offset.x % this.appModel.net * this.appModel.zoom,
                y: this.appModel.offset.y % this.appModel.net * this.appModel.zoom,
            };
            context.beginPath();
            let index = 0;
            for (let x = constOffsetDelta.x; x < canvas.width; x += this.appModel.net * this.appModel.zoom, index++) {
                if (index % this.appModel.net2 == 0) {
                    context.stroke();
                    context.beginPath();
                    context.moveTo(x, 0);
                    context.lineTo(x, canvas.height);
                    context.lineWidth=2;
                    context.stroke();
                    context.beginPath();
                    context.lineWidth=1;
                } else {
                    context.moveTo(x, 0);
                    context.lineTo(x, canvas.height);
                }
            }
            index = 0;
            for (let y = constOffsetDelta.y; y < canvas.height; y += this.appModel.net * this.appModel.zoom, index++) {
                if (index % this.appModel.net2 == 0) {
                    context.stroke();
                    context.beginPath();
                    context.moveTo(0, y);
                    context.lineTo(canvas.width, y);
                    context.lineWidth=2;
                    context.stroke();
                    context.beginPath();
                    context.lineWidth=1;
                } else {
                    context.moveTo(0, y);
                    context.lineTo(canvas.width, y);
                }
            }
            context.stroke();
        }
    }

    drawLine(x1, y1, x2, y2, data, context) {
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
    }

    drawRect(x1, y1, x2, y2, data, context) {
        context.beginPath();
        context.rect(x1, y1, x2 - x1, y2 - y1);
        context.stroke();
    }

    drawPen(x1, y1, x2, y2, data, context) {
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

    drawSelection(context) {
        if (this.appModel.selectedPrimitive) {
            const x1 = this.appModel.zoom * (this.appModel.offset.x + this.appModel.selectedPrimitive.start.x);
            const y1 = this.appModel.zoom * (this.appModel.offset.y + this.appModel.selectedPrimitive.start.y);
            const x2 = this.appModel.zoom * (this.appModel.offset.x + this.appModel.selectedPrimitive.end.x);
            const y2 = this.appModel.zoom * (this.appModel.offset.y + this.appModel.selectedPrimitive.end.y);

            context.beginPath();
            context.arc(x1, y1, Constants.SELECTION_CIRCLE, 0, 2 * Math.PI);
            context.stroke();
            context.beginPath();
            context.arc(x2, y2, Constants.SELECTION_CIRCLE, 0, 2 * Math.PI);
            context.stroke();

            this.appModel.selectedPrimitive.points.forEach((o, index) => {
                const x = this.appModel.zoom * (this.appModel.offset.x + o.x);
                const y = this.appModel.zoom * (this.appModel.offset.y + o.y);
                context.beginPath();
                context.arc(x, y, Constants.SELECTION_CIRCLE, 0, 2 * Math.PI);
                context.stroke();
            });
        }
    }

    drawPrimitive(data: Primitive, context) {
        const x1 = this.appModel.zoom * (this.appModel.offset.x + data.start.x);
        const y1 = this.appModel.zoom * (this.appModel.offset.y + data.start.y);
        const x2 = this.appModel.zoom * (this.appModel.offset.x + data.end.x);
        const y2 = this.appModel.zoom * (this.appModel.offset.y + data.end.y);

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
