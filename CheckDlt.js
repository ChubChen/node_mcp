var dlt = require("mcp_dlt").dlt;

//var validate = require("mcp_dlt").validate;

var gameGrades = [400000000, 32624000, 1106500, 20000, 1000, 500];
var gl = dlt.gl(gameGrades.length);
gl.setBonus(gameGrades);

var check = dlt.check();
check.setDrawNum("03,05,07,15,34|01,10");
check.setGl(gl);

var val = check.count0500({number:'05,07,11,15,34|01,10'});

console.log(val);

/*
console.log(check.count0000({number:"01,02,03,04,05|04,05;01,02,04,05,07|02,04;01,03,06,08,09|04,07"}));
*//*console.log(check.count0000({number:"01,02,03,04,05|04,12"}));
console.log(check.count0000({number:"01,02,03,04,05|11,12"}));
console.log(check.count0000({number:"01,02,03,04,19|04,05"}));
console.log(check.count0000({number:"01,02,03,18,19|04,05"}));
console.log(check.count0000({number:"01,02,03,04,19|04,12"}));
console.log(check.count0000({number:"01,02,03,12,18|04,12"}));
console.log(check.count0000({number:"01,02,03,12,18|09,12"}));
console.log(check.count0000({number:"01,02,10,12,18|04,12"}));
console.log(check.count0000({number:"01,02,10,12,18|09,12"}));
console.log(check.count0000({number:"01,07,09,12,18|04,12"}));
console.log(check.count0000({number:"01,07,08,09,17|04,05"}));*//*
console.log(check.count0001({number:"01,02,03,04,05,06,07,08,09|04,05,07,08,11"}));*/

//console.log(check.count0001({number:"01,02,03,04,05,06,07|04,05"}));

//console.log(check.count0002({number:"01,02,03,04$05,06,07,08,09,10,11,12,13,14,15,16|04$02,03,05"}));

