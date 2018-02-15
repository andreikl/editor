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
    { type: "line", name: "Line", isActive: true },
    { type: "rectangle", name: "Rectangle", isActive: false },
    { type: "pen", name: "Pen", isActive: false },
    { type: "grid", name: "Grid", isActive: false }
  ];

  active: ControlItem;

  constructor(private messageService: MessageService) { }

  ngOnInit() { }
 
  clickHandler($event: Event, item: ControlItem) {
    this.active = item;
    this.messageService.send({name: "control-item", data: item});
  }
}
