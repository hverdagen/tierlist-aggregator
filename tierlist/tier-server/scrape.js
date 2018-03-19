var express = require('express');
var request = require('request');
var cheerio = require('cheerio');

var db = require('./db');

const imghash = require('imghash');
const hamming = require('hamming-distance');

const scrape = (callback) => {  //scrape the wiki tracker
    url = 'https://gbf.wiki/Collection_Tracker';
    let characters = [];

    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            //console.log(html);
            var $ = cheerio.load(html);
            $('div.tracker-character').each(function() {
                console.log("match");
                    let isCharacter = ($(this).attr('data-type') == 'c')
                    if (isCharacter){
                        let character = {
                                id: $(this).attr('data-short_id'),
                                longid: $(this).attr('data-id'),
                                name: $(this).attr('data-name'),
                                element: $(this).attr('data-element'),
                                weapons: $(this).attr('data-weapon'),
                                style: $(this).attr('data-style'),
                                rarity: $(this).attr('data-rarity'),
                                race: $(this).attr('data-race'),
                                gender: $(this).attr('data-gender'),
                                obtain: $(this).attr('data-obtain'),
                                imgurl: $(this).children().first().children().first().attr('src'),
                            };
                        console.log(character);
                        characters.push(character);
                    }
            });
            callback(characters);
            //db.insertFromWiki(characters);
            //db.updateFromWiki(characters, 'weapons');
            //console.log(characters);
        }

        else{console.log(error);}
    });
}

async function GWtoHashDict(){ //convert imgurls and ratings to a dictionary with phashes as key and tier as value
    let tierimgs = await scrapeGameWith();

    return new Promise((resolve, reject) => {
        
        let hashTierDict = {};

        let i = 0;

        const insert = (element) => {
            console.log('insert')
            let options = {
              url: '',
              encoding: null, //tells request to return a buffer, not a string
            };
            options.url = element.imgurl;
            request(options, function(err, res, body){
                if(!err){
                    //console.log('no error')
                    //console.log(body);
                    imghash.hash(body).then(function(value) {
                        hashTierDict[value]=element.tier;
                        //if(value=='f680c2cad8985866'){console.log(element.imgurl);}
                        //console.log(value);
                        i++; //console.log(i);
                        if (i == tierimgs.length)
                            //console.log(hashTierDict);
                            resolve(hashTierDict);
                    });
                    }
                else{console.log(err); insert(element);}
            });
        }
        tierimgs.forEach(function(element) { insert(element); });
    });
}

async function scrapeGameWith(){
            console.log('scrapeGameWith');
            return new Promise((resolve, reject) => {
                let url = 'https://xn--bck3aza1a2if6kra4ee0hf.gamewith.jp/article/show/20722';
                let tierimgs = [];
                request(url, function (error, response, html) {
                    if (!error && response.statusCode == 200) {
                        var $ = cheerio.load(html);
                        $('tr').each(function(){
                            let tier = $(this).attr('data-col5');
                            if (tier){ 
                                let character = {
                                        tier: tier.substring(0,3),
                                        imgurl: $(this).children().first().children().last().children().first().attr('src'),
                                    };
                                    tierimgs.push(character);
                                };
                        });
                        console.log('tierimgs:');
                        console.log(tierimgs);
                        resolve(tierimgs);
                    }
                    else{reject(error);}
                });
            });
}

async function getHashIDDict(){ //get all imagehashes with IDs from database. for every img with ID, do hashIDDict[imghash.hash(img)]=ID
    let hashIDDict = {};

    let allRows = await db.selecthashes(); //db
    allRows.forEach(function(element) {
        hashIDDict[element.hash]=element.id;
    });
    //console.log(hashIDDict);
    return hashIDDict;
}



async function matchImages(){
    console.log('match');
    let hashIDDict = await getHashIDDict();
    let hashTierDict = await GWtoHashDict(); //GW specific

    let tierhashes =  Object.keys(hashTierDict);
    let IDhashes = Object.keys(hashIDDict);

    let tHashClosestDict = {}; //for each tHash, its closest distance thus far
    let tierIDDict = {};

    tierhashes.forEach(function(tHash){

        var distances = IDhashes.map(IDHash => hamming(tHash, IDHash));
        var minDistIndex = distances.reduce((bestIndexSoFar, currentlyTestedValue, currentlyTestedIndex, array) => currentlyTestedValue < array[bestIndexSoFar] ? currentlyTestedIndex : bestIndexSoFar, 0);
        var minDistHash = IDhashes[minDistIndex];
        var shortest = distances[minDistIndex];

        let isDecentMatch = shortest<10; 
        let noPreviousMatch = !tHashClosestDict[tHash];
        let isShortestMatch = (x) => x<tHashClosestDict[tHash];
        if(isDecentMatch &&(noPreviousMatch || isShortestMatch(shortest))){
            tHashClosestDict[tHash] = shortest;

            var ID = hashIDDict[minDistHash];
            var tier = hashTierDict[tHash];
            tierIDDict[ID] = tier;
        }
    });
    //console.log(tierIDDict);
    console.log(tHashClosestDict);
}


//module.exports = { scrape };



//scrapeGameWithHashTierDict();
//getHashIDDict();
//matchImages();
//getHashIDDict();

//matchImages();

//rint();
//GWtoHashDict();
//let empty = () => {};
//scrape(empty);