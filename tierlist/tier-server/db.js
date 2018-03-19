// app.js
var scrape = require('./scrape');
var express = require('express');
const sqlite3 = require('sqlite3').verbose();
var cors = require('cors');
const imageType = require('image-type');

const imghash = require('imghash');

//convert images
var fs = require('fs');
var request = require('request');
/*
let db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the database.');
  });*/

const modifyDB = () =>{
    let db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    else{ console.log('Connected to the database.'); 
         //db.run('CREATE TABLE characterphashes(id INTEGER PRIMARY KEY, hash TEXT)');

         //db.run('ALTER TABLE characterinfo ADD GameWith TEXT');
         /*
         let sql = 
            `UPDATE characterinfo
             SET GameWith = (SELECT rating
                       FROM GWtier
                       WHERE id = characterinfo.id)`

              db.run(sql, [], function(err) {
                if (err) {
                  return console.error(err.message);
              }
                console.log(`Rows inserted ${this.changes}`);
              });
               */        
        }

    });
    //db.run('CREATE TABLE characterinfo(id INTEGER PRIMARY KEY, longid INTEGER, name TEXT, element TEXT, weapons TEXT, style TEXT, rarity TEXT, race TEXT, gender TEXT, obtain TEXT, imgurl TEXT)');
    //db.run('CREATE TABLE characterinfo(id INTEGER PRIMARY KEY, rating REAL)'); //don't yet run
    //db.run('CREATE TABLE characterphashes(id INTEGER PRIMARY KEY, hash TEXT');
    //db.run('CREATE TABLE GWtier(id INTEGER PRIMARY KEY, rating TEXT)');
    //db.run('CREATE TABLE GGtier(id INTEGER PRIMARY KEY, rating REAL)'); //should maybe contain more info- descriptions etc? ehhhh
    //db.run('DROP TABLE GWtier');

}

const getImages = (idArrOrNull) =>{//download images to directory using the imgurl field of characterinfo table. either all images if given null or specified ids if given an array.

  var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
      if(!err){request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);}
      else{console.log('errors requesting file'+ filename)}
    });
  };

  let base = 'https://gbf.wiki/'
  let sql = `SELECT id id,
                      imgurl imgurl
                FROM characterinfo `;
  if (idArrOrNull){
    let where = 'WHERE id IN ('+idArrOrNull.join(',')+')'
    sql = sql+where;
  }

  let db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the database.');
    db.each(sql, [], (err, row) => {
    if (err) {
      console.log('error' + err); 
      console.log(sql);
    }
    else{
    let path = './images/'+row.id;
    console.log(row.name);
    console.log(row.imgurl)
    //if (!fs.existsSync(path)){
      download(base+row.imgurl, path, function(){console.log(row.id);});
    }
    //}
  }); 
  });
  
}

const fixImagesfromDir = () =>{ //checks that image files are valid and if not redownloads them using getImages.
    //maybe not the most expedient way of doing this- I copied the part that produces an error in index.js of imghash module.
   fs.readdirSync('./images/').forEach(file => {
        let filepath = ('./images/'+file);
        if(!filepath.endsWith('.jpg')){
            let newfilepath = './images/'+file+'.jpg';
            fs.renameSync(filepath, newfilepath);
            filepath=newfilepath;
        }
        return new Promise((resolve, reject) => {
            fs.readFile(filepath, (err, content) => {
              if (err) return reject(err);
              resolve(content);
            });
        })
        .then((fdata) => {
            const ftype = imageType(fdata);
            //console.log(ftype);
            try {
                if (ftype.mime === 'image/bmp') {
                  console.log('has mime');
                }
            }
            catch(err){
                let missedID = file.slice(0,-4);//.slice(0,-4)
                console.log(missedID);
                getImages([missedID]);
            }
        });
    });
}

