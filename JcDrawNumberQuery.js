var CronJob = require("cron").CronJob;
var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');
var Iconv = require('iconv').Iconv;
var dc = require('mcp_db').dc;
var service = require("mcp_service");
var notifySer = service.notifySer;
var termSer = service.termSer;


var esut = require("easy_util");
var log = esut.log;

var async = require('async');
var termStatus = require("mcp_constants").termStatus;




var JcDrawNumberQuery = function () {
};

JcDrawNumberQuery.prototype.startJob=function(){
    var self = this;
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb){
            dc.check(function(err){
                cb(err);
            });
        }
    ], function (err) {
        if(err){
            log.error(err);
        }else{
            self.crontab = new CronJob('*/5 * * * * *', function () {
                log.info("执行");
                async.waterfall([
                    function(cb){
                        var options = {url : 'http://www.okooo.com/jingcai/kaijiang/',"encoding":'binary'};
                        self.getT51(options,function(matchResult){
                            self.handleT51(matchResult, function(err){
                                cb(null);
                            })
                        });
                    },
                    function(cb){
                        var options = {url : 'http://www.okooo.com/jingcailanqiu/kaijiang/',"encoding":'binary'};
                        self.getT52(options,function(matchResult){
                            self.handleT52(matchResult, function(err){
                                cb(err);
                            })
                        });
                    }
                ],function(err){
                    console.log(err);
                })
            });
            self.crontab.start();
        }
    })

}

JcDrawNumberQuery.prototype.getT51=function(options, cb){
    request(options, function (error, res, body) {
        if (!error && res.statusCode == 200) {
            body = new Iconv('GBK','UTF8').convert(new Buffer(body,'binary')).toString();
            var $ = cheerio.load(body);
            var tr = $('table').find(".trClass");
            var mathResult = new Array();
            tr.each(function (index, ele) {
                var math = $(this).find("td").eq(0).text();
                var code = math.substr(math.length -3);
                var cnWeek = math.substr(0, math.length -3);
                var resutArray = new Array();
                var halfResult = $(this).find("td").eq(5).text().replace("-",":");
                var endResult = $(this).find("td").eq(6).text().replace("-",":");
                var rangQiu = $(this).find("td").eq(9).text();
                if(halfResult.length == 3){
                    resutArray.push(halfResult);
                    resutArray.push(endResult);
                    resutArray.push(rangQiu);
                    var mathCode = "";
                    var today = moment();
                    if(cnWeek == "周一"){
                        var resultDay = moment().isoWeekday(1);
                        if(resultDay > today){
                           resultDay == resultDay.subtract(7,'day');
                        }
                        mathCode = resultDay.format("YYYYMMDD")+resultDay.isoWeekday()+code;
                    }else if(cnWeek == "周二"){
                        var resultDay = moment().isoWeekday(2);
                        if(resultDay > today){
                            resultDay = resultDay.subtract(7,'day');
                        }
                        mathCode = resultDay.format("YYYYMMDD")+resultDay.isoWeekday()+code;
                    }else if(cnWeek == "周三"){
                        var resultDay = moment().isoWeekday(3);
                        if(resultDay > today){
                            resultDay = resultDay.subtract(7,'day');
                        }
                        mathCode = resultDay.format("YYYYMMDD")+resultDay.isoWeekday()+code;
                    }else if(cnWeek == "周四"){
                        var resultDay = moment().isoWeekday(4);
                        if(resultDay > today){
                            resultDay = resultDay.subtract(7,'day');
                        }
                        mathCode = resultDay.format("YYYYMMDD")+resultDay.isoWeekday()+code;
                    }else if(cnWeek == "周五"){
                        var resultDay = moment().isoWeekday(5);
                        if(resultDay > today){
                            resultDay = resultDay.subtract(7,'day');
                        }
                        mathCode = resultDay.format("YYYYMMDD")+resultDay.isoWeekday()+code;
                    }else if(cnWeek == "周六"){
                        var resultDay = moment().isoWeekday(6);
                        if(resultDay > today){
                            resultDay = resultDay.subtract(7,'day');
                        }
                        mathCode = resultDay.format("YYYYMMDD")+resultDay.isoWeekday()+code;
                    }else {
                        var resultDay = moment().isoWeekday(7);
                        if(resultDay > today){
                            resultDay = resultDay.subtract(7,'day');
                        }
                        mathCode = resultDay.format("YYYYMMDD")+resultDay.isoWeekday()+code;
                    }
                    mathResult.push({termCode:mathCode,wNum:resutArray.join(",")});
                }
            });
            cb(mathResult);
        }
    });
};

