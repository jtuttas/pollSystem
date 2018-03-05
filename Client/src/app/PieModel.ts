export class PieModel {
    labels:string[]=[];
    datasets:Dataset[]=[new Dataset()];
}

export class Dataset{
    data:number[]=[1,2,3,4,5,6]
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