const insert = (items, tablestr) =>{
      //construct the insert statement with multiple sets (in parentheses) of values
      let db = new sqlite3.Database('./database.db', (err) => {
        if (err) {console.error(err.message);}
        else{
              const values = (item) => Object.values(item).join('" , "');
              let allValues = items.map((item) => '("'+ values(item) +'")').join(',');
              let sql = 'INSERT INTO '+tablestr+' VALUES ' + allValues;

              db.run(sql, items, function(err) {
                if (err) {
                  return console.error(err.message);
              }
                console.log(`Rows inserted ${this.changes}`);
              });
        }      
      });
}
const insertFromWiki = (items) =>{ //given items gotten from scraping wiki, insert them.
    insert(items, 'characterinfo');
}
/* deprecated
const insertGWTiers = (IDTierDict) =>{ //IDTierDict eg {'4149': '9.5', '4148': '9.0'}
    //Tier takes text (as the GG table will need to take text anyways. Best to be consistent.) Filtering out non-numbers should be done on the frontend
    let items = Object.keys(IDTierDict).map(function(key, index){
        return {id: parseInt(key, 10), tier: IDTierDict[key]};
    });
    insert(items, 'GWtier');
}*/

function selectfrom(tablename){
    let sql = `SELECT * FROM ` + tablename;
    //let sql = `SELECT * FROM characterinfo`;
    return new Promise((resolve, reject) => {

      let db = new sqlite3.Database('./database.db', (err) => {
        if (err) {
          console.error(err.message);
          return reject(err);
        }
        else{
          db.all(sql, [], (err, allRows) => {
            if (err) {
              return reject(err);
            }
            for (var i = allRows.length - 1; i >= 0; i--) {
                console.log(allRows[i]);
            }
            resolve(allRows);
          });
        } 
    });
  });
}

function selectcharacters(){ //all characters from characterinfo
  return selectfrom('characterinfo');
}

function selecthashes(){ //all id,hash es from characterphashes table
  return selectfrom('characterphashes');
}
/*deprecated
function selectGWtier(){ //all id,tier s from GWtier table
  return selectfrom('GWtier');
}
*/
function insertHashesFromFileSystemImgs(){
  let db = new sqlite3.Database('./database.db', (err) => {
        if (err) {
          console.error(err.message);
        }
        else{
            //images at './images/'+row.id;... so for ech image take the name of the image, which is its id, and then
            //pair ids and hashes

            idHashDict = {};
            fs.readdirSync('./images/').forEach(file => {
              let id = file.slice(0, -4); // .jpg is characters 
              let filename = ('./images/'+file);
              idHashDict[id] = imghash.hash(filename);
              //console.log(filename);
              //console.log(idHashDict[filename]);
            });

            console.log(Object.values(idHashDict));

            Promise.all(Object.values(idHashDict))
            .then((results) => {
                const values = (arr) => arr.join('", "');
                let allValues = (Object.keys(idHashDict)).map((ele, i) => '("'+ values([ele, results[i]]) +'")').join(',');
                let sql = 'INSERT INTO characterphashes VALUES ' + allValues;
                console.log(sql);
                db.run(sql, [], function(err) {
                if (err) {
                    return console.error(err.message);
                }
                console.log(`Rows inserted ${this.changes}`);
                });
            })
            .catch((err) =>{console.log(err);});
        }
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

router.route('/characters')
  .get(async function(req, res) {
      console.log("get");
      let s = await selectcharacters();
      console.log(s);
      res.json(s);
    });
router.route('/characters/:id/image')
  .get(function(req, res) {
      console.log('img');
      var options = { root: __dirname + '/images/' };

      let filename = req.params.id + '.jpg'; //the way files are formatted should probably be 'saved' all in one place...
      res.sendFile(filename, options);
    });
  /*
router.route('/GameWith')
  .get(async function(req, res) {
      console.log("GWtier");
      let gw = await selectGWtier();
      res.json(gw);
    });*/
    /*
router.route('/characters/:id/gaijins')
  .get(async function(req, res) {
      console.log("gaijins info");
      let gw = await //
      res.json(gw);
    });
*/
app.use('/api/v1', router);

app.listen(port);

module.exports = { selecthashes };

//getImages();
//fixImagesfromDir();

//createDB();

//insertHashesFromFileSystemImgs();
/*
async function testawaithashes(){
    let h = await selecthashes();
    console.log(h);
}
testawaithashes();
*/
//modifyDB();

//selecthashes();