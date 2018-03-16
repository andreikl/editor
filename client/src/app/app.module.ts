import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { MatIconModule, MatGridListModule } from '@angular/material';

import { AppComponent } from './app.component';
import { ControlsGridComponent } from './components/controls-grid/controls-grid.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { PanelComponent } from './components/panel/panel.component';

import { MessageService } from './services/message.service';
import { SvgService } from './services/svg.service';
import { AppModel } from './models/app.model';

@NgModule({
    declarations: [
        AppComponent,
        ControlsGridComponent,
        CanvasComponent,
        PanelComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,

        // -- Material Design
        MatGridListModule,
        MatIconModule
    ],
    providers: [
        MessageService,
        SvgService,
        AppModel
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
