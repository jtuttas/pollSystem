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
import { PasswordModule } from 'primeng/password';
@Component({
    selector: 'eval',
    templateUrl: './eval.component.html',
    styleUrls: ['./eval.component.css']
})
export class EvalComponent implements OnInit {
    titel: string = "?";
    sub: any;
    polltype: string;
    msgs: Message[] = [];
    answers: Answer[];
    questions: Question[] = [];

    questionData: Question[] = [];

    selectedHauptumfrage: Umfrage;
    selectedVergleichsumfrage: Umfrage;
    selectedUmfrage: Umfrage;
    umfragen: Umfrage[];
    coursesHauptgruppe: SelectItem[] = new Array();
    coursesVergleichsgruppe: SelectItem[] = new Array();
    selectedHauptKlasse: any;
    selectedVergleichsklasse: any;
    displayHaupt: boolean = false;
    displayVergleich: boolean = false;
    displayHilfe: boolean = false;
    displayAuth: boolean = false;
    modelHauptgruppen: PieModel[] = [];
    modelVergleichsgruppen: PieModel[] = [];
    password: string = "";


    constructor(private messageService: MessageService, private route: ActivatedRoute, private pollservice: PollService, private evalservice: EvalService, private router: Router) {
    }

    cancel() {
        console.log("Cancel");

        this.displayAuth = false;
        if (this.selectedUmfrage === this.selectedHauptumfrage) {
            console.log("War Hauptumfrage");
            delete this.selectedHauptumfrage;
        }
        else {
            console.log("War Vergleichsumfrage");
            delete this.selectedVergleichsumfrage;

        }
    }

    auth() {
        console.log("Auth for Password=" + this.password);
        this.evalservice.auth(this.polltype, this.selectedUmfrage._id, this.password).subscribe(
            data => {
                console.log("Auth receive:" + JSON.stringify(data));
                this.displayAuth = false;
                this.selectedUmfrage.secret = data.secret;
                console.log("Selected Umfrage=" + JSON.stringify(this.selectedUmfrage));

                this.getCourses(this.polltype, this.selectedUmfrage,
                    data => {
                        if (this.selectedUmfrage === this.selectedHauptumfrage) {
                            console.log("War Hauptumfrage");
                            this.coursesHauptgruppe = data;

                        }
                        else {
                            console.log("War Vergleichsumfrage");
                            this.coursesVergleichsgruppe = data;
                        }
                    },
                    err => {
                        console.log("Fehler:" + err);
                        this.messageService.add({ severity: 'warning', summary: this.selectedUmfrage._id, detail: err });
                    }
                );
            },
            err => {
                console.log("Auth Error:" + JSON.stringify(err));
                this.displayAuth = false;
                if (this.selectedUmfrage === this.selectedHauptumfrage) {
                    console.log("War Hauptumfrage");
                    delete this.selectedHauptumfrage;
                }
                else {
                    console.log("War Vergleichsumfrage");
                    delete this.selectedVergleichsumfrage;

                }
                this.messageService.add({ severity: 'error', summary: "Fehler", detail: "Das Kennwort ist falsch!" });

            }
        )
    }

