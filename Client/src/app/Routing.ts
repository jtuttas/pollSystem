import {RouterModule, Routes} from "@angular/router";
import {VoteComponent} from "./VoteComponent";
import {PageNotFoundComponent} from "./PageNotFoundComponent";
import {ModuleWithProviders} from "@angular/core";
import { EvalComponent } from "./eval.component";
import { DemoComponent } from "./demo.component";
const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'app-root'
  },
  {path: 'vote/:polltype/:id', component: VoteComponent},
  {path: 'eval/:polltype', component: EvalComponent},
  {path: 'demo', component: DemoComponent},
  {path: 'notfound', component: PageNotFoundComponent},
  { path: '**', component: PageNotFoundComponent }

];

export var routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
