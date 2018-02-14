import { Component, OnInit, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';

import { MessageService } from './services/message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Editor';

  constructor (iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, private messageService: MessageService) {
    iconRegistry.addSvgIcon('line', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/line.svg'));
    iconRegistry.addSvgIcon('rectangle', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/rectangle.svg'));
    iconRegistry.addSvgIcon('pen', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/pen.svg'));
    iconRegistry.addSvgIcon('grid', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/grid.svg'));
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
