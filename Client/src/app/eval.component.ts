import { Component, OnInit, AfterViewInit, DoCheck, AfterContentInit } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import { EvalService } from './EvalService';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Message } from 'primeng/api';
import { PollService } from './PollService';
import { Question } from './Question';
import { SelectItem } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { Answer } from './Answer';
import { EvalResult } from './EvalResult';
import { ChartModule } from 'primeng/chart';
import { PieModel } from './PieModel';
import { forEach } from '@angular/router/src/utils/collection';
import { Umfrage } from './Umfrage';
@Component({
    selector: 'eval',
    templateUrl: './eval.component.html',
    styleUrls: ['./eval.component.css']
})
export class EvalComponent implements OnInit {
    titel: string = "?";
    private sub: any;
    private polltype: string;
    msgs: Message[] = [];
    answers: Answer[];
    private questions: Question[] = [];
    
    private questionData: Question[] = [];
    
    selectedHauptumfrage: Umfrage;
    selectedVergleichsumfrage: Umfrage;
    umfragen: Umfrage[];
    coursesHauptgruppe: SelectItem[] = new Array();
    coursesVergleichsgruppe: SelectItem[] = new Array();
    selectedHauptKlasse: any;
    selectedVergleichsklasse: any;
    displayHaupt: boolean = false;
    displayVergleich: boolean = false;
    displayHilfe: boolean = false;
    modelHauptgruppen: PieModel[] = [];
    modelVergleichsgruppen: PieModel[] = [];


    constructor(private messageService: MessageService, private route: ActivatedRoute, private pollservice: PollService, private evalservice: EvalService, private router: Router) {
    }

    startHaupt() {
        if (this.selectedHauptKlasse) {
            console.log("Haut Klassen geählt: " + this.selectedHauptKlasse);
            if (!this.selectedHauptumfrage) {
                this.messageService.add({ severity: 'warning', summary: "Warnung", detail: "Keine Umfrage gewählt!" });
            }
            else {
                this.displayHaupt = true;
                this.evalservice.getEvaluation(this.polltype, this.selectedHauptumfrage._id, this.selectedHauptKlasse).subscribe(
                    data => {
                        console.log("Empfange Auswertung: " + JSON.stringify(data));
                        let evaluation: EvalResult[];
                        evaluation = data;
                        this.modelHauptgruppen = [];
                        this.modelHauptgruppen = this.generateDatamodel(evaluation);
                        this.displayHaupt = false;
                    },
                    err => {
                        console.log("Fehler!! " + JSON.stringify(err));
                    }
                );
            }
        }

    }

    startVergleich() {
        if (this.selectedVergleichsklasse) {
            console.log("Vergleichs Klassen gewählt: " + this.selectedVergleichsklasse);
            if (!this.selectedVergleichsumfrage) {
                this.messageService.add({ severity: 'warning', summary: "Warnung", detail: "Keine Umfrage gewählt!" });
            }
            else {
                this.displayVergleich = true;
                this.evalservice.getEvaluation(this.polltype, this.selectedVergleichsumfrage._id, this.selectedVergleichsklasse).subscribe(
                    data => {
                        console.log("Empfange Auswertung: " + JSON.stringify(data));
                        let evaluation: EvalResult[];
                        evaluation = data;
                        this.modelVergleichsgruppen = [];
                        this.modelVergleichsgruppen = this.generateDatamodel(evaluation);
                        this.displayVergleich = false;
                    },
                    err => {
                        console.log("Fehler!! " + JSON.stringify(err));
                    }
                );

            }
        }
    }

    generateDatamodel(evaluation: EvalResult[]) {
        var theModel: PieModel[] = [];

        var labels: string[] = [];
        this.answers.forEach(element => {
            labels.push(element.text);
        });
        this.questions.forEach(element => {
            var pdata: PieModel = new PieModel(labels);
            theModel.push(pdata);
        });
        var n = 0;
        if (evaluation) {
            evaluation.forEach(evalElement => {
                var sum=0;
                var number=0;
                console.log("Bearbeite Frage " + evalElement._id + " mit text:" + evalElement.text);
                theModel[n].datasets[0].data = [];
                this.answers.forEach(element => {
                    var foundCount = this.findCount(evalElement, element.item);
                    if (element.item>0) {
                        sum+=element.item*foundCount;
                        number+=foundCount;
                    }
                    theModel[n].datasets[0].data.push(foundCount);
                });
                theModel[n].totalCount=number;
                theModel[n].average=Math.round((sum/number) * 100) / 100;
                //console.log("Antworten sind: " + JSON.stringify(theModel[n].datasets[0].data));
                n++;
            });
        }

        return theModel;
    }

