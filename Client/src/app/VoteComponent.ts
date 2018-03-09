import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { log } from 'util';
import { PollService } from './PollService';
import { Question } from './Question';
import { Answer } from './Answer';
import { TableModule } from 'primeng/table';
import { Result } from './Result';
import { forEach } from '@angular/router/src/utils/collection';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Message } from 'primeng/api';
import { MessageService } from "primeng/components/common/messageservice";

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
    questionData: Question[] = [];
    answers: Answer[];
    results: Result[];
    selectedValue: string[];
    msgs: Message[] = [];


    private sub: any;

    constructor(private messageService: MessageService, private route: ActivatedRoute, private pollservice: PollService, private router: Router) {
       
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
                    }
                },
                err => {
                    console.log("Fehler " + JSON.stringify(err));
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
                if (data.length == 0) {
                    this.messageService.add({ severity: 'error', summary: 'Voting', detail: "Der Umfragetyp enthält keine Fragen" });
                }
                this.pollservice.getAnswers(this.polltype).subscribe(
                    data2 => {
                        console.log("Die Antwortskalen" + JSON.stringify(data2));
                        this.questions = [];
                        data.forEach(element => {
                            this.questions.push(new Question("" + element._id, "" + element.text));
                        });
                        console.log("Frage0=" + this.questions[0]._id);

                        this.selectedValue = new Array<string>(this.questions.length);
                        this.answers = data2;
                        console.log("Frage0=" + this.questions[0]._id);
                        if (data2.length == 0) {
                            this.messageService.add({ severity: 'error', summary: 'Voting', detail: "Der Umfragetyp enthält keine Antwortskalen" });
                        }
                        console.log("Frage0=" + this.questions[0]._id);
                        this.calcSelected();
                        console.log("Frage0=" + this.questions[0]._id);
                        this.questionData = new Array(this.questions.length);
                        console.log("<-> Frage0=" + this.questions[0]._id);
                    },
                    err => {
                        console.log("Fehler loadAnswer()");
                    }
                );


            },
            err => {
                console.log("Fehler loadQuestions()");
            }
        );
    }


    calcSelected() {
        var i = 0;
        this.questions.forEach(element => {
            this.results.forEach(erlement => {
                if (element._id == erlement.question) {
                    console.log("Frage " + element._id + " wurde beantwortet mit " + erlement.answer + "Serte selectted Values[" + i + "] auf Wert");
                    this.selectedValue[i] = "" + erlement.answer;
                }
            });
            i++;
        });

    }


    radioClick(d) {
        console.log("<-> Frage0=" + this.questions[0]._id);
        console.log("Klick row=" + JSON.stringify(d));
        console.log("Value Changed (Set) to " + this.selectedValue[d]);

        this.pollservice.setAnswer(this.polltype, this.id, this.questions[d]._id, +this.selectedValue[d]).subscribe(
            data => {
                console.log("Antwort vom Server beim Eintragen der Vote:" + JSON.stringify(data));
                if (!data.success) {
                    this.messageService.add({ severity: 'error', summary: 'Voting', detail: data.msg });
                }
            },
            err => {
                console.log("Fehler beim Eintragen der Vote:");
                this.messageService.add({ severity: 'error', summary: 'Voting', detail: "Fehler beim Eintragen des Wertes" });
            }
        );
    }


}