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
            gameCode:'T51', pType:'02', bType:'11', amount:200,
            multiple:1, outerId:digestUtil.createUUID(),
            number:'02|201505225017|1'
        },
      /* {
            gameCode:'T52', pType:'01', bType:'21', amount:200,
            multiple:1, outerId:digestUtil.createUUID(),
            number:'01|201503312301|1;01|201503312303|2'
        },
        {
            gameCode:'T52', pType:'02', bType:'21', amount:200,
            multiple:1, outerId:digestUtil.createUUID(),
            number:'02|201503312301|1;02|201503312303|2'
        },
        {
            gameCode:'T52', pType:'04', bType:'21', amount:200,
            multiple:1, outerId:digestUtil.createUUID(),
            number:'02|201503312301|1;02|201503312303|2'
        }*/
        /*{
            gameCode:'T52', pType:'05', bType:'31', amount:600,
            multiple:1, outerId:digestUtil.createUUID(),
            number:'02|201503312301|2;03|201503312303|06,05,16;04|201503312304|1'
        }*/
    ]
    orderNode.tickets = ticketsNode;
    bodyNode.order = orderNode;
    self.lot(bodyNode, function(err, backMsgNode){
        if(err){
            log.info('err:' + err);
        }else{
            log.info(backMsgNode.head);
            var decodeBodyStr = digestUtil.check(backMsgNode.head, self.key, backMsgNode.body);
            log.info(decodeBodyStr);
            cb();
        }
    });
}

var lotTest = new LotTest();
var count = 0;
async.whilst(
    function() { return count < 10},
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