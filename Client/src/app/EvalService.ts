import { Injectable } from "@angular/core";
import { Config } from "./Config";
import { Http, Headers, Response } from "@angular/http";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class EvalService {
    url: any;
    constructor(private http: Http) {
    }

    /**
     * Abfrage der Umfragen die zu dem Polltype vorhanden sind
     * @param polltype 
     */
    getPolls(polltype: string) {
        var headers = new Headers();
        headers.append("secret", Config.SECRET);
        headers.append("Content-Type", "application/json;  charset=UTF-8");

        this.url = Config.SERVER + "polls/" + polltype ;
        console.log("get Polls Results  URL=" + this.url);
        return this.http.get(this.url, { headers: headers })
            .map(this.extractData)
            .catch(this.handleError);
    }

    /**
     * Anbfrage der Klassen, die an der Umfrage eingeladen wurden
     * @param polltype Der Polltype 
     * @param poll Die Umfrage
     */
    getCourses(polltype: string,poll:string) {
        var headers = new Headers();
        headers.append("secret", Config.SECRET);
        headers.append("Content-Type", "application/json;  charset=UTF-8");

        this.url = Config.SERVER + "courses/" + polltype+"/"+poll ;
        console.log("get Courses Results  URL=" + this.url);
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
        console.error("errMsg="+errMsg);
        return Observable.throw(errMsg);
    }

}