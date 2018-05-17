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
        let draggablePoint: PrimitivePoint | undefined;

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

        const pointInitiator = (start: Point): Primitive | undefined => {
            if (this.draggablePoint) { // editing primitive state
                draggablePoint = this.draggablePoint;
                return draggablePoint.primitive;
            } else if (this.appModel.selectedTool == Constants.TYPE_MOVE) { // moving page state
                return <Primitive> {
                    'id': Date.now().toString(),
                    'type': this.appModel.selectedTool,
                    'start': { 'x': start.x, 'y': start.y },
                    'end': { 'x': start.x, 'y': start.y }
                }
            } else { // creating primitive state
                const point = this.utilsService.toNormal({
                    'x': start.x,
                    'y': start.y
                }, false);
                this.appModel.selectedPrimitive = this.utilsService.createPrimitive(this.appModel.selectedTool, point);
                return this.appModel.selectedPrimitive;
            }
        }

        const pointAccumulator = (x: Primitive | undefined, y: Point): Primitive | undefined => {
            if (!x) {
                return undefined;
            }

            const point = this.utilsService.toNormal(y, false);
            if (draggablePoint) { // editing primitive state
                if (draggablePoint.primitive.type == Constants.TYPE_SIZE) { // size primitive has special logic
                    this.utilsService.moveSizePrimitive(
                        <PrimitiveSize>draggablePoint.primitive,
                        draggablePoint.direction,
                        point
                    );
                } else {
                    this.utilsService.movePrimitive(draggablePoint.primitive, draggablePoint, point);
                }
                this.drawScene(null);
            } else if (this.appModel.selectedTool == Constants.TYPE_MOVE) { // moving page state
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
                if (this.appModel.selectedTool == Constants.TYPE_PEN) {
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
            } else if (data.type == Constants.TYPE_LINE ||
                data.type == Constants.TYPE_RECTANGLE ||
                data.type == Constants.TYPE_PEN ||
                data.type == Constants.TYPE_ARC) {

                this.utilsService.addPrimitive(data)
                this.historyService.snapshoot();
            }
        }

        const isSelectionOrMoving = (start, end) => {
            if (Math.abs(end.x - start.x) <= Constants.MINIMAL_SIZE && Math.abs(end.y - start.y) <= Constants.MINIMAL_SIZE)
                return true;
            else 
                return false;
        }

        // handle moving to add, edit primitive and etc, it isn't click ----------------
        let movingSubscription; // true if moving event need to be subscribed
        let startPoint: Point | undefined; // null if right mousedown event need to be stored
        canvas.onmousemove = (event: MouseEvent)  => { //start moving if delta is reached and show move cursor if mouse on point
            const sp = this.utilsService.getScreenPoint(canvas.getBoundingClientRect(), event.pageX, event.pageY);
            startPoint = (event.buttons == 1)? (startPoint? startPoint: sp): undefined; // get start point

            // shows moving cursor if there isn't moving and primitive is selected
            // saves active primitive point to draggablePoint
            if (!movingSubscription && this.appModel.selectedPrimitive) {
                this.draggablePoint = this.utilsService.getPrimitivePoint(this.appModel.selectedPrimitive, sp);
                const cursor = this.canvas.nativeElement.style.cursor;
                if (!this.draggablePoint) {
                    if (cursor != 'auto') {
                        canvas.style.cursor = 'auto';
                    }
                } else {
                    if (cursor != 'move') {
                        canvas.style.cursor = 'move';
                    }
                }
            }

            // trigger moving if delta is reached and there isn't other moving
            if (!movingSubscription && startPoint && !isSelectionOrMoving(startPoint, sp)) {
                movingSubscription = Observable.fromEvent(document, 'mousemove')
                    .map((event: MouseEvent)  => this.utilsService.getScreenPoint(canvas.getBoundingClientRect(), event.pageX, event.pageY))
                    .takeUntil(Observable.fromEvent(document, 'mouseup'))
                    .reduce(pointAccumulator, pointInitiator(startPoint))
                    .subscribe(
                        data => {
                            movingSubscription.unsubscribe();
                            movingSubscription = undefined;
                            startPoint = undefined;
                            if (data) {
                                addPrimitive(data);
                            }
                        },
                        e => console.log("moveEvent error", e)
                    );
            }
        }

        canvas.ontouchmove = (event: TouchEvent)  => { //start moving if delta is reached
            const sp = this.utilsService.getScreenPoint(canvas.getBoundingClientRect(), event.touches[0].pageX, event.touches[0].pageY);
            //TODO: should be undefined when touch is finished
            startPoint = startPoint? startPoint: sp; // get start point

            // saves active primitive point to draggablePoint
            if (!movingSubscription && this.appModel.selectedPrimitive) {
                this.draggablePoint = this.utilsService.getPrimitivePoint(this.appModel.selectedPrimitive, sp);
            }

            // trigger moving if delta is reached and there isn't other moving
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
                        if (data) {
                            addPrimitive(data);
                        }
                    },
                    e => console.log("touchmoveEvent error", e)
                );
            }
        }
        // ---------------------------------------------------------------------------------

        // handle clicks to select primitive, it isn't moving--------
        let firstPrimitive;
        const selectionFinished = (start: Point, end: Point) => {
            if (isSelectionOrMoving(start, end)) {
                const point = this.utilsService.toNormal({
                    'x': start.x + (end.x - start.x) / 2,
                    'y': start.y + (end.y - start.y) / 2,
                });
                this.selectPrimitive(point);
                if (this.appModel.selectedTool == Constants.TYPE_SIZE) {
                    if (!firstPrimitive) {
                        firstPrimitive = this.appModel.selectedPrimitive;
                    } else if (this.appModel.selectedPrimitive) {
                        const prim = this.utilsService.createSizePrimitive(
                            firstPrimitive.start,
                            point,
                            firstPrimitive,
                            this.appModel.selectedPrimitive,
                        );
                        this.historyService.snapshoot();

                        // clear creation state
                        this.appModel.selectedTool = firstPrimitive  = undefined;
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
        this.appModel.selectedPrimitive = Array.from(this.appModel.data.values()).find(o => this.utilsService.testPrimitive(o, point));
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
