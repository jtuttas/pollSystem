import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { log } from 'util';
import { PollService } from './PollService';
import { Question } from './Question';
import { Answer } from './Answer';
import { TableModule } from 'primeng/table';
import { Result } from './Result';
import { forEach } from '@angular/router/src/utils/collection';
import {RadioButtonModule} from 'primeng/radiobutton';

@Component({
    selector: 'vote',
    templateUrl: './vote.component.html',
    styleUrls: ['./vote.component.css']
})
export class VoteComponent implements OnInit {
    id: string;
    polltype: string;
    msg: string;
    questions: Question[];
    answers: Answer[];
    results: Result[];
    selectedValue:string[];


    private sub: any;

    constructor(private route: ActivatedRoute, private pollservice: PollService, private router: Router) {

    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.id = params['id'];
            this.polltype = params['polltype']
            console.log("id=" + params["id"] + " und polltype=" + params["polltype"]);

            this.pollservice.getLatestPoll(this.polltype, this.id).subscribe(
                data => {
                    console.log("Bisherige Antworten: " + JSON.stringify(data));
                    if (data == null) {
                        this.msg = "Die Umfrage ist nicht aktiv!";
                    }
                    else {
                        this.results = data[0].antworten;
                        console.log("Anzahl der Antworten: " + this.results.length)
                        this.msg = data[0].poll;
                        this.loadQuestions();
                        this.loadAnswers();
                    }
                },
                err => {
                    console.log("Fehler");
                    this.router.navigate(["/notfound"]);
                }
            );
            // In a real app: dispatch action to load the details here.
        });
    }

    loadQuestions() {
        this.pollservice.getQuestions(this.polltype).subscribe(
            data => {
                console.log("Die Fragen" + JSON.stringify(data));
                this.questions = data;
                this.selectedValue = new Array<string>(this.questions.length);
            },
            err => {
                console.log("Fehler");
            }
        );
    }

    loadAnswers() {
        this.pollservice.getAnswers(this.polltype).subscribe(
            data => {
                console.log("Die Antwortskalen" + JSON.stringify(data));
                this.answers = data;
                this.calcSelected()
            },
            err => {
                console.log("Fehler");
            }
        );
    }

    calcSelected() {
        var i=0;
        this.questions.forEach(element => {
            this.results.forEach(erlement => {
                if (element._id==erlement.question) {
                    console.log("Frage "+element._id+" wurde beantwortet mit "+erlement.answer+ "Serte selectted Values["+i+"] auf Wert");                    
                    this.selectedValue[i]=""+erlement.answer;
                }
            });
            i++;
        });
       
    }


    radioClick(d) {
        console.log("Klick row="+JSON.stringify(d));
        console.log("Value Changed (Set) to "+this.selectedValue[d]);
        
        this.pollservice.setAnswer(this.polltype,this.id,this.questions[d]._id,+this.selectedValue[d]).subscribe(
            data => {
                console.log("Antwort vom Server beim Eintragen der Vote:" + JSON.stringify(data));
            },
            err => {
                console.log("Fehler beim Eintragen der Vote:");
            }
        );
    }


}