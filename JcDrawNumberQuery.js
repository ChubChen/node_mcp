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
        }
    ], function (err) {
        self.crontab = new CronJob('*/1 * * * *', function () {

            log.info("查询开奖结果信息");
            var options = {url : 'http://www.okooo.com/jingcai/kaijiang/',"encoding":'binary'};
            self.get(options,self.handle);
        });
        self.crontab.start();
    })

}

JcDrawNumberQuery.prototype.get=function(options, cb){
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
                    if(cnWeek == "周一"){
                        mathCode = moment().weekday(1).format("YYYYMMDD")+"1"+code;
                    }else if(cnWeek == "周二"){
                        mathCode = moment().weekday(2).format("YYYYMMDD")+"2"+code;
                    }else if(cnWeek == "周三"){
                        mathCode = moment().weekday(3).format("YYYYMMDD")+"3"+code;
                    }else if(cnWeek == "周四"){
                        mathCode = moment().weekday(4).format("YYYYMMDD")+"4"+code;
                    }else if(cnWeek == "周五"){
                        mathCode = moment().weekday(5).format("YYYYMMDD")+"5"+code;
                    }else if(cnWeek == "周六"){
                        mathCode = moment().weekday(6).format("YYYYMMDD")+"6"+code;
                    }else {
                        mathCode = moment().weekday(0).format("YYYYMMDD")+"7"+code;
                    }
                    mathResult.push({termCode:mathCode,wNum:resutArray.join(",")});
                }
            });
            cb(mathResult);
        }
    });
}

JcDrawNumberQuery.prototype.handle=function(matchArray){
    var self = this;
    var jcDrawNumberCache = dc.mg.get("jcDrawNumberCache");
    var termTable = dc.main.get("term");
     async.each(matchArray, function(math, callback){
         var matchCode = math.termCode;
         var drawCahe = {"_id": matchCode, drawNumber: math.wNum};
             async.waterfall([
                 function(cb){
                     //将场次开奖结果放放入缓存
                     jcDrawNumberCache.findOne({"_id":matchCode}, {}, [], function(err, data){
                         if(data == null || data == undefined){
                             jcDrawNumberCache.save(drawCahe, [], function(err, data){
                                 cb(null);
                             });
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
                                if( data.status > termStatus.PREEND && data.status < termStatus.DRAW){
                                    log.info("更新开奖结果");
                                    log.info({id:data.id, wNum: math.wNum});
                                    var fromTerm = {id:data.id, wNum: math.wNum};
                                    termSer.draw(fromTerm, function (err, data) {
                                        if(err){
                                            cb(err);
                                        }else{
                                            cb(err, data);
                                        }
                                    });
                                }else{
                                    cb(null, null);
                                }
                            }
                     });
                 },
                 //发送期次已经开奖的消息
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
                 }
             ],function(err){
                  callback(err);
         });
     });
}
var jcJob = new JcDrawNumberQuery();
jcJob.startJob();