JcDrawNumberQuery.prototype.getT52=function(options, cb){
    request(options, function (error, res, body) {
        if (!error && res.statusCode == 200) {
            body = new Iconv('GBK','UTF8').convert(new Buffer(body,'binary')).toString();
            var $ = cheerio.load(body);
            var tr = $('table').find(".trClass");
            var mathResult = new Array();
            tr.each(function (index, ele) {
                var math = $(this).find("td").eq(0).text();
                var code = math.substr(math.length -3);
                var cnWeek = math.substr(0, math.length -3);
                var endResult = $(this).find("td").eq(5).text().split("-").reverse().join(":");
                if(endResult.length > 1){
                    var mathCode = "";
                    var today = moment();
                    if(cnWeek == "周一"){
                        var resultDay = moment().isoWeekday(1);
                        if(resultDay > today){
                            resultDay == resultDay.subtract(7,'day');
                        }
                        mathCode = resultDay.format("YYYYMMDD")+resultDay.isoWeekday()+code;
                    }else if(cnWeek == "周二"){
                        var resultDay = moment().isoWeekday(2);
                        if(resultDay > today){
                            resultDay = resultDay.subtract(7,'day');
                        }
                        mathCode = resultDay.format("YYYYMMDD")+resultDay.isoWeekday()+code;
                    }else if(cnWeek == "周三"){
                        var resultDay = moment().isoWeekday(3);
                        if(resultDay > today){
                            resultDay = resultDay.subtract(7,'day');
                        }
                        mathCode = resultDay.format("YYYYMMDD")+resultDay.isoWeekday()+code;
                    }else if(cnWeek == "周四"){
                        var resultDay = moment().isoWeekday(4);
                        if(resultDay > today){
                            resultDay = resultDay.subtract(7,'day');
                        }
                        mathCode = resultDay.format("YYYYMMDD")+resultDay.isoWeekday()+code;
                    }else if(cnWeek == "周五"){
                        var resultDay = moment().isoWeekday(5);
                        if(resultDay > today){
                            resultDay = resultDay.subtract(7,'day');
                        }
                        mathCode = resultDay.format("YYYYMMDD")+resultDay.isoWeekday()+code;
                    }else if(cnWeek == "周六"){
                        var resultDay = moment().isoWeekday(6);
                        if(resultDay > today){
                            resultDay = resultDay.subtract(7,'day');
                        }
                        mathCode = resultDay.format("YYYYMMDD")+resultDay.isoWeekday()+code;
                    }else {
                        var resultDay = moment().isoWeekday(7);
                        if(resultDay > today){
                            resultDay = resultDay.subtract(7,'day');
                        }
                        mathCode = resultDay.format("YYYYMMDD")+resultDay.isoWeekday()+code;
                    }
                    mathResult.push({termCode:mathCode,wNum:endResult});
                }
            });
            cb(mathResult);
        }
    });
};

