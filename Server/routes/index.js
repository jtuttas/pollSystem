var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var router = express.Router();
var dbname = "umfrage"
var collectionName = "antworten"
var url = "mongodb://localhost:27017/";
var dbo;

// Connect to the db
MongoClient.connect(url, function (err, db) {
  if (!err) {
    console.log("We are connected to " + url);
    dbo = db.db(dbname);
  }
});


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Umfrageserver is running' });
});

/**
 * Bisherige ANtworten des Teilnehmers abfragen
 */
router.get('/quest/:id', function (req, res, next) {
  console.log('GET Quest empfangen ID=' + req.params.id);
  console.log("Header Secret:" + req.header("secret"));

  res.setHeader('Content-Type', 'application/json');
  if (req.header("secret") != "1234") {
    res.sendStatus(403);
    return;
  }

  res.setHeader('Content-Type', 'application/json');
  returnObj = {
    success: false,
    msg: "No message"
  }
  var query = { _id: req.params.id };
  dbo.collection(collectionName).find(query).toArray(function (err, result) {
    if (err) {
      console.log("Recieve Error:" + err);
      returnObj.msg = "GET failed " + err;
      res.send(JSON.stringify(returnObj));
    }
    else {
      res.send(JSON.stringify(result));
    }
    console.log(result);
  });
})


/**
 * Neuen Teilnehmer eintragen
 */
router.post('/quest/', function (req, res) {
  console.log("POST quest Empfangen mit BODY=" + JSON.stringify(req.body));
  console.log("Header Secret:" + req.header("secret"));

  res.setHeader('Content-Type', 'application/json');
  if (req.header("secret") != "1234") {
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
  dbo.collection(collectionName).insertOne(req.body, function (err, dbres) {
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
 * Frage aktualisieren bzw. (wenn nicht existiert einfügen)
 */
router.put('/quest/', function (req, res) {
  console.log("PUT Empfangen mit BODY=" + JSON.stringify(req.body));
  console.log("Header Secret:" + req.header("secret"));

  res.setHeader('Content-Type', 'application/json');
  if (req.header("secret") != "1234") {
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
  dbo.collection(collectionName).find({ antworten: { $elemMatch: { question: req.body.question } }, _id: req.body._id }).toArray(function (err, result) {
    if (err) {
      console.log("Recieve Error:" + err);
    }
    else {
      console.log("Abfrage ergab Daten: " + JSON.stringify(result));
      if (result && result.length > 0 && 'antworten' in result[0]) {
        console.log("Frage existiert, also update");
        dbo.collection(collectionName).updateOne({ _id: req.body._id, "antworten.question": req.body.question },
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
        dbo.collection(collectionName).updateOne(
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
router.get('/courses/:poll', function (req, res, next) {
  console.log('GET Courses from poll ' + req.params.poll);
  console.log("Header Secret:" + req.header("secret"));

  res.setHeader('Content-Type', 'application/json');
  if (req.header("secret") != "1234") {
    res.sendStatus(403);
    return;
  }

  dbo.collection(collectionName).distinct("course", { poll: req.params.poll }, function (err, result) {
    if (err) {
      console.log("Recieve Error:" + err);
    }
    else {
      console.log("Get Courses returns " + JSON.stringify(result));
      res.send(JSON.stringify(result));
    }
  })
})

/**
 * Alle Umfragen abfragen
 */
router.get('/polls', function (req, res, next) {
  console.log('GET Courses');
  console.log("Header Secret:" + req.header("secret"));

  res.setHeader('Content-Type', 'application/json');
  if (req.header("secret") != "1234") {
    res.sendStatus(403);
    return;
  }

  dbo.collection(collectionName).distinct("poll", function (err, result) {
    if (err) {
      console.log("Recieve Error:" + err);
    }
    else {
      console.log("Get Courses returns " + JSON.stringify(result));
      res.send(JSON.stringify(result));
    }
  })
})

/**
 * Alle Fragen abfragen
 */
router.get('/questions', function (req, res, next) {
  console.log('GET Questions');
  console.log("Header Secret:" + req.header("secret"));

  res.setHeader('Content-Type', 'application/json');
  if (req.header("secret") != "1234") {
    res.sendStatus(403);
    return;
  }

  dbo.collection("fragen").find().toArray(function (err, result) {
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
 * Umfrage auswerten 
 */
router.get('/evaluate/:poll/:course', function (req, res, next) {
  console.log('GET Evaluate for poll ' + req.params.poll + " with pattern " + req.params.course);
  console.log("Header Secret:" + req.header("secret"));

  res.setHeader('Content-Type', 'application/json');
  if (req.header("secret") != "1234") {
    res.sendStatus(403);
    return;
  }


  /**
   * db.antworten.aggregate([
    {$match: {"course":/FI/}},
    {$unwind: "$antworten"},
    {$group: {_id: "$antworten",count:{$sum:1}}},
    {$sort: {_id: 1}}   
    ])
   */
  dbo.collection(collectionName).aggregate(
    [
      { $match: { "course": {$regex:req.params.course},"poll": {$regex:req.params.poll} }},
      { $unwind: "$antworten" },
      { $group: { _id: "$antworten", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]
  ).toArray(function (err, result) {
    if (err) {
      console.log("Recieve Error:" + err);
    }
    else {
      //console.log("Get evaluation returns "+JSON.stringify(result));
      res.send(JSON.stringify(result));
    }
  })
})

module.exports = router;
