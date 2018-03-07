var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var router = express.Router();
var dbname = "umfrage"
var collectionName = "antworten"
var url = "mongodb://localhost:27017/";
var dbo;
var config = require('../../config')
var uuid = require('uuid');

var ids = new Array();

// Connect to the db
MongoClient.connect(url, function (err, db) {
  if (!err) {
    console.log("We are connected to " + url);
    dbo = db.db(dbname);
  }
});

console.log('config ist ' + JSON.stringify(config));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Umfrageserver ' + config.Version + ' is running..!!' });
});

/**
 * Bisherige ANtworten des Teilnehmers abfragen
 */
router.get('/quest/:polltype/:id', function (req, res, next) {
  console.log('GET Quest empfangen ID=' + req.params.id + "  Polltype=" + req.params.polltype);
  console.log("Header Secret:" + req.header("secret"));

  res.setHeader('Content-Type', 'application/json');
  if (req.header("secret") != config.Secret) {
    res.sendStatus(403);
    return;
  }


  returnObj = {
    success: false,
    msg: "No message"
  }
  var query = { _id: req.params.id };
  dbo.collection("R" + req.params.polltype).find(query).toArray(function (err, result) {
    if (err) {
      console.log("Recieve Error:!" + err);
      returnObj.msg = "GET failed " + err;
      res.send(JSON.stringify(returnObj));
    }
    else {
      if (result.length == 0) {
        res.sendStatus(404);
      }
      else {
        // Schauen um die Umfrage enabled ist
        query = { _id: result[0].poll };
        dbo.collection("C" + req.params.polltype).find(query).toArray(function (err, r2) {
          if (err) {
            console.log('Fehler beim Suchen der Umfrage ' + result[0].poll + ' !');
            // Ist die Umfrage nicht Aktiv wird status Code 204 = no data zurück gesendet!
            res.sendStatus(404);
          }
          else {
            console.log(r2);
            if (r2[0] && r2[0].enable) {
              res.send(JSON.stringify(result));
            }
            else {
              console.log('Die Umfrage ' + result[0].poll + ' ist nicht aktiv');
              // Ist die Umfrage nicht Aktiv wird status Code 204 = no data zurück gesendet!
              res.sendStatus(204);
            }
          }
        });
      }
    }
    console.log(result);

  });
})


/**
 * Neuen Teilnehmer eintragen
 */
router.post('/quest/:polltype', function (req, res) {
  console.log("POST quest Empfangen mit BODY=" + JSON.stringify(req.body));
  console.log('Polltype ist ' + req.params.polltype);
  console.log("Header Secret:" + req.header("secret"));

  res.setHeader('Content-Type', 'application/json');
  if (req.header("secret") != config.Secret) {
    res.sendStatus(403);
    return;
  }
  if (!req.body._id) {
    console.log("_id missing");
    res.sendStatus(400);
    return;
  }
  if (!req.body.course) {
    console.log("course missing");
    res.sendStatus(400);
    return;
  }
  if (!req.body.poll) {
    console.log("poll missing");
    res.sendStatus(400);
    return;
  }
  if (!req.body.antworten) {
    console.log("antworten missing");
    var antworten = [];
    req.body.antworten = antworten;
    console.log("Body ist nun " + JSON.stringify(req.body));
  }



  returnObj = {
    success: false,
    msg: "No message"
  }
  dbo.collection("R" + req.params.polltype).insertOne(req.body, function (err, dbres) {
    if (err) {
      console.log("Recieve Error:" + err);
      returnObj.msg = "Insert failed " + err;
      res.send(JSON.stringify(returnObj));
    }
    else {
      console.log("1 document inserted");
      returnObj.success = true;
      returnObj.msg = " Insert Data Sucessfull";
      res.send(JSON.stringify(returnObj));
    }
  })
})

/**
 * Authentifizierung 
 */
router.post('/polls/:polltype/:poll', function (req, res) {
  console.log("POST Auth mit BODY=" + JSON.stringify(req.body));
  console.log('Polltype ist ' + req.params.polltype);
  console.log('poll ist ' + req.params.poll);
  console.log("Header Secret:" + req.header("secret"));
  res.setHeader('Content-Type', 'application/json');
  if (req.header("secret") != config.Secret) {
    res.sendStatus(403);
    return;
  }
  dbo.collection("C" + req.params.polltype).find({ _id: req.params.poll }).toArray(function (err, result) {
    if (err) {
      console.log("Recieve Error:" + err);
    }
    else {
      console.log("Abfrage ergab Daten: " + JSON.stringify(result));
      if (req.body.password == result[0].password) {
        console.log('Kennwort OK');
        var id = uuid.v4();
        ids.push(id);
        obj = {
          success: true,
          secret: id
        }
        res.send(JSON.stringify(obj));
      }
      else {
        console.log('Kennwort falsch');
        res.sendStatus(403);
        return;
      }
    }
  })
})


