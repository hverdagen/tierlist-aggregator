// app.js
var scrape = require('./scrape');
const sqlite3 = require('sqlite3').verbose();

//for api
var express = require('express');
var cors = require('cors');

const imghash = require('imghash'); //for finding hash based on image

var fs = require('fs'); //for accessing filesystem (for images)
var request = require('request'); //for downloading images

//currently only the select functions are used by the API, the rest are/were run manually.
function selectfrom(tablename){
    let sql = `SELECT * FROM ` + tablename;
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
                //console.log(allRows[i]);
                if(!allRows[i].weapons){console.log(allRows[i]);}
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

const modifyDB = (sql) =>{
    let db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    else{ console.log('Connected to the database.'); 
      db.run(sql);
    }
    });
}
let createCharInfoTableSQL = 'CREATE TABLE characterinfo(id INTEGER PRIMARY KEY, longid INTEGER, name TEXT, element TEXT, weapons TEXT, style TEXT, rarity TEXT, race TEXT, gender TEXT, obtain TEXT, imgurl TEXT';
let createCharPHashTableSQL = 'CREATE TABLE characterphashes(id INTEGER PRIMARY KEY, hash TEXT';
//modifyDB();

const getImages = (idArrOrNull) =>{//Download images to directory using the imgurl field of characterinfo table. Either all images if given null or specified ids if given an array.

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
    //if (!fs.existsSync(path)){ //if not wanting to overwrite
      download(base+row.imgurl, path, function(){console.log(row.id);});
    }
    //}
  }); 
  });
  
}

const fixImagesfromDir = () =>{ //Checks that image files are valid and if not redownloads them using getImages.
    //Maybe not the most expedient way of doing this- error checking comes from copying the part that produces an error in index.js of imghash module.
   fs.readdirSync('./images/').forEach(file => {
        let filepath = ('./images/'+file);
        if(!filepath.endsWith('.jpg')){
            let newfilepath = filepath+'.jpg';
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
                let missedID = file.slice(0,-4); //because '.jpg' is characters 
                console.log(missedID);
                getImages([missedID]);
            }
        });
    });
}

const insert = (items, tablestr) =>{
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

const updateFromWiki = (characters, attrColName) =>{ //assumes key in character objects is the same as the column to update's name
  console.log(attrColName);
  let len = characters.length;
  console.log(characters);
    let db = new sqlite3.Database('./database.db', (err) => {
        if (err) {console.error(err.message);}
        else{
          for (var i = 0; i < len; i++) {
          console.log(attrColName);
          console.log(i);
          let character = characters[i];
          console.log(character);
          let sql= `UPDATE characterinfo SET ` +attrColName+ ` = '` +character[attrColName]+ `' WHERE id = ` +character.id;
          console.log(sql);
            db.run(sql, [], function(err) {
                  console.log(sql);
                  if (err) {return console.error(err.message); characters.push(character); len++;} //definitely not the fastest way to handle this, but there's no need for it to be efficient
                  else{console.log(`Rows inserted ${this.changes}`)};
            });
          }
      }
    });
  
}

function insertHashesFromFileSystemImgs(){
  let db = new sqlite3.Database('./database.db', (err) => {
        if (err) {
          console.error(err.message);
        }
        else{
            //images at './images/'+row.id;... so for each image take the name of the image, which is its id, and then pair ids and hashes
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

var port = 4200;

var app = express();
app.use(cors());

var router = express.Router();

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

module.exports = { selecthashes, updateFromWiki, insertFromWiki };

/*
async function testawaithashes(){
    let h = await selecthashes();
    console.log(h);
}
testawaithashes();
*/
//console.log('done');