    getCourses(polltype: string, umfrage: Umfrage, set: Function, err: Function) {
        this.evalservice.getCourses(polltype, umfrage._id, umfrage.secret).subscribe(
            data => {
                console.log("Liste der Kurse f. die Hauptgruppe Umfrage:" + JSON.stringify(data));
                var result: SelectItem[] = [];
                if (data.length == 0) {
                    err("enthält keine Klassen");
                }
                else {
                    data.forEach(element => {
                        var obj = { label: element, value: element };
                        result.push(obj);
                    });
                }
                console.log("result=" + JSON.stringify(result));
                set(result);
            },
            err => {
                console.log("Fehler!! " + JSON.stringify(err));
                err(err);
            }
        );
    }
    startHaupt() {
        if (this.selectedHauptKlasse) {
            console.log("Haut Klassen geählt: " + this.selectedHauptKlasse);
            if (!this.selectedHauptumfrage) {
                this.messageService.add({ severity: 'warning', summary: "Warnung", detail: "Keine Umfrage gewählt!" });
            }
            else {
                this.displayHaupt = true;
                this.evalservice.getEvaluation(this.polltype, this.selectedHauptumfrage._id, this.selectedHauptKlasse, this.selectedHauptumfrage.secret).subscribe(
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
        else {
            if (!this.selectedHauptumfrage) {
                this.messageService.add({ severity: 'info', summary: "Info", detail: "Bitte zunächst eine Umfrage wählen!" });
            }
            else {
                this.messageService.add({ severity: 'info', summary: "Info", detail: "Bitte eine Klasse oder RegEx wählen!" });
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
                this.evalservice.getEvaluation(this.polltype, this.selectedVergleichsumfrage._id, this.selectedVergleichsklasse, this.selectedVergleichsumfrage.secret).subscribe(
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
        else {
            if (!this.selectedVergleichsumfrage) {
                this.messageService.add({ severity: 'info', summary: "Info", detail: "Bitte zunächst eine Umfrage wählen!" });
            }
            else {
                this.messageService.add({ severity: 'info', summary: "Info", detail: "Bitte eine Klasse oder RegEx wählen!" });
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
                var sum = 0;
                var number = 0;
                console.log("Bearbeite Frage " + evalElement._id + " mit text:" + evalElement.text);
                theModel[n].datasets[0].data = [];
                this.answers.forEach(element => {
                    var foundCount = this.findCount(evalElement, element.item);
                    if (element.item > 0) {
                        sum += element.item * foundCount;
                        number += foundCount;
                    }
                    theModel[n].datasets[0].data.push(foundCount);
                });
                theModel[n].totalCount = number;
                theModel[n].average = Math.round((sum / number) * 100) / 100;
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
            if (this.selectedHauptumfrage.enable) {
                this.messageService.add({ severity: 'warning', summary: this.selectedHauptumfrage._id, detail: "ist noch aktiv!" });
            }
            if (this.selectedHauptumfrage.passwordRequired && this.selectedHauptumfrage.secret == null) {
                this.displayAuth = true;
                this.selectedUmfrage = this.selectedHauptumfrage;
            }
            else {
                console.log("Wähle Hauptgruppe " + this.selectedHauptumfrage);
                this.getCourses(this.polltype, this.selectedHauptumfrage,
                    data => {
                        this.coursesHauptgruppe = data;
                    },
                    err => {
                        console.log("Fehler:" + err);
                        this.messageService.add({ severity: 'warning', summary: this.selectedHauptumfrage._id, detail: err });
                    }
                )
            }
        }
    }

    pollVergleichsgruppeSelected() {
        if (this.selectedVergleichsumfrage) {
            console.log("Wähle Vergleichsgruppe " + this.selectedVergleichsumfrage._id);
            if (this.selectedVergleichsumfrage.enable) {
                this.messageService.add({ severity: 'warning', summary: this.selectedVergleichsumfrage._id, detail: "ist noch aktiv!" });
            }
            if (this.selectedVergleichsumfrage.passwordRequired && this.selectedVergleichsumfrage.secret == null) {
                this.displayAuth = true;
                console.log("Passwortdialog anzeigen");
                this.selectedUmfrage = this.selectedVergleichsumfrage;
            }
            else {
                console.log("Kein Dialog Notwendig!");
                this.getCourses(this.polltype, this.selectedVergleichsumfrage,
                    data => {
                        this.coursesVergleichsgruppe = data;
                    },
                    err => {
                        console.log("Fehler!");
                        this.messageService.add({ severity: 'warning', summary: this.selectedVergleichsumfrage._id, detail: err });
                    }
                )
            }
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
                                this.questions.push(new Question("" + element._id, "" + element.text));
                            });
                            this.answers = data2;
                            if (data2.length == 0) {
                                this.messageService.add({ severity: 'error', summary: 'Voting', detail: "Der Umfragetyp enthält keine Antwortskalen" });
                            }
                            else {
                                this.modelVergleichsgruppen = this.generateDatamodel(null);
                                this.modelHauptgruppen = this.generateDatamodel(null);
                                //console.log("Hauptgruppe="+JSON.stringify(this.modelHauptgruppen,null,4)); 
                                this.questionData = new Array(this.questions.length);
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
        this.displayHilfe = true;
    }
}