/**
 * Frage aktualisieren bzw. (wenn nicht existiert einfügen)
 */
router.put('/quest/:polltype', function (req, res) {
  console.log("PUT Empfangen mit BODY=" + JSON.stringify(req.body)) + " Polltype=" + req.params.polltype;
  console.log("Header Secret:" + req.header("secret"));

  res.setHeader('Content-Type', 'application/json');
  if (req.header("secret") != config.Secret) {
    res.sendStatus(403);
    return;
  }
  if (!req.body._id) {
    console.log("_id missing");
    res.sendStatus(400);
    return;
  }
  if (!req.body.question) {
    console.log("question missing");
    res.sendStatus(400);
    return;
  }
  if (!req.body.answer) {
    console.log("answer missing");
    res.sendStatus(400);
    return;
  }


  returnObj = {
    success: false,
    msg: "No message"
  }
  console.log("Prüfe ob Datensatz _id=" + req.body._id + " einen Eintrag in antworten hat mit Frage (" + req.body.question + ")");
  dbo.collection("R" + req.params.polltype).find({ antworten: { $elemMatch: { question: req.body.question } }, _id: req.body._id }).toArray(function (err, result) {
    if (err) {
      console.log("Recieve Error:" + err);
    }
    else {
      console.log("Abfrage ergab Daten: " + JSON.stringify(result));
      if (result && result.length > 0 && 'antworten' in result[0]) {
        console.log("Frage existiert, also update");
        dbo.collection("R" + req.params.polltype).updateOne({ _id: req.body._id, "antworten.question": req.body.question },
          {
            $set: { "antworten.$.answer": req.body.answer }

          }
          , function (err, result) {
            if (err) {
              console.log("Recieve Error:" + err);
              returnObj.msg = "Update failed " + err;
              res.send(JSON.stringify(returnObj));
              return;
            }
            else {
              console.log("1 Datensatz aktualisiet");
              returnObj.success = true;
              returnObj.msg = " Update Data Sucessfull";
              res.send(JSON.stringify(returnObj));
              return;
            }
          });
      }
      else {
        console.log("Frage existiert nicht also anfügen an " + req.body._id);
        dbo.collection("R" + req.params.polltype).updateOne(
          { _id: req.body._id },
          {
            $addToSet: {
              antworten: { question: req.body.question, answer: req.body.answer }
            }
          }, function (err, result) {

            if (err) {
              console.log("Recieve Error:" + err);
              returnObj.msg = "Append failed " + err;
              res.send(JSON.stringify(returnObj));
              return;
            }
            else {
              console.log("1 Datensatz angefügt result=" + result);
              rObj = JSON.parse(result);
              if (rObj.nModified == 0) {
                returnObj.success = false;
                returnObj.msg = " No Data was append " + result;

              }
              else {
                returnObj.success = true;
                returnObj.msg = " Append Data Sucessfull " + result;
              }
              res.send(JSON.stringify(returnObj));
              return;
            }
          });

      }
    }
  });

})


/**
 * Alle Klassen einer Umfrage abfragen
 */
router.get('/courses/:polltype/:poll', function (req, res, next) {
  console.log('GET Courses from poll ' + req.params.poll + " polltype=" + req.params.polltype);
  console.log("Header Secret:" + req.header("secret"));
  res.setHeader('Content-Type', 'application/json');

  // Abfragen ob ein Kennwort benötigt wird
  dbo.collection("C" + req.params.polltype).find({ _id: req.params.poll }).toArray(function (err, result) {
    if (err) {
      console.log("Recieve Error:" + err);
    }
    else {
      console.log("returns " + JSON.stringify(result));
      if ('password' in result[0]) {
        console.log('Es wird ein Kennwort benötigt');
        if (ids.indexOf(req.header("secret")) == -1) {
          console.log('Secret unbekannt');
          res.sendStatus(403);
          return;
        }
      }
      else {
        console.log("Es wird kein Kennwort benötigt, also default key");
        if (req.header("secret") != config.Secret) {
          res.sendStatus(403);
          return;
        }
      }
      dbo.collection("R" + req.params.polltype).distinct("course", { poll: req.params.poll }, function (err, result) {
        if (err) {
          console.log("Recieve Error:" + err);
        }
        else {
          console.log("Get Courses returns " + JSON.stringify(result));
          res.send(JSON.stringify(result));
        }
      })
    }
  })
})

/**
 * Alle Umfragen abfragen
 */
