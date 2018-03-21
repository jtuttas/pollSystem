import { Component, OnInit } from "@angular/core";
import { UUID } from 'angular2-uuid';
import { MessageService } from "primeng/components/common/messageservice";
import { PollService } from "./PollService";
import { Message } from 'primeng/api';
@Component({
    selector: 'eval',
    templateUrl: './demo.component.html',
    styleUrls: ['./demo.component.css']
})
export class DemoComponent {
    polltype:string="bho";
    course:string="testklasse"
    id:string=UUID.UUID();
    poll: string="DemoUmfrage"
    display: boolean=false;
    msgs: Message[] = [];

    constructor(private messageService: MessageService, private pollservice: PollService) {
    }

    newKey() {
        this.id=UUID.UUID();
        this.display=false;
    }

    generate() {

        this.display=false;
        this.pollservice.newSubscriber(this.polltype,this.id,this.course,this.poll).subscribe(
            data => {
                console.log("Receive:"+JSON.stringify(data));
                if (data.success) {
                    console.log("Zeige Success!");                    
                    this.messageService.add({ severity: 'success', summary: "Erfolgreich", detail: "Der Teilnehmer wurde angelegt" });
                    this.display=true;
                }
                else {
                    this.messageService.add({ severity: 'error', summary: "Fehler", detail: data.msg });
                }                
            },
            err => {
                console.log("Fehler:"+err);
            }
        )
    }
}