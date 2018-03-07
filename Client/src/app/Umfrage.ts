import { EvalService } from "./EvalService";
import { SelectItem } from 'primeng/api';

export class Umfrage {
    _id:string;
    enable: boolean;
    passwordRequired: boolean;
    secret:string;

    constructor(private evalservice:EvalService) {

    }


    
}