JcDrawNumberQuery.prototype.handleT51=function(matchArray, cb){
    var self = this;
    var jcDrawNumberCache = dc.mg.get("jcDrawNumberCache");
    var termTable = dc.main.get("term");
     async.each(matchArray, function(math, callback){
         var matchCode = math.termCode;
         var drawCahe = {$set:{"_id": matchCode, drawNumber: math.wNum}};
             async.waterfall([
                 function(cb){
                     log.info(drawCahe);
                     //将场次开奖结果放放入缓存
                     jcDrawNumberCache.findAndModify({"_id":matchCode}, drawCahe, {upsert:true}, function(err, data){
                        if(err){
                            cb(err);
                        }else{
                            cb(null);
                        }
                     });
                 },
                 //更新期次状态
                 function (cb) {
                     termTable.findOne({'id':"T51_" + matchCode}, {}, [], function(err, data){
                            if(err){
                                cb(err);
                            }else{
                                log.info(data);
                                if( data != null  &&  (data.status > termStatus.PREEND || data.status < termStatus.DRAW)){
                                    if(math.wNum != data.wNum) {
                                        log.info("更新开奖结果");
                                        var cond = {id: data.id, version: data.version};
                                        var fromTerm = {$set: {wNum: math.wNum, version: data.version++}};
                                        termTable.update(cond, fromTerm, [], function (err, data) {
                                            if (err) {
                                                cb(err);
                                            } else {
                                                cb(data);
                                            }
                                        });
                                    }else{
                                        cb(null);
                                    }
                                    /*termSer.draw(fromTerm, function (err, data) {
                                        if(err){
                                            cb(err);
                                        }else{
                                            cb(err, data);
                                        }
                                    });*/
                                }else{
                                    cb(null);
                                }
                            }
                     });
                 },
                 /*//发送期次已经开奖的消息
                 function (term, cb) {
                     log.info(term)
                     if(term && term.status == termStatus.DRAW)
                     {
                         notifySer.saveTerm(term, function(){
                             cb(null)
                         });
                     }
                     else
                     {
                         cb(null);
                     }
                 }*/
             ],function(err){
                  callback(err);
         });
     },function(){
        cb(null);
    });
};

JcDrawNumberQuery.prototype.handleT52=function(matchArray, cb){
    var self = this;
    var jcDrawNumberCache = dc.mg.get("jcDrawNumberCache");
    var termTable = dc.main.get("term");
    async.each(matchArray, function(math, callback){
        var matchCode = math.termCode;
        var drawCahe = {$set:{"_id": matchCode, drawNumber: math.wNum}};
        async.waterfall([
            function(cb){
                log.info(drawCahe);
                //将场次开奖结果放放入缓存
                jcDrawNumberCache.findAndModify({"_id":matchCode}, drawCahe, [{upsert:true}], function(err, data){
                    if(err){
                        log.error(err);
                        cb(err);
                    }else{
                        cb(null);
                    }
                });
            },
            //更新期次状态
            function (cb) {
                termTable.findOne({'id':"T52_" + matchCode}, {}, [], function(err, data){
                    if(err){
                        log.error(err);
                        cb(err);
                    }else{
                        log.info(data);
                        if( data != null  &&  (data.status > termStatus.PREEND || data.status < termStatus.DRAW)){
                            if(math.wNum != data.wNum){
                                log.info("更新开奖结果");
                                log.info({id:data.id, wNum: math.wNum});
                                var cond = {id:data.id, version:data.version};
                                var fromTerm = {$set:{wNum: math.wNum, version:data.version}};
                                termTable.update(cond, fromTerm, [], function(err, data){
                                    if(err){
                                        log.error(err);
                                        cb(err);
                                    }else{
                                        cb(data);
                                    }
                                });
                            }else{
                                cb(null);
                            }
                            /*termSer.draw(fromTerm, function (err, data) {
                                if(err){
                                    log.error(err);
                                    cb(err);
                                }else{
                                    cb(err, data);
                                }
                            });*/
                        }else{
                            cb(null);
                        }
                    }
                });
            },
            /*//发送期次已经开奖的消息
            function (term, cb) {
                log.info(term)
                if(term && term.status == termStatus.DRAW)
                {
                    notifySer.saveTerm(term, function(){
                        cb(null)
                    });
                }
                else
                {
                    cb(null);
                }
            }*/
        ],function(err){
            callback(err);
        });
    },function(){
        cb(null);
    });
}
var jcJob = new JcDrawNumberQuery();
jcJob.startJob();


