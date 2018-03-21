import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatIconModule,
    MatInputModule, MatFormFieldModule,
    MatExpansionModule} from '@angular/material';

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
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        AppComponent,
        ControlsGridComponent,
        CanvasComponent,
        PanelComponent,
        PropertiesPanelComponent,
        PropertiesRectangleComponent,
        PropertiesIdleComponent
    ],
    imports: [
        HttpClientModule,
        BrowserModule,
        FormsModule,

        // -- Material Design
        MatExpansionModule,
        MatInputModule, MatFormFieldModule,
        MatIconModule,

        // Animation module is requred for material design
        BrowserAnimationsModule
    ],
    providers: [
        MessageService,
        SvgService,
        AppModel
    ],
    entryComponents: [
        PropertiesRectangleComponent,
        PropertiesIdleComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
