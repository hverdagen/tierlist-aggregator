var express = require('express');
var request = require('request');
var cheerio = require('cheerio');

const scrape = (callback) => {
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
                                longId: $(this).attr('data-id'),
                                name: $(this).attr('data-name'),
                                element: $(this).attr('data-element'),
                                weapons: $(this).attr('data-weapons'),
                                style: $(this).attr('data-style'),
                                rarity: $(this).attr('data-rarity'),
                                race: $(this).attr('data-race'),
                                gender: $(this).attr('data-gender'),
                                obtain: $(this).attr('data-obtain'),
                                imgurl: $(this).children().first().children().first().attr('src'),
                            };
                        //console.log(character);
                        characters.push(character);
                    }
            });
            callback(characters);
            //console.log(characters);
        }

        else{console.log(error);}
    });
}

module.exports = { scrape: scrape };