function joinResults(resultlist,questionliste) {
    resultlist.forEach(element => {
        console.log('---- Suche Frage '+element._id.question);
        found=questionliste.filter(function(question){ return question._id === element._id.question}); 
        console.log('found '+JSON.stringify(found));
        if (found) {
            if (!found[0].evaluation) {             
                found[0]['evaluation'] = [];
                console.log('Attribut Evaluation angehangen'+JSON.stringify(found));
            }
            obj={
                item:element._id.answer,
                count:element.count
            }
            found[0].evaluation.push(obj);
            console.log('found ist nun '+JSON.stringify(found));
        }
    });
    return questionliste;
}

results = [
    {
      "_id": {
        "question": "Frage1",
        "answer": 1
      },
      "count": 1
    },
    {
      "_id": {
        "question": "Frage1",
        "answer": 3
      },
      "count": 1
    },
    {
      "_id": {
        "question": "Frage2",
        "answer": 2
      },
      "count": 2
    },
    {
      "_id": {
        "question": "Frage3",
        "answer": 1
      },
      "count": 1
    },
    {
      "_id": {
        "question": "Frage3",
        "answer": 3
      },
      "count": 1
    }
  ]

  questions = [
    {
      "_id": "Frage1",
      "text": "Wie findest Du die Schule?"
    },
    {
      "_id": "Frage2",
      "text": "Wie findest Du den Unterricht?"
    },
    {
      "_id": "Frage3",
      "text": "Wie findest Du den Lehrer?"
    },
    {
      "_id": "Frage4",
      "text": "Eine Frage mit Umlauten öäü?"
    }
  ]

  r=joinResults(results,questions);
  console.log('Result Object ist nun: '+JSON.stringify(r,null,2));