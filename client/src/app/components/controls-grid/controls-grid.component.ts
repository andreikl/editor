import { Component, OnInit } from '@angular/core';

import { ControlItem } from './../../models/control-item.model';
import { MessageService } from './../../services/message.service';

@Component({
  selector: 'app-controls-grid',
  templateUrl: './controls-grid.component.html',
  styleUrls: ['./controls-grid.component.scss']
})
export class ControlsGridComponent implements OnInit {

  items: ControlItem[] = [
    { id: "line", name: "Line", isActive: true },
    { id: "rectangle", name: "Rectangle", isActive: false },
    { id: "pen", name: "Pen", isActive: false },
    { id: "grid", name: "Grid", isActive: false }
  ];

  messageService = new MessageService();
  active: ControlItem;

  constructor() { }

  ngOnInit() { }
 
  clickHandler($event: Event, item: ControlItem) {
    this.active = item;
    this.messageService.send({name: "control-item", data: item});
  }
}
