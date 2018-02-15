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

interface Point {
  'x': number,
  'y': number,
}

interface DrawData {
  'type': string,
  'x1': number,
  'y1': number,
  'x2': number,
  'y2': number
  'points': Array<Point>;
}

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {

  @ViewChild('canvas') 
  canvas: ElementRef;

  item: ControlItem = <ControlItem>{ type: "rectangle", name: "Rectangle", isActive: false };
  history: Array<DrawData> = [];

  constructor(private messageService: MessageService) { }

  ngOnInit() {
    const canvas = this.canvas.nativeElement;
    this.configureCanvas(canvas);

    this.messageService.subscribe("size", this.resizeMessage.bind(this));
    this.messageService.subscribe("control-item", this.changeItem.bind(this));

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
            'type': this.item.type,
            'x1': startEvent.pageX - rect.left,
            'y1': startEvent.pageY - rect.top,
            'x2': startEvent.pageX - rect.left,
            'y2': startEvent.pageY - rect.top,
            'points': []
          })
          .subscribe(
            data => {
              this.history.push(data);
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
          'type': this.item.type,
          'x1': startEvent.touches[0].pageX - rect.left,
          'y1': startEvent.touches[0].pageY - rect.top,
          'x2': startEvent.touches[0].pageX - rect.left,
          'y2': startEvent.touches[0].pageY - rect.top,
          'points': []
        })
        .subscribe(
          data => {
            this.history.push(data);
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
    this.drawScene(x);
    return x;
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
    console.log("item changed: ", message.data);
  }

  drawScene(data: any) {
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height)

    if (this.item) {
      this.history.forEach(o => {
        this.drawPrimitive(o, context);
      })

      this.drawPrimitive(data, context);
    }
  }

  drawPrimitive(data: DrawData, context) {
    if (data == null) {
      return;
    }

    switch(data.type) {
      case "line":
        context.beginPath();
        context.moveTo(data.x1, data.y1);
        context.lineTo(data.x2, data.y2);
        context.stroke();
        break;

      case "rectangle":
        context.beginPath();
        context.rect(data.x1, data.y1, data.x2 - data.x1, data.y2 - data.y1);
        context.stroke();
        break;

      case "pen":
        context.beginPath();
        context.moveTo(data.x1, data.y1);
        data.points.forEach(o => {
          context.lineTo(o.x, o.y);
          context.moveTo(o.x, o.y);
        });
        context.stroke();
    }
  }
}
