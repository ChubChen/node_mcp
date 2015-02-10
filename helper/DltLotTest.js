var async = require('async');

var platInterUtil = require('mcp_util').platInterUtil;
var esut = require("easy_util");
var log = esut.log;
var digestUtil = esut.digestUtil;

var LotTest = function(){
    var self = this;
    self.userId = 'Q0001';
    //self.userId = 'wangyi';
    self.userType = "CHANNEL";
    self.key = 'cad6011f5f174a359d9a36e06aada07e';
    //self.key = 'ce7b4b00379744c781f0544440be3978';
    self.cmd = 'CT03';
    self.digestType = "3des";
};

LotTest.prototype.lot = function(bodyNode, cb)
{
    var self = this;
    platInterUtil.get(self.userId, self.userType, self.digestType, self.key, self.cmd, bodyNode, cb);
};

LotTest.prototype.lotT01 = function(cb){

    var self = this;
    var bodyNode = {};
    var orderNode = {outerId:digestUtil.createUUID(), amount:19400};
    var termCode = '2014001';
    var ticketsNode = [
        {gameCode:'T01', termCode:termCode, bType:'00', amount:200, pType:'00',
            multiple:1, number:'01,02,03,04,05|01,02', outerId:digestUtil.createUUID()},
        {gameCode:'T01', termCode:termCode, bType:'01', amount:11200, pType:'00',
            multiple:1, number:'01,02,03,04,05,06,07,08|01,02', outerId:digestUtil.createUUID()},
        {gameCode:'T01', termCode:termCode, bType:'02', amount:4000, pType:'00',
            multiple:1, number:'01,02,03$04,05,06,07,08|01$02,03', outerId:digestUtil.createUUID()},
        {gameCode:'T01', termCode:termCode, bType:'02', amount:4000, pType:'00',
            multiple:1, number:'11,12,13$14,15,16,17,18|11$12,13', outerId:digestUtil.createUUID()}]
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

var lotTest = new LotTest();
var count = 0;
async.whilst(
    function() { return count < 100},
    function(whileCb) {
        lotTest.lotT01(function(){
            count++;
            whileCb();
        });
    },
    function(err) {
        log.info(err);
    }
);