router.get('/polls/:polltype', function (req, res, next) {
  console.log('GET Polls von polltype=' + req.params.polltype);
  console.log("Header Secret:" + req.header("secret"));

  res.setHeader('Content-Type', 'application/json');
  if (req.header("secret") != config.Secret) {
    res.sendStatus(403);
    return;
  }

  dbo.collection("C" + req.params.polltype).find().toArray(function (err, result) {
    if (err) {
      console.log("Recieve Error:" + err);
    }
    else {
      console.log("Get Courses returns " + JSON.stringify(result));
      result.forEach(element => {
        if (element.password) {
          delete element.password;
          element["passwordRequired"] = true;
        }
      });
      res.send(JSON.stringify(result));
    }
  })
})

/**
 * Alle Fragen abfragen
 */
router.get('/questions/:polltype', function (req, res, next) {
  console.log('GET Questions polltype=' + req.params.polltype);
  console.log("Header Secret:" + req.header("secret"));

  res.setHeader('Content-Type', 'application/json');
  if (req.header("secret") != config.Secret) {
    res.sendStatus(403);
    return;
  }

  dbo.collection("Q" + req.params.polltype).find().toArray(function (err, result) {
    if (err) {
      console.log("Recieve Error:" + err);
    }
    else {
      console.log("Get questions returns " + JSON.stringify(result));
      res.send(JSON.stringify(result));
    }
  })
})

/**
 * Alle Antworten abfragen
 */
router.get('/answers/:polltype', function (req, res, next) {
  console.log('GET Answers polltype=' + req.params.polltype);
  console.log("Header Secret:" + req.header("secret"));

  res.setHeader('Content-Type', 'application/json');
  if (req.header("secret") != config.Secret) {
    res.sendStatus(403);
    return;
  }

  dbo.collection("A" + req.params.polltype).find().toArray(function (err, result) {
    if (err) {
      console.log("Recieve Error:" + err);
    }
    else {
      console.log("Get answers returns " + JSON.stringify(result));
      res.send(JSON.stringify(result));
    }
  })
})


/**
 * Umfrage auswerten Format /evaluate/{polltype}/{poll}/{course}
 * Wobei {poll} und {course} als RegEx interpretiert werden
 */
router.get('/evaluate/:polltype/:poll/:course', function (req, res, next) {
  console.log('GET Evaluate for polltype=' + req.params.polltype + ' poll=' + req.params.poll + " with pattern " + req.params.course);
  console.log("Header Secret:" + req.header("secret"));

  res.setHeader('Content-Type', 'application/json');


  // Abfragen ob ein Kennwort benötigt wird
  dbo.collection("C" + req.params.polltype).find({ _id: req.params.poll }).toArray(function (err, result) {
    if (err) {
      console.log("Recieve Error:" + err);
    }
    else {
      console.log("returns " + JSON.stringify(result));
      if ('password' in result[0]) {
        console.log('Es wird ein Kennwort benötigt');
        if (ids.indexOf(req.header("secret")) == -1) {
          console.log('Secret unbekannt');
          res.sendStatus(403);
          return;
        }
      }
      else {
        console.log("Es wird kein Kennwort benötigt, also default key");
        if (req.header("secret") != config.Secret) {
          res.sendStatus(403);
          return;
        }
      }
      /**
       * db.antworten.aggregate([
        {$match: {"course":/FI/}},
        {$unwind: "$antworten"},
        {$group: {_id: "$antworten",count:{$sum:1}}},
        {$sort: {_id: 1}}   
        ])
      */
      var questionlist;
      dbo.collection("Q" + req.params.polltype).find().toArray(function (err, result) {
        if (err) {
          console.log("Recieve Error:" + err);
        }
        else {
          console.log("Get questions returns " + JSON.stringify(result));
          questionlist = result;
          console.log('Fragenliste umfasst ' + questionlist.length + " Fragen");
          dbo.collection("R" + req.params.polltype).aggregate(
            [
              { $match: { "course": { $regex: req.params.course }, "poll": { $regex: req.params.poll } } },
              { $unwind: "$antworten" },
              { $group: { _id: "$antworten", count: { $sum: 1 } } },
              { $sort: { _id: 1 } }
            ]
          ).toArray(function (err, result) {
            if (err) {
              console.log("Recieve Error:" + err);
            }
            else {
              questionlist.forEach(element => {
                element.evaluation = [];
              });
              r = joinResults(result, questionlist);
              res.send(JSON.stringify(r));
            }
          })
        }
      })
    }
  })
})


function joinResults(resultlist, qList) {
  resultlist.forEach(element => {
    console.log('---- Suche Frage ' + element._id.question);
    found = qList.filter(function (question) { return question._id === element._id.question });
    console.log('found ' + JSON.stringify(found));
    if (found.length != 0) {
      if (!found[0].evaluation) {
        found[0]['evaluation'] = [];
        console.log('Attribut Evaluation angehangen' + JSON.stringify(found));
      }
      obj = {
        item: element._id.answer,
        count: element.count
      }
      found[0].evaluation.push(obj);
      console.log('found ist nun ' + JSON.stringify(found));
    }
  });
  return qList;
}

module.exports = router;