var async = require('async');
var platInterUtil = require('mcp_util').platInterUtil;
var esut = require("easy_util");
var log = esut.log;
var digestUtil = esut.digestUtil;

var argv = process.argv;
var kvs = {};
var lot = "T03";
var length = 1;
for(var key in argv)
{
    if(key > 1)
    {
        var kv = argv[key].split("=");
        kvs[kv[0]] = kv[1];
    }
}
if(kvs.lot)
{
    lot = kvs.lot;
}

if(kvs.length)
{
    length = kvs.length;
}

var LotTest = function(){
    var self = this;
    self.userId = 'Q0001';
    //self.userId = 'wangyi';
    self.userType = "CHANNEL";
    self.key = '135790';
    //self.key = 'ce7b4b00379744c781f0544440be3978';
    self.cmd = 'CT03';
    self.digestType = "md5";
    self.lotGame = lot;
    self.length = length;
};

LotTest.prototype.lot = function(bodyNode, cb)
{
    var self = this;
    platInterUtil.get(self.userId, self.userType, self.digestType, self.key, self.cmd, bodyNode, cb);
};

LotTest.prototype.lotT06 = function(cb)
{
    var self = this;
    var bodyNode = {};
    var orderNode = {outerId:digestUtil.createUUID(), amount:59600};
    var ticketsNode = [
        {gameCode:'T06', termCode:"2014001", bType:'00', amount:600, pType:'00',
            multiple:1, number:'1,2,3,4;1,2,3,3;1,2,3,4', outerId:digestUtil.createUUID(), auditTime:'2014-12-12 00:00:00'},
        {gameCode:'T06', termCode:"2014001", bType:'00', amount:400, pType:'01',
            multiple:1, number:'1,2,3,4;1,2,3,4', outerId:digestUtil.createUUID(), auditTime:'2014-12-12 00:00:00'},
        {gameCode:'T06', termCode:"2014001", bType:'00', amount:200, pType:'01',
            multiple:1, number:'1,3,4,5', outerId:digestUtil.createUUID(), auditTime:'2014-12-12 00:00:00'},
        {gameCode:'T06', termCode:"2014001", bType:'01', amount:3000, pType:'01',
            multiple:3, number:'1,2,3,4,5', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'02', amount:600, pType:'01',
            multiple:1, number:'1,2$3,4,5', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'00', amount:400, pType:'02',
            multiple:1, number:'1,2,2,3;1,2,3,3', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'01', amount:2400, pType:'02',
            multiple:1, number:'1,2,3,4', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'02', amount:1200, pType:'02',
            multiple:1, number:'1,2$3,4', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'08', amount:600, pType:'02',
            multiple:1, number:'1$3,4,5', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'00', amount:400, pType:'03',
            multiple:1, number:'1,1,2,2;2,2,3,3', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'01', amount:600, pType:'03',
            multiple:1, number:'1,2,3', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'02', amount:600, pType:'03',
            multiple:1, number:'1$2,3,4', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'00', amount:400, pType:'04',
            multiple:1, number:'1,2,2,2;2,3,3,3', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'01', amount:1200, pType:'04',
            multiple:1, number:'1,2,3', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'02', amount:1200, pType:'04',
            multiple:1, number:'1$2,3,4', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'08', amount:600, pType:'04',
            multiple:1, number:'1$2,3,4', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'00', amount:400, pType:'05',
            multiple:1, number:'1|_|_|_;2|_|_|_', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'01', amount:800, pType:'05',
            multiple:1, number:'1,2,3|2|_|_', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'00', amount:400, pType:'06',
            multiple:1, number:'1|_|3|_;2|_|2|_', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'01', amount:2200, pType:'06',
            multiple:1, number:'1,2,3|2|1,4|_', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'03', amount:1800, pType:'06',
            multiple:1, number:'1,2|3,4,5', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'06', amount:8800, pType:'06',
            multiple:1, number:'1,2|0,1,2,3', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'09', amount:2400, pType:'06',
            multiple:1, number:'1,2', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'00', amount:400, pType:'07',
            multiple:1, number:'1|_|3|2;2|1|2|_', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'01', amount:1200, pType:'07',
            multiple:1, number:'1,2,3|2|1,4|_', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'09', amount:4800, pType:'07',
            multiple:1, number:'1,2,3', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'00', amount:400, pType:'08',
            multiple:1, number:'1|4|3|2;2|1|2|1', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'01', amount:2400, pType:'08',
            multiple:1, number:'1,2,3|2|1,4|2,3', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'00', amount:600, pType:'08',
            multiple:1, number:'1|4|3|2;2|1|2|1;1|2|3|4', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'01', amount:5400, pType:'08',
            multiple:1, number:'1,2,3|2|1,3,4|2,3,4', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'00', amount:600, pType:'09',
            multiple:1, number:'1|4|3|2;2|_|_|_;1|_|_|4', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'01', amount:5400, pType:'09',
            multiple:1, number:'1,2,3|2|1,3,4|2,3,4', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'02', amount:6200, pType:'09',
            multiple:1, number:'1,2,3|2|1,3,4|_', outerId:digestUtil.createUUID()},
        {gameCode:'T06', termCode:"2014001", bType:'02', amount:1000, pType:'01',
            multiple:1, number:'1,5,8$2,3,4,6,7', outerId:digestUtil.createUUID()}];
    orderNode.tickets = ticketsNode;
    bodyNode.order = orderNode;
    self.lot(bodyNode, function(err, backMsgNode){
        if(err)
        {
            log.info('err:' + err);
        }
        else
        {
            log.info('back:');
            var decodedBodyStr = digestUtil.check(backMsgNode.head, self.key, backMsgNode.body);
            log.info(decodedBodyStr);
            cb();
        }
    });
};

