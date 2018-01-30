// app.js
var scrape = require('./scrape');
var express = require('express');
const sqlite3 = require('sqlite3').verbose();
var cors = require('cors');

let db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the database.');
  });

const createDB = () =>{
    //db.run('CREATE TABLE characterinfo(id INTEGER PRIMARY KEY, longid INTEGER, name TEXT, element TEXT, weapons TEXT, style TEXT, rarity TEXT, race TEXT, gender TEXT, obtain TEXT, imgurl TEXT)');
    //db.run('CREATE TABLE characterinfo(id INTEGER PRIMARY KEY, rating REAL)'); //don't yet run
}

const scrapeAndInsert = () =>{

    function callback(items) {
      //construct the insert statement with multiple sets (in parentheses) of values
      const values = (item) => Object.values(item).join('" , "');
      let allValues = items.map((item) => '("'+ values(item) +'")').join(',');
      let sql = 'INSERT INTO characterinfo VALUES ' + allValues;

      db.run(sql, items, function(err) {
        if (err) {
          return console.error(err.message);
      }
        console.log(`Rows inserted ${this.changes}`);
      });
    }

    scrape.scrape(callback);

}

//test database

function select(){
    let sql = `SELECT id id,
                      name name,
                      element element,
                      imgurl imgurl
                FROM characterinfo`;

    let list = [];

    return new Promise((resolve, reject) => {
      db.all(sql, [], (err, allRows) => {
        if (err) {
          return reject(err);
        }
        resolve(allRows);
      }); 
    });
}
//selectTest(console.log);
/*
module.exports = 
{
  select: select(),
};*/

var port = 4200;

var app = express();
app.use(cors());

var router = express.Router();
/*
router.get('/', function(req, res) { 
  console.log("get");
    const callback = (result) => { 
      //console.log(result); 
      res.json(result);
    }
    selectReturn(callback);
});*/

router.route('/select')
  .get(async function(req, res) {
      console.log("get");
      //let s = await db.select;
      //select().then(function(value){res.json(value)});
      let s = await select();
      //console.log('s: '+s);
      //console.log("post-await");
      res.json(s);
    });

app.use('/api/v1', router);

app.listen(port);