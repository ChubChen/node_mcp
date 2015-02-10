var async = require('async');

var platInterUtil = require('mcp_util').platInterUtil;
var esut = require("easy_util");
var log = esut.log;
var digestUtil = esut.digestUtil;

var cons = require('mcp_constants');
var userType = cons.userType;
var msgStatus = cons.msgStatus;
var msgType = cons.msgType;
var ticketPrintQueenStatus = cons.ticketPrintQueenStatus;
var ticketPrintStatus = cons.ticketPrintStatus;


var NotifyTest = function(){
    var self = this;
    self.userId = 'Q0001';
    self.userType = "CHANNEL";
    self.key = 'cad6011f5f174a359d9a36e06aada07e';
    self.digestType = "3des";
};

NotifyTest.prototype.notify = function(cmd, bodyNode, cb)
{
    var self = this;
    platInterUtil.get(self.userId, self.userType, self.digestType, self.key, cmd, bodyNode, cb);
};

NotifyTest.prototype.notifyN01 = function(cb)
{
    var self = this;
    var bodyNode = {};
    self.notify("N01", bodyNode, function(err, backMsgNode){
        if(err)
        {
            cb(err, null);
        }
        else
        {
            var backBodyStr = digestUtil.check(backMsgNode.head, self.key, backMsgNode.body);
            var backBodyNode = JSON.parse(backBodyStr);
            cb(null, backBodyNode);
        }
    });
};

NotifyTest.prototype.getUtilEmpty = function()
{
    var self = this;
    async.waterfall([
        //取票
        function(cb)
        {
            self.notifyN01(function(err, backBodyNode){
                log.info(backBodyNode);
                if(backBodyNode)
                {
                    var nots = backBodyNode.rst;
                    if(nots.length == 0)
                    {
                        cb("no notify to get........");
                        return;
                    }
                    else
                    {
                        cb(null, nots);
                    }
                }
            });
        },
        //返回出票结果
        function(nots, cb)
        {
            log.info(nots);
            cb(null);
        }
    ], function (err, rst) {
        if(err)
        {
            log.info(err);
        }
        else
        {
            self.getUtilEmpty();
        }
    });
}


var app = new NotifyTest();
app.getUtilEmpty();


