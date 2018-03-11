import { Injectable } from "@angular/core";
import * as config from '../../../config';
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
        headers.append("Secret", config.Secret);
        headers.append("Content-Type", "application/json;  charset=UTF-8");

        this.url = config.SERVER + "quest/" + encodeURIComponent(polltype) + "/" + encodeURIComponent(id);
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
        headers.append("Secret", config.Secret);
        headers.append("Content-Type", "application/json;  charset=UTF-8");

        this.url = config.SERVER + "questions/" + encodeURIComponent(polltype);
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
        headers.append("Secret", config.Secret);
        headers.append("Content-Type", "application/json;  charset=UTF-8");

        this.url = config.SERVER + "answers/" + encodeURIComponent(polltype);
        console.log("get Answers  URL=" + this.url);
        return this.http.get(this.url, { headers: headers })
            .map(this.extractData)
            .catch(this.handleError);
    }

    /**
     * Eine Antwort senden
     * @param polltype Der Umfragetyp
     * @param id Die ID des Teilnehmers
     * @param questionID Die ID der Frage
     * @param answer Der Item Wert
     */
    setAnswer(polltype: string, id: string, questionID: string,answer:number) {
        var headers = new Headers();
        headers.append("Secret", config.Secret);
        headers.append("Content-Type", "application/json;  charset=UTF-8");
        this.url = config.SERVER + "quest/" + encodeURIComponent(polltype);
        var body = {
            "_id": id,
            "question": questionID,
            "answer": answer
        }
        console.log("Sende zum Server: "+JSON.stringify(body));
        
        return this.http.put(this.url,JSON.stringify(body),{ headers: headers })
            .map(this.extractData)
            .catch(this.handleError);

    }

    /**
     * Neuen Teilnehmer anlegen
     * @param polltype Der Umfragetyp
     * @param id Die ID des Teilnehmers
     * @param course Der Kurs des teilnehmers
     * @param poll Der name der Umfrage
     */
    newSubscriber(polltype: string, id: string, course: string,poll: string) {
        var headers = new Headers();
        headers.append("Secret", config.Secret);
        headers.append("Content-Type", "application/json;  charset=UTF-8");
        this.url = config.SERVER + "quest/" + encodeURIComponent(polltype);
        var body = {
            "_id": id,
            "course": course,
            "poll": poll
        }
        console.log("Sende zum Server: "+JSON.stringify(body));
        
        return this.http.post(this.url,JSON.stringify(body),{ headers: headers })
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
        console.error("errMsg="+errMsg);
        return Observable.throw(errMsg);
    }
}