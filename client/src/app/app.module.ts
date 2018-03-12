import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { MatIconModule } from '@angular/material';

import { AppComponent } from './app.component';
import { ControlsGridComponent } from './components/controls-grid/controls-grid.component';
import { CanvasComponent } from './components/canvas/canvas.component';

import { MessageService } from './services/message.service';
import { AppModel } from './models/app-model';

@NgModule({
  declarations: [
    AppComponent,
    ControlsGridComponent,
    CanvasComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,

    // -- Material Design
    MatIconModule
  ],
  providers: [
    MessageService,
    AppModel
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
