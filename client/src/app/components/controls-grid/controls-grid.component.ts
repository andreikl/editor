import { Component, OnInit } from '@angular/core';

import { ControlItem } from './../../models/control-item';

@Component({
  selector: 'app-controls-grid',
  templateUrl: './controls-grid.component.html',
  styleUrls: ['./controls-grid.component.scss']
})
export class ControlsGridComponent implements OnInit {

  items: ControlItem[] = [
    { id: "line", name: "Line" },
    { id: "rectangle", name: "Rectangle" },
    { id: "grid", name: "Grid" }
  ];

  constructor() { }

  ngOnInit() {
  }
 
}
