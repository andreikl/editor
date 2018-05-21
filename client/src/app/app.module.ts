import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatIconModule,
    MatInputModule, MatFormFieldModule,
    MatExpansionModule,
    MatSelectModule} from '@angular/material';

import { AppComponent } from './app.component';
import { ControlsGridComponent } from './components/controls-grid/controls-grid.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { PanelComponent } from './components/panel/panel.component';

import { MessageService } from './services/message.service';
import { SvgService } from './services/svg.service';
import { AppModel } from './models/app.model';
import { PropertiesPanelComponent } from './components/properties-panel/properties-panel.component';
import { PropertiesRectangleComponent } from './components/properties-rectangle/properties-rectangle.component';
import { PropertiesIdleComponent } from './components/properties-idle/properties-idle.component';
import { PropertiesArcComponent } from './components/properties-arc/properties-arc.component';
import { PropertiesSizeComponent } from './components/properties-size/properties-size.component';
import { FormsModule } from '@angular/forms';
import { UtilsService } from './services/utils.service';
import { DrawService } from './services/draw.service';
import { HistoryService } from './services/history.service';

@NgModule({
    declarations: [
        AppComponent,
        ControlsGridComponent,
        CanvasComponent,
        PanelComponent,
        PropertiesRectangleComponent,
        PropertiesPanelComponent,
        PropertiesIdleComponent,
        PropertiesSizeComponent,
        PropertiesArcComponent
    ],
    imports: [
        HttpClientModule,
        BrowserModule,
        FormsModule,

        // -- Material Design
        MatExpansionModule,
        MatInputModule, MatSelectModule, MatFormFieldModule,
        MatIconModule,

        // Animation module is requred for material design
        BrowserAnimationsModule
    ],
    providers: [
        MessageService,
        HistoryService,
        UtilsService,
        DrawService,
        SvgService,
        AppModel
    ],
    entryComponents: [
        PropertiesRectangleComponent,
        PropertiesIdleComponent,
        PropertiesSizeComponent,
        PropertiesArcComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
