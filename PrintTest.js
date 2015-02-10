var async = require('async');
var CronJob = require("cron").CronJob;

var platInterUtil = require('mcp_util').platInterUtil;
var esut = require("easy_util");
var log = esut.log;
var digestUtil = esut.digestUtil;
var dateUtil = esut.dateUtil;

var cons = require('mcp_constants');
var userType = cons.userType;
var msgStatus = cons.msgStatus;
var msgType = cons.msgType;
var ticketPrintQueenStatus = cons.ticketPrintQueenStatus;
var ticketPrintStatus = cons.ticketPrintStatus;
var termStatus = cons.termStatus;


var PrintTest = function(){
    var self = this;
    self.userId = 'C0001';
    self.userType = "CHANNEL";
    self.key = 'cad6011f5f174a359d9a36e06aada07e';
    self.digestType = "3des";
};

PrintTest.prototype.print = function(cmd, bodyNode, cb)
{
    var self = this;
    platInterUtil.get(self.userId, self.userType, self.digestType, self.key, cmd, bodyNode, cb);
};

PrintTest.prototype.printP01 = function(cb)
{
    var self = this;
    var bodyNode = {};
    self.print("P01", bodyNode, function(err, backMsgNode){
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

PrintTest.prototype.printP02 = function(bodyNode, cb)
{
    var self = this;
    self.print("P02", bodyNode, function(err, backMsgNode){
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

PrintTest.prototype.printP03 = function(bodyNode, cb)
{
    var self = this;
    self.print("P03", bodyNode, function(err, backMsgNode){
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

PrintTest.prototype.printUtilEmpty = function()
{
    var self = this;
    async.waterfall([
        //取票
        function(cb)
        {
            printTest.printP01(function(err, backBodyNode){
                log.info(backBodyNode);
                if(backBodyNode && backBodyNode.repCode == '0000')
                {
                    var tickets = backBodyNode.rst;
                    if(tickets.length == 0)
                    {
                        cb("no tickets to print........");
                        return;
                    }
                    var rst = [];
                    async.each(tickets, function(ticket, callback) {
                        rst[rst.length] = {id:ticket.id,
                            status:ticketPrintStatus.PRINT_SUCCESS, province:'bj',
                        seq:digestUtil.createUUID(), terminal:'123456', rNumber:ticket.number};
                        callback();
                    }, function(err){
                        cb(err, rst);
                    });
                }
            });
        },
        //返回出票结果
        function(rst, cb)
        {
            var bodyNode = {};
            bodyNode.rst = rst;
            printTest.printP02(bodyNode, function(err, backBodyNode){
                log.info(backBodyNode);
                cb(err);
            });
            //cb(null);
        }
    ], function (err, rst) {
        if(err)
        {
            log.info(err);
        }
        else
        {
            self.printUtilEmpty();
        }
    });
}


var printTest = new PrintTest();

/*var bodyNode = {term:{
    gameCode:'F04', code:'2014001', status:termStatus.NOT_ON_SALE,
    openTime:'2015-01-09 15:49:59', closeTime:'2015-01-09 15:29:59'
}};
printTest.printP03(bodyNode, function(err, data){
    log.info(err);
    log.info(data);
});*/

//console.log(dateUtil.toDate("2020-01-01 00:00:00").getTime());

var printJob = new CronJob('*/10 * * * * *', function () {
    printTest.printUtilEmpty();
});
printJob.start();