LotTest.prototype.lotT01 = function(cb){

    var self = this;
    var bodyNode = {};
    var orderNode = {outerId:digestUtil.createUUID(), amount:"2000"};
    var termCode = '15057';
    var ticketsNode = [
        {gameCode:'T01', termCode:termCode, bType:'00', amount:"1000", pType:'00',
            multiple:1, number:'01,02,03,04,05|01,08;01,02,03,04,05|01,09;01,02,03,04,05|01,10;01,02,03,04,05|01,11;01,02,03,04,05|02,03', outerId:digestUtil.createUUID()},
        {gameCode:'T01', termCode:termCode, bType:'00', amount:"1000", pType:'00',
            multiple:1, number:'01,02,03,04,05|01,02;01,02,03,04,05|01,03;01,02,03,04,05|01,04;01,02,03,04,05|01,05;01,02,03,04,05|01,06', outerId:digestUtil.createUUID()},
       /* {gameCode:'T01', termCode:termCode, bType:'01', amount:11200, pType:'00',
            multiple:1, number:'01,02,03,04,05,06,07,08|01,02', outerId:digestUtil.createUUID()},
        {gameCode:'T01', termCode:termCode, bType:'02', amount:4000, pType:'00',
            multiple:1, number:'01,02,03$04,05,06,07,08|01$02,03', outerId:digestUtil.createUUID()}*/]
    orderNode.tickets = ticketsNode;
    bodyNode.order = orderNode;

    self.lot(bodyNode, function(err, backMsgNode){
        if(err){
            log.info('err:' + err);
        }else{
            log.info("backMsgNode");
            var decodeBodyStr = digestUtil.check(backMsgNode.head, self.key, backMsgNode.body);
            log.info(decodeBodyStr);
            cb();
        }
    });
}

