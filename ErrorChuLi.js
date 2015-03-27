var async = require('async');
var dc = require('mcp_db').dc;
var jc = require("mcp_jc").jc;
var esut = require('easy_util');

var log = esut.log;
var cons = require('mcp_constants');
var ticketStatus = cons.ticketStatus;

var ErrChuLi = function(){
    var self = this;
    async.waterfall([
        function(cb){
            dc.init(function (err) {
                cb(null);
            });
        },//校验基础数据的可用性
        function(cb)
        {
            dc.check(function(err){
                cb(null);
            });
        },
        function(cb){
            self.handle(function(err){
                cb(err);
            });
        }
    ],function(err){
           log.info(err);
    });
};

/**
 * 查找算奖错误的数据
 */
ErrChuLi.prototype.handle = function(cb){
    var self = this;
    async.waterfall([
        function(cb){
            //第一步查找算奖错误的数据
            var tticket = dc.main.get("tticket");
            var cond = {termCode:{$gte:'201503264001',$lte:'201503264005'}};
            var conn = dc.mg.getConn();
            var temptable = conn.collection("errortable");
            var cursor = tticket.find(cond, {}, []);
            cursor.toArray(function(err, data){
                async.eachSeries(data, function(ticket, callback){
                    ticket._id = ticket.id
                    delete  ticket.id;
                    temptable.save(ticket, [], function(err ,data) {
                        log.info("save ");
                        callback(null);
                    });
                },function(err){
                    log.info(err);
                    cb(err);
                });
            });
        },
       function(cb){
           log.info("准备算奖");
           var check = jc.check();
           var conn = dc.mg.getConn();
           var temptable = conn.collection("errortable");
           var termTable = dc.main.get("term");
           var cacheObj = {};
           var cursor = temptable.find({},{},[]);
           cursor.toArray(function (err, data) {
                async.eachSeries(data, function(ticket, callback){
                    var matchArray = ticket.rNumber.split(";");
                    async.eachSeries(matchArray , function(match , callbackMath){
                        var termCode = match.split("|")[1];
                        if(cacheObj[termCode] == undefined || cacheObj[termCode] == null)
                        {
                            termTable.findOne({"id":ticket.gameCode + "_" + termCode},{wNum:1, status:1},[],function(err, result){
                                cacheObj[termCode] = {code:termCode, number:result.wNum};
                                check.setDrawNumber({code:termCode, number:result.wNum});
                                callbackMath(null);
                            });
                        }else{
                            log.info("111");
                            callbackMath(null);
                        }
                    },function(err){
                        callback(null);
                    });
                },function(err){
                    cb(err, check);
                });
           });
        },function(check, cb){
            log.info("算奖");
            var table = dc.mg.getConn().collection("errortable");
            var hasNext = true;
            var hitTable = dc.main.get("hitticket");
            async.whilst(
                function () { return hasNext;},
                function (callback) {
                    table.findAndRemove({}, {}, [], function(err, ticket){
                        if(err)
                        {
                            callback(err);
                            return;
                        }
                        if(ticket)
                        {
                            log.info(ticket);
                            var name = 'count';
                            var number = ticket.rNumber;
                            var bonusInfo = check[name]({number: number, bType:ticket.bType});
                            //保存中獎或者未中獎通知
                            self.sendMsg(ticket, bonusInfo, function(err){
                                if(err)
                                {
                                    callback(err);
                                    return;
                                }
                                if(ticket.bonus > 0) {
                                    var hitTicket = {
                                        id: ticket.id,
                                        outerId: ticket.outerId,
                                        bonus: ticket.bonus,
                                        bonusDetail: ticket.bonusDetail,
                                        bonusBeforeTax: ticket.bonusBeforeTax,
                                        auditTermCode: ticket.auditTermCode,
                                        dNumber: ticket.dNumber,
                                        status: ticketStatus.HIT
                                    };
                                    hitTable.save(hitTicket, [], function (err, data) {
                                        callback(null);
                                    });
                            }else{
                                callback();
                            }
                          });
                        }
                        else
                        {
                            hasNext = false;
                            callback();
                        }
                    });
                },
                function (err) {
                    cb(err);
                }
            );
        }
    ],function(){
           log.info("8888888");
           log.info("算奖完毕");
    })

};

ErrChuLi.prototype.sendMsg = function(ticket, bonusInfo, cb)
{
    var self = this;
    ticket.id = ticket._id;
    ticket.bonus = bonusInfo.bonus*ticket.multiple;
    ticket.bonusBeforeTax = bonusInfo.bonusBeforeTax*ticket.multiple;
    ticket.bonusDetail = JSON.stringify(bonusInfo.bonusDetail);
    if(ticket.bonus > 0)
    {
        ticket.status = ticketStatus.HIT;
    }
    else
    {
        ticket.status = ticketStatus.NOT_HIT;
    }
    delete ticket._id;
    delete ticket.version;
    delete ticket.takeTime;
    delete ticket.printId;
    cb(null);
}

new ErrChuLi();