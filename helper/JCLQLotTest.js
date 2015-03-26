var async = require('async');

var platInterUtil = require('mcp_util').platInterUtil;
var esut = require("easy_util");
var log = esut.log;
var digestUtil = esut.digestUtil;

var LotTest = function(){
    var self = this;
    self.userId = 'Q0001';
    self.userType = "CHANNEL";
    self.key = '135790';
    self.cmd = 'CT03';
    self.digestType = "md5";
};

LotTest.prototype.lot = function(bodyNode, cb)
{
    var self = this;
    platInterUtil.get(self.userId, self.userType, self.digestType, self.key, self.cmd, bodyNode, cb);
};

LotTest.prototype.lotT51 = function(cb){

    var self = this;
    var bodyNode = {};
    var orderNode = {outerId:digestUtil.createUUID(), amount:200};
    var ticketsNode = [
        {
            gameCode:'T52', pType:'03', bType:'11', amount:200,
            multiple:1, outerId:digestUtil.createUUID(),
            number:'03|201503253301|01'
        }
    ]
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
    function() { return count < 1},
    function(whileCb) {
        lotTest.lotT51(function(){
            count++;
            whileCb();
        });
    },
    function(err) {
        log.info(err);
    }
);