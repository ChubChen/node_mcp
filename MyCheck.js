//var ssq = require("ssq");
var feo = require("mcp_feo").feo;

/*
var gameGrades = [400000000, 100000000, 300000, 20000, 1000, 500];
var gl = ssq.gl(gameGrades.length);
gl.setBonus(gameGrades);
console.log(gl.getBonus(0));

var check = ssq.check();
check.setRedBall([9,14,17,18,21,25]);
check.setBlueBall(15);
check.setGl(gl);
console.log(check.count());

var ticket = {playTypeCode:'00', betTypeCode:'00', numbers:"09,14,17,18,21,25|15"};
var handle = 'count' + ticket.playTypeCode + ticket.betTypeCode;
console.log(check[handle](ticket.numbers));*/

var stringUtil = feo.stringUtil();
console.log(stringUtil.getIntArray("123,456,321"));

var gameGrades = [19700, 39500, 79100, 118700, 900, 7400, 59300, 475100];
var gl = feo.gl(gameGrades.length);
gl.setBonus(gameGrades);

var check = feo.check();
check.setDrawNum("1,2,3,4");
check.setGl(gl);

console.log(feo.getCharLen("1,2,3,4"));

console.log(feo.getCharLen("1,2"));

console.log(feo.getCharLen("4,2,3,4"));

console.log(feo.getCharLen("4,2,2,4"));

console.log(feo.getNumType("4,2,2,4"));

console.log(feo.getNumType("1,2,3,4"));

console.log(check.count0100({number:"1,2,3,4"}));

console.log(check.count0100({number:"1,2,3,4;1,2,3,4"}));

console.log(check.count0101({number:"1,2,3,4,5,6"}));

console.log(check.count0101({number:"2,3,4,5,6"}));

console.log(check.count0102({number:"2,3,4$5,6"}));

console.log(check.count0102({number:"1,2,3$4,5,6"}));


var check02 = feo.check();
check02.setDrawNum("1,2,4,4");
check02.setGl(gl);
console.log(check02.count0200({number:"1,2,4,4"}));
console.log(check02.count0201({number:"1,2,4"}));
console.log(check02.count0202({number:"1,2$4,5"}));
console.log("组12，重胆拖算奖--------------");
console.log(check02.count0208({number:"4$1,2,3"}));
console.log(check02.count0208({number:"4$1,3,5"}));
console.log(check02.count0208({number:"2$1,4,5"}));


var check03 = feo.check();
check03.setDrawNum("2,2,4,4");
check03.setGl(gl);
console.log(check03.count0300({number:"2,2,4,4"}));
console.log(check03.count0301({number:"1,2,4"}));
console.log(check03.count0302({number:"1$2,4,5"}));
console.log(check03.count0302({number:"2$4,5"}));

var check04 = feo.check();
check04.setDrawNum("2,4,4,4");
check04.setGl(gl);
console.log(check04.count0400({number:"2,4,4,4;2,4,4,4"}));
console.log(check04.count0401({number:"1,2,4"}));
console.log(check04.count0402({number:"1$2,4,5"}));
console.log(check04.count0402({number:"2$4,5"}));
console.log("组4，重胆拖算奖--------------");
console.log(check04.count0408({number:"2$4,5"}));
console.log(check04.count0408({number:"4$2,5"}));

var check05 = feo.check();
check05.setDrawNum("2,4,4,4");
check05.setGl(gl);
console.log(check05.count0500({number:"2|_|_|_"}));
console.log(check05.count0501({number:"2,3|1,4|2,3|_"}));

var check06 = feo.check();
check06.setDrawNum("2,4,4,4");
check06.setGl(gl);
console.log(check06.count0600({number:"2|4|_|_"}));
console.log(check06.count0601({number:"2,3|1,4|2,3|_"}));
console.log("任2，和值--------------");
console.log(check06.count0603({number:"1,3|2,3,4,5,6,16"}));
console.log(check06.count0603({number:"1,3|2,3,4,5,16"}));
console.log("任2，跨度--------------");
console.log(check06.count0606({number:"1,3|2,3,4,5,6"}));
console.log(check06.count0606({number:"1,3|3,4,5"}));
console.log("任2，全包算奖--------------");
console.log(check06.count0609({number:"2,4"}));
console.log(check06.count0609({number:"4,4"}));

var check07 = feo.check();
check07.setDrawNum("2,4,4,4");
check07.setGl(gl);
console.log(check07.count0700({number:"2|4|4|_"}));
console.log(check07.count0701({number:"2,3|1,4|2,3,4|_"}));
console.log("任3，全包算奖--------------");
console.log(check07.count0709({number:"1,2,4"}));
console.log(check07.count0709({number:"2,4,4"}));
console.log(check07.count0709({number:"4,4,4"}));

var check08 = feo.check();
check08.setDrawNum("2,4,4,4");
check08.setGl(gl);
console.log(check08.count0800({number:"2|4|4|4"}));
console.log(check08.count0801({number:"2,3|1,4|2,3,4|1,4"}));


var check00 = feo.check();
check00.setDrawNum("2,4,4,4");
check00.setGl(gl);
console.log(check00.count0000({number:"2,4,4,4;2,3,3,4"}));
console.log(check00.count0000({number:"1,2,3,4;2,4,4,4"}));
console.log(check00.count0000({number:"1,2,3,4;2,3,4,4"}));

var check09 = feo.check();
check09.setDrawNum("2,4,4,4");
check09.setGl(gl);
console.log(check09.count0900({number:"2|_|4|4;2|4|_|_;2|_|_|_"}));
console.log(check09.count0901({number:"2,3|1,4|2,3,4|1,4"}));
console.log(check09.count0902({number:"2,3|4|2,3,4|1,4"}));

/*var start = new Date().getTime();
for(var i = 0; i < 1; i++)
{
    console.log(check.count0100({number:"1,2,3,4"}));
}
var end = new Date().getTime();
console.log(end - start);*/
