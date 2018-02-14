import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/switchMapTo';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';

import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { MessageService } from './../../services/message.service';
import { Message } from './../../models/message.model';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {
  @ViewChild('canvas') 
  canvas: ElementRef;

  constructor(private messageService: MessageService) { }

  ngOnInit() {
    const canvas = this.canvas.nativeElement;
    this.configureCanvas(canvas);

    this.messageService.subscribe(this.resizeMessage.bind(this));

    const context = canvas.getContext("2d");

    const mouseEvents$ = Observable.fromEvent(canvas, 'mousedown').mergeMap((startEvent: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return Observable.fromEvent(document, 'mousemove')
        .map((event: MouseEvent)  => ({
          'x1': startEvent.pageX - rect.left,
          'y1': startEvent.pageY - rect.top,
          'x2': event.pageX - rect.left,
          'y2': event.pageY - rect.top
        }))
        .takeUntil(Observable.fromEvent(document, 'mouseup'))
      }
    );

    const touchEvents$ = Observable.fromEvent(canvas, 'touchstart').mergeMap((startEvent: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      return Observable.fromEvent(document, 'touchmove')
        .map((event: TouchEvent)  => ({
          'x1': startEvent.touches[0].pageX - rect.left,
          'y1': startEvent.touches[0].pageY - rect.top,
          'x2': event.touches[0].pageX - rect.left,
          'y2': event.touches[0].pageY - rect.top
        }))
        .takeUntil(Observable.fromEvent(document, 'touchend'))
    });

    const events$ = mouseEvents$.merge(touchEvents$);
    events$.subscribe(
      o => {
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.beginPath();
        context.moveTo(o.x1, o.y1);
        context.lineTo(o.x2, o.y2);
        context.stroke();
      },
      e => console.log("moveEvent error", e),
      () => console.log("moveEvent: completed")
    );
  }

  configureCanvas(canvas) {
    const styles = getComputedStyle(this.canvas.nativeElement);
    canvas.width = (styles.width)? parseInt(styles.width.replace(/[^\d^\.]*/g, '')): 0;
    canvas.height = (styles.height)? parseInt(styles.height.replace(/[^\d^\.]*/g, '')): 0;
    console.log(canvas.width, canvas.height);
  }

  resizeMessage(message: Message) {
    const canvas = this.canvas.nativeElement;
    this.configureCanvas(canvas);
  }
}
