var request = require('request');
/*
var j = request.jar();
var cookie = request.cookie('session=dcc83df18ee24a01a412b165a095d962');
//var url = 'https://challenge.curbside.com/start';
j.setCookie(cookie, url);
*/
//int i=0;
const req = (next) => {
request({
	url: 'https://challenge.curbside.com/'+next,
	//jar: j,
	//headers: {"expire_at":"2018-02-21T01:22:30.361305557Z","session":"92168e2fa28a422da7545b571747dd98"},
	headers: {"session":"402d04cf2d18474db1bd2dba7c5e998d"},
	}, function (error, response, html) {
    if (!error) {
        //console.log(i);
        //console.log(response);
        console.log(html);
        //console.log(typeof(html));
        let resobj = JSON.parse(html.toLowerCase());
        //console.log(typeof(resobj));
        //console.log(typeof(resobj.next));
        //console.log(resobj.next);
        //console.log(typeof(Array.from(resobj.next)));
        //console.log(resobj.next[0]);
        //let arr = resobj.next;
        //console.log(resobj.next.length);
        if(typeof(resobj.next)=='string'){req(resobj.next);}
        else{
        	for(var i = resobj.next.length- 1; i >= 0; i--) {
	        	console.log(i);
	        	req(resobj.next[i]);
        }}
        //next.forEach*/
     }
	else{console.log(error);}
});
};



req('start');
//{"depth":0,"id":"start","message":"There is something we want to tell you, let's see if you can figure this out by finding all of our secrets","next":["6eff4871070043918ad76d4bf3314403","37cb1e535d4b44579012c12e11c5893c","8618abe7c70f430db9d2f0cfcaae48f4"]}
/*
for (var i = 0; i <10000; i++) {
	req(next);
	console.log(i);
};
*/
//https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies

//{"expire_at":"2018-02-21T00:54:34.253439071Z","session":"e0146fc256664227992ad2617d27e2ae"}

/*
https://www.npmjs.com/package/request
request({url: url, jar: j}, function () {
  request('http://images.google.com')
})


*/