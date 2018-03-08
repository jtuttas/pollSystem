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
import { EvalService } from './EvalService';
import { EvalComponent } from './eval.component';
import {DropdownModule} from 'primeng/dropdown';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ButtonModule} from 'primeng/button';
import {DialogModule} from 'primeng/dialog';
import {ChartModule} from 'primeng/chart';
import {PasswordModule} from 'primeng/password';
import {InputTextModule} from 'primeng/inputtext';
import { DemoComponent } from './demo.component';
@NgModule({
  declarations: [
    AppComponent, VoteComponent, PageNotFoundComponent,EvalComponent,DemoComponent
  ],
  exports: [VoteComponent, PageNotFoundComponent],
  imports: [
    BrowserModule, routing, HttpModule, TableModule,RadioButtonModule,FormsModule,GrowlModule,DropdownModule,
    BrowserAnimationsModule, ButtonModule, DialogModule,ChartModule,PasswordModule, InputTextModule
  ],
  
  providers: [PollService,MessageService,EvalService],
  bootstrap: [AppComponent]
})
export class AppModule { }