LotTest.prototype.lotT03 = function(cb){

    var self = this;
    var bodyNode = {};
    var orderNode = {outerId:digestUtil.createUUID(), amount: 400};
    var termCode = '15145';
    //[1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 63, 69, 73, 75, 75, 73, 69, 63, 55, 45, 36, 28, 21, 15, 10, 6, 3, 1];
    //[10, 54, 96, 126, 144, 150, 144, 126, 96, 54]
    var ticketsNode = [
        {gameCode:'T03', termCode:termCode, bType:'00', amount:400, pType:'01',
            multiple:1, number:'1|2|3;2|4|7', outerId:123}]
      /*  {gameCode:'T03', termCode:termCode, bType:'03', amount:3600, pType:'01',
            multiple:1, number:'01,04', outerId:digestUtil.createUUID()},
        {gameCode:'T03', termCode:termCode, bType:'06', amount:21600, pType:'01',
            multiple:1, number:'1,9', outerId:digestUtil.createUUID()}]*/
    orderNode.tickets = ticketsNode;
    bodyNode.order = orderNode;

    self.lot(bodyNode, function(err, backMsgNode){
        if(err){
            log.info('err:' + err);
        }else{
            log.info("backMsgNode" + JSON.stringify(backMsgNode.head));
            var decodeBodyStr = digestUtil.check(backMsgNode.head, self.key, backMsgNode.body);
            log.info(decodeBodyStr);
            cb();
        }
    });
}

LotTest.prototype.lotT02 = function(cb){

    var self = this;
    var bodyNode = {};
    var orderNode = {outerId:digestUtil.createUUID(), amount: 1600};
    var termCode = '15055';
    var ticketsNode = [
       /* {gameCode:'T02', termCode:termCode, bType:'00', amount:400, pType:'00',
            multiple:1, number:'1|2|3|4|5|6|7;1|8|5|4|5|6|9', outerId:digestUtil.createUUID()},*/
        {gameCode:'T02', termCode:termCode, bType:'01', amount:1600, pType:'00',
            multiple:1, number:'3|1|3|0,2|1,3|5|1,7', outerId:digestUtil.createUUID()},
        ]
    orderNode.tickets = ticketsNode;
    bodyNode.order = orderNode;

    self.lot(bodyNode, function(err, backMsgNode){
        if(err){
            log.info('err:' + err);
        }else{
            log.info("backMsgNode");
            var decodeBodyStr = digestUtil.check(backMsgNode.head, self.key, backMsgNode.body)
            log.info(decodeBodyStr);
            cb();
        }
    });
}


LotTest.prototype.lotF02 = function(cb){

    var self = this;
    var bodyNode = {};
    var orderNode = {outerId:digestUtil.createUUID(), amount:11400};
    var termCode = '2014001';
    var gameCode = 'F02';
    var ticketsNode = [
        {gameCode:gameCode, termCode:termCode, bType:'00', amount:200, pType:'01',
            multiple:1, number:'2|3|9', outerId:digestUtil.createUUID(), auditTime:'2014-12-12 00:00:00'},
        {gameCode:gameCode, termCode:termCode, bType:'01', amount:800, pType:'01',
            multiple:1, number:'1|2,3|3,9', outerId:digestUtil.createUUID()},
        {gameCode:gameCode, termCode:termCode, bType:'03', amount:7400, pType:'01',
            multiple:1, number:'2,3,5', outerId:digestUtil.createUUID()},
        {gameCode:gameCode, termCode:termCode, bType:'01', amount:1200, pType:'02',
            multiple:1, number:'2,3,5', outerId:digestUtil.createUUID()},
        {gameCode:gameCode, termCode:termCode, bType:'01', amount:800, pType:'03',
            multiple:1, number:'1,2,3,5', outerId:digestUtil.createUUID()},
        {gameCode:gameCode, termCode:termCode, bType:'03', amount:1000, pType:'04',
            multiple:1, number:'1,2,3', outerId:digestUtil.createUUID()}]
    orderNode.tickets = ticketsNode;
    bodyNode.order = orderNode;
    self.lot(bodyNode, function(err, backMsgNode){
        if(err){
            log.info('err:' + err);
        }else{
            log.info("backMsgNode");
            var decodeBodyStr = digestUtil.check(backMsgNode.head, self.key, backMsgNode.body);
            log.info(decodeBodyStr);
            cb();
        }
    });
}

LotTest.prototype.start = function(){
    var self = this;
    var count = 0;
    async.whilst(
        function() { return count < self.length},
        function(whileCb) {
            var method = 'lot' + self.lotGame;
            if(self[method]){
                self[method](function(){
                    count++;
                    whileCb();
                });
            }
        },
        function(err) {
            log.info(err);
        }
    );
};
var lotTest = new LotTest();
lotTest.start();

