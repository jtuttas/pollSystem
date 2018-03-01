import { Injectable } from "@angular/core";
import { Config } from "./Config";
import { Http, Headers, Response } from "@angular/http";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
@Injectable()
export class PollService {
    url: any;

    constructor(private http: Http) {
    }
    /**
     * Bisherige Abstimmung des Teilnehmer holen
     * @param polltype Der Type der Umfrage
     * @param id Die ID des Teilnehmers
     */
    getLatestPoll(polltype: string, id: string) {
        var headers = new Headers();
        headers.append("secret", Config.SECRET);
        headers.append("Content-Type", "application/json;  charset=UTF-8");

        this.url = Config.SERVER + "quest/" + polltype + "/" + id;
        console.log("get Poll Results  URL=" + this.url);
        return this.http.get(this.url, { headers: headers })
            .map(this.extractData)
            .catch(this.handleError);
    }

     /**
     * Fragen der Umfrage laden
     * @param polltype Der Type der Umfrage
     */
    getQuestions(polltype: string) {
        var headers = new Headers();
        headers.append("secret", Config.SECRET);
        headers.append("Content-Type", "application/json;  charset=UTF-8");

        this.url = Config.SERVER + "questions/" + polltype;
        console.log("get Questions  URL=" + this.url);
        return this.http.get(this.url, { headers: headers })
            .map(this.extractData)
            .catch(this.handleError);
    }

     /**
     * Antwortskalen der Umfrage laden
     * @param polltype Der Type der Umfrage
     */
    getAnswers(polltype: string) {
        var headers = new Headers();
        headers.append("secret", Config.SECRET);
        headers.append("Content-Type", "application/json;  charset=UTF-8");

        this.url = Config.SERVER + "answers/" + polltype;
        console.log("get Answers  URL=" + this.url);
        return this.http.get(this.url, { headers: headers })
            .map(this.extractData)
            .catch(this.handleError);
    }


    private extractData(res: Response) {
        console.log("Receive Data: " + JSON.stringify(res.json()));
        let body = res.json();
        return body;
    }

    private handleError(error: Response | any) {
        // In a real world app, you might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}