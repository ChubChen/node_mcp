var esf = require("mcp_esf").esf;

var util = require('mcp_util');
var mathUtil = util.mathUtil;


var gameGrades = [1300,600,1900,7800,54000,9000,2600,900,6500,13000,19500,117900];
var gl = esf.gl(gameGrades.length);
gl.setBonus(gameGrades);

var check = esf.check();
check.setDrawNum("01,02,03,04,05");
check.setGl(gl);

/*
console.log(check.count2101({number:'01,02,03'}));
console.log(check.count2200({number:'01,02;02,05;06,07'}));
console.log(check.count2201({number:'01,02,03,04,05'}));
console.log(check.count2202({number:'01$02,04,05'}));

console.log(check.count2300({number:'01,02,03;02,04,05;04,06,07'}));
console.log(check.count2301({number:'01,02,03,04,05'}));
console.log(check.count2302({number:'01,02$04,05'}));


console.log(check.count2400({number:'01,02,03,04;02,04,05,10;04,06,07,11'}));
console.log(check.count2401({number:'01,02,03,04,05,06,07,09'}));
console.log(check.count2402({number:'01,02,03$04,05,10,11'}));

console.log(check.count2500({number:'01,02,03,04,05;02,04,05,10,11;04,06,07,09,11'}));
console.log(check.count2501({number:'01,02,03,04,05,06,07,09'}));
console.log(check.count2502({number:'01$02,03,04,05,10,11'}));

console.log(check.count2600({number:'01,02,03,04,05,06;02,04,05,09,10,11;04,06,07,08,09,11'}));
console.log(check.count2601({number:'01,02,03,04,05,06,07,09,10'}));
console.log(check.count2602({number:'01,02,03$04,05,07,10,11'}));

console.log(check.count2700({number:'01,02,03,04,05,06,07;02,04,05,08,09,10,11;04,06,07,08,09,10,11'}));
console.log(check.count2701({number:'01,02,03,04,05,06,07,08,09,10'}));
console.log(check.count2702({number:'01,02,03$04,05,07,10,11'}));*/

//console.log(check.count2800({number:'01,02,03,04,05,06,07,08;01,02,04,05,08,09,10,11;03,04,06,07,08,09,10,11'}));


console.log(check.count2900({number:'01,02;02,03;05,07'})); //前二  组选
console.log(check.count2901({number:'01,02,03,05,07'})); //前二  组选 复式
console.log(check.count2902({number:'01$02,03,05,07'})); //前二  组选 胆拖
console.log(check.count2902({number:'02$03,05,07'})); //前二  组选 胆拖
console.log(check.count2903({number:'03,05,07'})); //前二  组选 合值
console.log(check.count2906({number:'01,05,07'})); //前二  组选 跨度

console.log(check.count3100({number:'01,02,03;01,02,03;05,07,08'})); //前三  组选
console.log(check.count3101({number:'01,02,03,05,07,09'})); //前三  组选 复式
console.log(check.count3102({number:'01,02$03,05,07'})); //前三  组选 胆拖
console.log(check.count3102({number:'02$01,03,05,07'})); //前三  组选 胆拖
console.log(check.count3103({number:'03,05,06,07'})); //前三  组选 合值
console.log(check.count3106({number:'01,02,05,07'})); //前三  组选 跨度

console.log(check.count3000({number:'02|01;05|07'})); //前二  直选
console.log(check.count3001({number:'01,02,03,05,07'})); //前二  直选 复式
console.log(check.count3007({number:'01,04|02,03,05,07'})); //前二  直选 胆拖
console.log(check.count3007({number:'02|01,02,03'})); //前二  直选 胆拖
console.log(check.count3003({number:'03,05,07'})); //前二  直选 合值
console.log(check.count3006({number:'01,05,07'})); //前二  直选 跨度

console.log(check.count3200({number:'02|01|03;05|07;01|02|03'})); //前三  直选
console.log(check.count3201({number:'01,02,03,05,07'})); //前三  直选 复式
console.log(check.count3207({number:'01,04|02,03,05,07'})); //前三 直选 胆拖
console.log(check.count3207({number:'01|02,03,04,05'})); //前三  直选 胆拖
console.log(check.count3203({number:'03,05,06'})); //前三  直选 合值
console.log(check.count3206({number:'02,05,07'})); //前三  直选 跨度