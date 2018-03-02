import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { VoteComponent } from './VoteComponent';
import { PageNotFoundComponent } from './PageNotFoundComponent';
import { routing } from "./Routing";
import { PollService } from './PollService';
import {HttpModule} from '@angular/http';
import {TableModule} from 'primeng/table';
import {RadioButtonModule} from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';
import {GrowlModule} from 'primeng/growl';
import {MessageService} from 'primeng/components/common/messageservice';
@NgModule({
  declarations: [
    AppComponent, VoteComponent, PageNotFoundComponent
  ],
  exports: [VoteComponent, PageNotFoundComponent],
  imports: [
    BrowserModule, routing, HttpModule, TableModule,RadioButtonModule,FormsModule,GrowlModule
  ],
  providers: [PollService,MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
