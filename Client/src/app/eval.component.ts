import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import { EvalService } from './EvalService';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Message } from 'primeng/api';
import { PollService } from './PollService';
import { Question } from './Question';
import { SelectItem } from 'primeng/api';
import {DialogModule} from 'primeng/dialog';

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
    questions: Question[];
    selectedHauptumfrage: any;
    selectedVergleichsumfrage: any;
    umfragen: SelectItem[];
    coursesHauptgruppe: SelectItem[]= new Array();
    coursesVergleichsgruppe: SelectItem[] = new Array();
    selectedHauptKlasse: any;
    selectedVergleichsklasse: any;
    displayHaupt: boolean = false;
    displayVergleich: boolean = false;

    constructor(private messageService: MessageService, private route: ActivatedRoute, private pollservice: PollService, private evalservice: EvalService, private router: Router) {

    }

    startHaupt() {
        if (this.selectedHauptKlasse) {
            console.log("Haut Klassen geählt: " + this.selectedHauptKlasse);
            if (!this.selectedHauptumfrage) {
                this.messageService.add({ severity: 'warning', summary: "Warnung", detail: "Keine Umfrage gewählt!" });
            }
            else {
                this.displayHaupt=true;
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
                this.displayVergleich=true;
            }
        }

    }
    pollHauptgruppeSelected() {
        if (this.selectedHauptumfrage) {
            console.log("Wähle Hauptgruppe " + this.selectedHauptumfrage);
            this.evalservice.getCourses(this.polltype, this.selectedHauptumfrage).subscribe(
                data => {
                    console.log("Liste der Kurse f. die Hauptgruppe Umfrage:" + JSON.stringify(data));
                    this.coursesHauptgruppe = [
                       // { label: 'Klasse auswählen', value: null }
                    ];
                    this.selectedHauptKlasse=this.coursesHauptgruppe[0];
                    if (data.length == 0) {
                        this.messageService.add({ severity: 'warning', summary: this.selectedHauptumfrage, detail: "enthält keine Klassen" });
                        
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
            console.log("Wähle Vergleichsgruppe " + this.selectedVergleichsumfrage);
            this.evalservice.getCourses(this.polltype, this.selectedVergleichsumfrage).subscribe(
                data => {
                    console.log("Liste der Kurse f. die Vergleichsgruppe Umfrage:" + JSON.stringify(data));
                    this.coursesVergleichsgruppe = [
                       // { label: 'Klasse auswählen', value: null }
                    ];
                    this.selectedVergleichsklasse=this.coursesVergleichsgruppe[0];
                    if (data.length == 0) {
                        this.messageService.add({ severity: 'warning', summary: this.selectedVergleichsumfrage, detail: "enthält keine Klassen" });
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
                    var n = 0;
                    data.forEach(element => {
                        var obj = { label: element, value: element };
                        //console.log("Füge Umfrage hinzu:" + JSON.stringify(obj));

                        this.umfragen.push(obj);
                        n++;
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
                    this.questions = data;
                    if (data.length == 0) {
                        this.messageService.add({ severity: 'error', summary: 'Voting', detail: "Der Umfragetyp enthält keine Fragen" });
                    }
                },
                err => {
                    console.log("Fehler loadQuestions()");
                }
            );
        });

    }
}