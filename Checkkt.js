var kt = require("mcp_kt").kt;

var util = require('mcp_util');
var mathUtil = util.mathUtil;


var gameGrades = [8000,4000,2500,1600,1200,1000,900,900,1000,1200,1600,2500,4000,8000,4000,24000,1500,8000,4000,800,1000];
var gl = kt.gl(gameGrades.length);
gl.setBonus(gameGrades);

var check = kt.check();
check.setDrawNum("1,5,6");
check.setGl(gl);

console.log(check.count0100({number:"1,2,3"}));
console.log(check.count0200({number:"1,1,3"}));

console.log(check.count0300({number:"1,1,1"}));
console.log(check.count0401({number:"6;12"}));
console.log(check.count0501({number:"12;23"}));
console.log(check.count0601({number:"11;22"}));
console.log(check.count0700({number:"111,222,333,444,555,666"}));
console.log(check.count0800({number:"123,234,345,456"}));
