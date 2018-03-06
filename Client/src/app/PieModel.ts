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
        "#F44336",
        "#9C27B0",
        "#2196F3",
        "#009688",
        "#CDDC39",
        "#FFEB3B",
        "#FFC107",
        "#FF5722"
    ]
    hoverBackgroundColor:string[]= [
        "#F44336",
        "#9C27B0",
        "#2196F3",
        "#009688",
        "#CDDC39",
        "#FFEB3B",
        "#FFC107",
        "#FF5722"
    ]
}