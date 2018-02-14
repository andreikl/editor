import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { MatIconModule } from '@angular/material';

import { AppComponent } from './app.component';
import { ControlsGridComponent } from './components/controls-grid/controls-grid.component';
import { CanvasComponent } from './components/canvas/canvas.component';

import { MessageService } from './services/message.service';

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
    MessageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
