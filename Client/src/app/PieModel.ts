import { Question } from "./Question";

export class PieModel {
    labels:string[]=[];
    totalCount:number=0;
    average:number=0;
    datasets:Dataset[]=[new Dataset()];

    constructor(items:string[]) {
        if (items) {
            items.forEach(element => {
                this.labels.push(element);
            });
        }
    }
}

export class Dataset{
    data:number[]=[]
    backgroundColor:string[]= [
        "#FF6384",
        "#36A2EB",
        "#FFCE56"
    ]
    hoverBackgroundColor:string[]= [
        "#FF6384",
        "#36A2EB",
        "#FFCE56"
    ]
}