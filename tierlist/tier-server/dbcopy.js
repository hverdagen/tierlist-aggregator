// app.js
var scrape = require('./scrape');
var express = require('express');

var cors = require('cors');

var port = 4200;

var app = express();
app.use(cors());

var router = express.Router();

router.get('/select', function(req, res) { 
    console.log("get");
    res.json("success");
    }
});
/*
router.route('/select')
  .get(async function(req, res) {
      console.log("get");
      //let s = await db.select;
      //select().then(function(value){res.json(value)});
      let s = await select();
      //console.log('s: '+s);
      //console.log("post-await");
      res.json(s);
    });*/

app.use('/api/v1', router);

app.listen(port);