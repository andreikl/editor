import { Component, Input, OnInit } from '@angular/core';

import { ControlItem } from './../../models/control-item.model';
import { MessageService } from './../../services/message.service';

@Component({
  selector: 'app-controls-grid',
  templateUrl: './controls-grid.component.html',
  styleUrls: ['./controls-grid.component.scss']
})
export class ControlsGridComponent implements OnInit {
  @Input() items: ControlItem[];

  active: ControlItem;

  constructor(private messageService: MessageService) { }

  ngOnInit() { }
 
  clickHandler($event: Event, item: ControlItem) {
    this.active = item;
    this.messageService.send({name: "control-item", data: item});
  }
}
