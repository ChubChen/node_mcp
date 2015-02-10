var pls = require("mcp_pls").pls;


var gameGrades = [104000, 200000000, 100000000, 20000, 1000, 500];
var gl = pls.gl(gameGrades.length);
gl.setBonus(gameGrades);

var check = pls.check();
check.setDrawNum("1|2|3");
check.setGl(gl);

console.log(check.count0101({number:'1,2|2,3|3,4'}));