    findCount(ev: EvalResult, itemToFind: number) {
        var out: number = 0;
        ev.evaluation.forEach(element => {
            if (element.item == itemToFind) {
                out = element.count;
            }
        });
        return out;
    }


    pollHauptgruppeSelected() {
        if (this.selectedHauptumfrage) {
            console.log("Wähle Hauptgruppe " + this.selectedHauptumfrage);
            if (this.selectedHauptumfrage.enable) {
                this.messageService.add({ severity: 'warning', summary: this.selectedHauptumfrage._id, detail: "ist noch aktiv!" });                
            }
            this.evalservice.getCourses(this.polltype, this.selectedHauptumfrage._id).subscribe(
                data => {
                    console.log("Liste der Kurse f. die Hauptgruppe Umfrage:" + JSON.stringify(data));
                    this.coursesHauptgruppe = [
                        // { label: 'Klasse auswählen', value: null }
                    ];
                    this.selectedHauptKlasse = this.coursesHauptgruppe[0];
                    if (data.length == 0) {
                        this.messageService.add({ severity: 'warning', summary: this.selectedHauptumfrage._id, detail: "enthält keine Klassen" });

                    }
                    else {
                        var n = 0;
                        data.forEach(element => {
                            var obj = { label: element, value: element };
                            this.coursesHauptgruppe.push(obj);
                            n++;
                        });
                    }
                },
                err => {
                    console.log("Fehler!! " + JSON.stringify(err));
                }
            );
        }
    }
    pollVergleichsgruppeSelected() {
        if (this.selectedVergleichsumfrage) {
            console.log("Wähle Vergleichsgruppe " + this.selectedVergleichsumfrage._id);
            if (this.selectedVergleichsumfrage.enable) {
                this.messageService.add({ severity: 'warning', summary: this.selectedVergleichsumfrage._id, detail: "ist noch aktiv!" });                
            }
            this.evalservice.getCourses(this.polltype, this.selectedVergleichsumfrage._id).subscribe(
                data => {
                    console.log("Liste der Kurse f. die Vergleichsgruppe Umfrage:" + JSON.stringify(data));
                    this.coursesVergleichsgruppe = [
                    ];
                    this.selectedVergleichsklasse = this.coursesVergleichsgruppe[0];
                    if (data.length == 0) {
                        this.messageService.add({ severity: 'warning', summary: this.selectedVergleichsumfrage._id, detail: "enthält keine Klassen" });
                    }
                    else {
                        var n = 0;
                        data.forEach(element => {
                            var obj = { label: element, value: element };
                            this.coursesVergleichsgruppe.push(obj);
                            n++;
                        });
                    }
                },
                err => {
                    console.log("Fehler!! " + JSON.stringify(err));
                }
            );
        }
    }
    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.titel = params['polltype'];
            console.log("polltype=" + params["polltype"]);
            this.polltype = params["polltype"];
            this.evalservice.getPolls(this.polltype).subscribe(
                data => {
                    console.log("Liste der Umfragen: " + JSON.stringify(data));
                    if (data.length == 0) {
                        this.router.navigate(["/notfound"]);
                    }
                    this.umfragen = [
                        //  { label: 'Umfrage Auswählen', value: null }
                    ];
                    data.forEach(element => {
                        this.umfragen.push(element);
                    });
                },
                err => {
                    console.log("Fehler " + JSON.stringify(err));
                    this.router.navigate(["/notfound"]);
                }
            );
            this.pollservice.getQuestions(this.polltype).subscribe(
                data => {
                    console.log("Die Fragen" + JSON.stringify(data));

                    if (data.length == 0) {
                        this.messageService.add({ severity: 'error', summary: 'Voting', detail: "Der Umfragetyp enthält keine Fragen" });
                    }
                    this.pollservice.getAnswers(this.polltype).subscribe(
                        data2 => {
                            data.forEach(element => {
                                this.questions.push(new Question(""+element._id,""+element.text));
                            });
                            this.answers = data2;
                            if (data2.length == 0) {
                                this.messageService.add({ severity: 'error', summary: 'Voting', detail: "Der Umfragetyp enthält keine Antwortskalen" });
                            }
                            else {
                                this.modelVergleichsgruppen = this.generateDatamodel(null);
                                this.modelHauptgruppen = this.generateDatamodel(null);
                                //console.log("Hauptgruppe="+JSON.stringify(this.modelHauptgruppen,null,4)); 
                                this.questionData=new Array(this.questions.length);                               
                            }
                        },
                        err => {
                            console.log("Fehler loadAnswer()");
                        }
                    );
                    
                },
                err => {
                    console.log("Fehler loadquestionModel()");
                }
            );
            
        });
       
    }

    showHelp() {
        this.displayHilfe=true;
    }
}