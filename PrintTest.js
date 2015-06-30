var async = require('async');
var CronJob = require("cron").CronJob;

var platInterUtil = require('mcp_util').platInterUtil;
var moment = require("moment");

var esut = require("easy_util");
var log = esut.log;
var digestUtil = esut.digestUtil;
var dateUtil = esut.dateUtil;
var dc = require('mcp_db').dc;


var cons = require('mcp_constants');
var userType = cons.userType;
var msgStatus = cons.msgStatus;
var msgType = cons.msgType;
var ticketPrintQueenStatus = cons.ticketPrintQueenStatus;
var ticketPrintStatus = cons.ticketPrintStatus;
var termStatus = cons.termStatus;
var gameType = cons.gameType;

var config = require('mcp_config');
var game = config.game;

var argv = process.argv;
var kvs = {};
var method = "T03";
for(var key in argv)
{
    if(key > 1)
    {
        var kv = argv[key].split("=");
        kvs[kv[0]] = kv[1];
    }
}
if(kvs.method)
{
    method = kvs.method;
}

var PrintTest = function(){
    var self = this;
    self.userId = 'C0001';
    self.userType = "CHANNEL";
    self.key = '123456';
    self.digestType = "md5";
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

PrintTest.prototype.printP03 = function(cb){
	 var self = this;
	async.waterfall([
        function(cb){
            var term = dc.main.get("term");
            var cond = {status : termStatus.WAITING_DRAW_NUMBER, gameCode:{$in:['T05','T03','T04','T02','T01']}}
            term.find(cond, {}).limit(0,1).toArray(function(err, data){
		 cb(err, data[0])
            });
        },
	function(term, cb){
		if(term != undefined && term!= null){
		   if( term.gameCode == "T05"){
               		 term.wNum = "01,02,03,04,05";
      		  }else if(term.gameCode == "T01"){
               		 term.wNum = "01,02,03,04,05|01,02";
     		   }else if(term.gameCode == "T02"){
               		 term.wNum = "1|2|3|4|5|6|7";
      		  }else if(term.gameCode == "T03"){
               		 term.wNum = "1|2|3";
      		  }else if(term.gameCode == "T04"){
               		 term.wNum = "1|2|3|4|5";
        	 } 
                 term.status = termStatus.DRAW;
       		 var bodyNode = {term:term};
      		  log.info("即将开奖的场次");
       		 log.info(bodyNode);
       		 self.print("P03", bodyNode, function(err, backMsgNode){
            		if(err)
            		{
                		cb(err, null);
           		 }
           		 else
            		{
                		var backBodyStr = digestUtil.check(backMsgNode.head, self.key, backMsgNode.body);
                		var backBodyNode = JSON.parse(backBodyStr);
                		log.info(backBodyNode);
                		cb(null, backBodyNode);
           	 }
        	});
        }else{
                log.info("暂时没有数据");
        }
      }
    ], function (err){
	log.info(err);
    });
}

PrintTest.prototype.sendP03 = function( cb)
{
    var self = this;
    async.waterfall([
        function(cb)
        {
            dc.init(function(err){
                cb(err);
            });
        },
        //校验基础数据的可用性
        function(cb)
        {
            dc.check(function(err){
                cb(err);
            });
        }
       ], function (err) {
        if(err){

        }else{
            var draw = new CronJob('*/10 * * * * *', function () {
                self.printP03(function(err, result){
                    log.info(err);
                })
            });
            draw.start();
        }
    });
};

PrintTest.prototype.sendP01 = function(){
    var printJob = new CronJob('*/10 * * * * *', function () {
        printTest.printUtilEmpty();
    });
    printJob.start();
}

PrintTest.prototype.printUtilEmpty = function()
{
    var self = this;
    async.waterfall([
        //取票
        function(cb)
        {
            printTest.printP01(function(err, backBodyNode){
                log.info(backBodyNode + "back");
                if(backBodyNode)
                {
                    var tickets = backBodyNode.rst;
                    if(tickets.length == 0)
                    {
                        cb("no tickets to print........");
                        return;
                    }
                    var rst = [];
                    async.each(tickets, function(ticket, callback) {
                        var gameData = game.getInfo(ticket.gameCode);
                        if(gameData.type == gameType.Jingcai){
                            var temp  = ticket.number.split(";");
                            log.info(temp);
                            log.info(temp.length);
                            var array = new Array();

                            for(var i =0 ; i< temp.length ; i++){
                                log.info(temp[i]);
                                var match = temp[i].split("|");
                                var result = match[2].split(",");
                                var tempArray = new Array();
                                for(var j = 0; j < result.length ; j++){
                                    var tempstr = "";
                                    if(result[j].indexOf("@") < 0){
                                        if(ticket.gameCode == 'T52' && ticket.pType == '01'){
                                            tempstr = result[j] + "(" + (Math.random()*10 -5).toFixed(1) + ")@" + (Math.random()*10).toFixed(2);
                                        }else if(ticket.gameCode == 'T52' && ticket.pType == '04'){
                                            tempstr = result[j] + "(" + (Math.random()*200 - Math.random()*100).toFixed(1) + ")@" + (Math.random()*10).toFixed(2);
                                        }else{
                                            tempstr = result[j] + "@" + (Math.random()*10).toFixed(2);
                                        }
                                    }else{
                                        tempstr = result[j];
                                    }
                                    tempArray.push(tempstr);
                                }
                                log.info(tempArray);
                                array.push(match[0]+"|"+match[1]+"|"+tempArray.join(","));
                            }
                            log.info(array);
                            var rnumber = array.join(";");
                            rst[rst.length] = {id:ticket.id,
                                status:ticketPrintStatus.PRINT_SUCCESS, province:'bj',passw:123456,
                                seq:digestUtil.createUUID(), terminal:'123456', printTime: moment().format("YYYY-MM-DD HH:mm:ss"),rNumber:rnumber};
                        }else{
                            rst[rst.length] = {id:ticket.id,
                                status:ticketPrintStatus.PRINT_SUCCESS, province:'bj',passw:123456,
                                seq:digestUtil.createUUID(), terminal:'123456', printTime: moment().format("YYYY-MM-DD HH:mm:ss"),rNumber:ticket.number};
                        }
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

PrintTest.prototype.start = function(){
    var self = this;
    var query = "send" + method;
    if(self[query]){
        self[query](function(err){
            log.info(err);
        });
    }
}
var printTest = new PrintTest();
printTest.start();

