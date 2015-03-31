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
            var cond = {id:{$in:["21559",
                "22557",
                "22559",
                "22570",
                "22582",
                "23155",
                "23173",
                "23174",
                "23176",
                "23177",
                "23178",
                "23182",
                "23183",
                "23184",
                "23185",
                "23236",
                "23256",
                "23257",
                "23258",
                "23265",
                "23266",
                "23267",
                "23268",
                "23272",
                "23300",
                "23303",
                "23352",
                "23428",
                "23429",
                "23436",
                "23437",
                "23457",
                "23460",
                "23490",
                "23518",
                "23519",
                "23520",
                "23521",
                "23540",
                "23544",
                "23546",
                "23548",
                "23550",
                "23589",
                "23603",
                "23730",
                "23732",
                "23733",
                "23750",
                "23754",
                "23756",
                "23800",
                "23819",
                "23824",
                "23849",
                "23902",
                "23904",
                "23905",
                "23907",
                "23917",
                "23921",
                "23967",
                "24092",
                "24098",
                "24099",
                "24100",
                "24102",
                "24103",
                "24104",
                "24105",
                "24106",
                "24143",
                "24150",
                "24151",
                "24178",
                "24179",
                "24258",
                "24259",
                "24268",
                "24285",
                "24357",
                "24361",
                "24400",
                "24452",
                "24478",
                "24479",
                "24480",
                "24514",
                "24538",
                "24539"]}};
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

