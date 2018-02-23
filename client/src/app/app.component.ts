import { Component, OnInit, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';

import { MessageService } from './services/message.service';
import { ControlItem } from './models/control-item.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Editor';

  toolItems = [
    { id: "line", name: "Line", isActive: true },
    { id: "rectangle", name: "Rectangle", isActive: false },
    { id: "pen", name: "Pen", isActive: false },
  ];

  canvasItems = [
    { id: "plus", name: "Zoom In", isActive: false },
    { id: "minus", name: "Zoom Out", isActive: false },
    { id: "grid", name: "Grid", isActive: false }
  ];

  constructor (iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, private messageService: MessageService) {
    iconRegistry.addSvgIcon('line', sanitizer.bypassSecurityTrustResourceUrl('/assets/line.svg'));
    iconRegistry.addSvgIcon('rectangle', sanitizer.bypassSecurityTrustResourceUrl('/assets/rectangle.svg'));
    iconRegistry.addSvgIcon('pen', sanitizer.bypassSecurityTrustResourceUrl('/assets/pen.svg'));
    iconRegistry.addSvgIcon('grid', sanitizer.bypassSecurityTrustResourceUrl('/assets/grid.svg'));
    iconRegistry.addSvgIcon('plus', sanitizer.bypassSecurityTrustResourceUrl('/assets/plus.svg'));
    iconRegistry.addSvgIcon('minus', sanitizer.bypassSecurityTrustResourceUrl('/assets/minus.svg'));
  }

  ngOnInit() {
  }

  @HostListener('window:resize', ['$event'])
  OnResize(event) {
    this.messageService.send({
      name: "size",
      data: {
        width: event.target.innerWidth,
        height: event.target.innerHeight,
      }
    });
  }
}
