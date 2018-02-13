import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { MatIconModule } from '@angular/material';

import { AppComponent } from './app.component';
import { ControlsGridComponent } from './components/controls-grid/controls-grid.component';


@NgModule({
  declarations: [
    AppComponent,
    ControlsGridComponent
  ],
  imports: [
    BrowserModule,

    // -- Material Design
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
