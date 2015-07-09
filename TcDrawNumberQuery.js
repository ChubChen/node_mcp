var CronJob = require("cron").CronJob;
var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');
var Iconv = require('iconv').Iconv;
var http = require('http');

var dc = require('mcp_db').dc;
var service = require("mcp_service");
var notifySer = service.notifySer;
var termSer = service.termSer;


var esut = require("easy_util");
var log = esut.log;

var async = require('async');
var constants = require("mcp_constants");
var termStatus = constants.termStatus;
var gameGrade = constants.gameGrade;




var TcDrawNumberQuery = function () {

};

TcDrawNumberQuery.prototype.startJob=function(){
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
        log.info(err);
        self.crontab = new CronJob('*/10 * 20-24 * * *', function () {
            log.info("开始执行抓取任务");
               self.handle(function(err){
                   if(err){
                       log.error(err);
                   }
               });
        });
        self.crontab.start();
    })

};

TcDrawNumberQuery.prototype.handle = function(cb){
    var self = this;
    var termTable = dc.main.get("term");
    //第一步查找要开奖的游戏
    var queryTime = new Date().getTime();
    var cond = {status:termStatus.WAITING_DRAW_NUMBER, wNum: "", closeTime : {$gte : queryTime - 1000*60*60*24}, gameCode: {$in:['T01','T02','T03','T04']}};
    termTable.find(cond,{id:1, code:1, gameCode:1}, []).sort({closeTime:1}).toArray(function (err, data) {
        if(err){
            cb(err);
        }else{
            log.info(data);
            async.eachSeries(data, function(term , callback){
                var gameCode = term.gameCode;
                var method = "get"+gameCode;
                if(self[method]){
                    self[method](term, function(err){
                        if(err){
                            log.error(err);
                        }
                        callback(null);
                    })
                }else{
                    log.info("暂时没有["+gameCode+"]该游戏的抓取方法");
                    callback(null);
                }
            },function(err){
                cb(err);
            });
        }
    });
};


TcDrawNumberQuery.prototype.getT01 = function(term, cb){
    var self = this;
    var openTime = new Date().getTime();
     async.waterfall([
         function(cb){
             var options = {url : 'http://www.310win.com/daletou/kaijiang_sz_20.html',"encoding":'binary'};
             request(options, function (error, res, body) {
                 if (!error && res.statusCode == 200) {
                     body = new Buffer(body, 'binary').toString();
                     var $ = cheerio.load(body);
                     var Id = $("#dropIssueNum").children().eq(0).attr("value");
                     cb(null, Id);
                 }
             });
         },
        function(Id, cb){
            var options = {
                hostname: 'www.310win.com',
                port: 80,
                path: "/Info/Result/Numeric.aspx?load=ajax&typeID=20&IssueID=" +Id+ "&_=" + Math.random(),
                method: 'GET'
            };
            self.get(options, function(err, data){
               if(err){
                   cb(err);
               }else{
                   try{
                       if(term.code == data.IssueNum.substr(2)){
                           var tempArray = data.Results.split(",");
                           var blueArray = tempArray.slice(5,7);
                           var redArray = tempArray.slice(0,5);
                           var wNum = redArray.join(",")+"|"+blueArray.join(",");
                           var totalsalemoney = data.SaleMoney.replace(/[^0-9]/g, "") *100;
                           term.wNum = wNum;
                           term.status = 1500;
                           term.totalsalemoney = totalsalemoney;
                           term.pool =  data.PoolMoney.replace(/[^0-9]/g, "") * 100;
                           if(totalsalemoney == 0){
                               cb(null, []);
                               return;
                           }
                           var Table = data.Table;
                           var grades = new Array();
                           //添加基本奖级
                           for(var i = 0 ; i< Table.length; i++){
                               var tempTable = Table[i];
                               var gameGradeItem  = {};
                               gameGradeItem.level = tempTable["ID"];
                               gameGradeItem.id= term.id + "_" + gameGradeItem.level;
                               gameGradeItem.code = "lv"+gameGradeItem.level;
                               gameGradeItem.gameCode = term.gameCode;
                               gameGradeItem.name =   tempTable["Grade"];
                               gameGradeItem.count = tempTable["BasicStakes"];
                               gameGradeItem.termCode = term.code;
                               if(gameGradeItem.count == 0){
                                   gameGradeItem.bonus = 0;
                               }else{
                                   gameGradeItem.bonus = tempTable["BasicBonus"].replace(/[^0-9]/g,"") * 100;
                               }
                               grades.push(gameGradeItem);
                           }
                           //添加追加奖级
                           for(var i = 0 ; i< Table.length; i++){
                               var tempTable = Table[i];
                               var gameGradeItemZh  = {};
                               if(tempTable["ID"] && tempTable["ID"] != 6){
                                   var id = parseInt(tempTable["ID"],10) + 6;
                                   gameGradeItemZh.level = id;
                                   gameGradeItemZh.id= term.id + "_" + gameGradeItemZh.level;
                                   gameGradeItemZh.gameCode = term.gameCode;
                                   gameGradeItemZh.code = "lv"+id;
                                   gameGradeItemZh.name =   tempTable["Grade"] + "追加";
                                   gameGradeItemZh.count = tempTable["PursueStakes"];
                                   gameGradeItemZh.termCode = term.code;
                                   if(gameGradeItemZh.count == 0){
                                       gameGradeItemZh.bonus = 0;
                                   }else{
                                       gameGradeItemZh.bonus = tempTable["PursueBonus"].replace(/[^0-9]/g,"") * 100;
                                   }
                                   grades.push(gameGradeItemZh);
                               }
                           }
                           log.info(grades);
                           log.info(term);
                           log.info("耗时：" + (new Date().getTime() - openTime));
                           self.saveGrades(term, grades, function(err){
                               cb(err);
                           });
                       }else{
                           cb("要抓去的数据和抓取的数据不一致")
                       }
                   }catch (err){
                       log.error(err);
                       cb(err)
                   }
               }
            })
        }
    ], function(err){
            cb(err);
    });
};

TcDrawNumberQuery.prototype.saveGrades = function(term, grades, cb){
    var self  = this;
    var gradeTable = dc.main.get("gamegrade");
    if(grades.length > 0){
        async.eachSeries(grades, function(grade, callback){
            gradeTable.findOne({id: grade.id},[], function (err ,data) {
                if(data){
                    var sets = {$set:grade};
                    gradeTable.update({id: grade.id}, sets ,[], function(err){
                        callback(err);
                    });
                }else{
                    gradeTable.save(grade,[], function(err){
                        callback(err);
                    });
                }
            });
        }, function (err) {
            if(err){
                cb(err);
            }else{
                var termTable = dc.main.get("term");
                var cond = {id: term.id};
                var formTerm = {$set:term};
                termTable.update(cond, formTerm, {}, function(err, data){
                    notifySer.saveTerm(term, function(err){
                        cb(err);
                    });
                });
            }
        });
    }else{
        cb("等待奖级结果出来后更新");
    }
};

TcDrawNumberQuery.prototype.getT02 = function(term, cb){
    var self = this;
    var openTime = new Date().getTime();
    async.waterfall([
        function(cb){
	    log.info("现在开始抓取七星彩第:" +term.code+ "期数据");
            var options = {url : 'http://www.310win.com/qixingcai/kaijiang_sz_25.html',"encoding":'binary'};
            request(options, function (error, res, body) {
                if (!error && res.statusCode == 200) {
                    body = new Buffer(body, 'binary').toString();
                    var $ = cheerio.load(body);
                    var Id = $("#dropIssueNum").children().eq(0).attr("value");
                    cb(null, Id);
                }
            });
        },
        function(Id, cb){
            var options = {
                hostname: 'www.310win.com',
                port: 80,
                path: "/Info/Result/Numeric.aspx?load=ajax&typeID=25&IssueID=" +Id+ "&_=" + Math.random(),
                method: 'GET'
            };
            self.get(options, function(err, data){
                if(err){
		    log.info(err);
                    cb(err);
                }else{
                    try{
			log.info(data);
                        if(term.code == data.IssueNum.substr(2)){
                            var wNum = data.Results;
                            var totalsalemoney = data.SaleMoney.replace(/[^0-9]/g, "") *100;
                            term.wNum = wNum;
                            term.status = 1500;
                            term.totalsalemoney = totalsalemoney;
                            term.pool =  data.PoolMoney.replace(/[^0-9]/g, "") * 100;
                            if(totalsalemoney == 0){
                                cb(null, []);
                                return;
                            }
                            var Table = data.Table;
                            var grades = new Array();
                            var mapGrade = {"一等奖": 1, "二等奖": 2, "三等奖": 3, "四等奖": 4, "五等奖": 5, "六等奖": 6}
                            //添加基本奖级
                            for(var i = 0 ; i< Table.length; i++){
                                var tempTable = Table[i];
                                var gameGradeItem  = {};
                                if(mapGrade[tempTable["Grade"].trim()]){
                                    gameGradeItem.level = mapGrade[tempTable["Grade"].trim()];
                                    gameGradeItem.id= term.id + "_" + gameGradeItem.level;
                                    gameGradeItem.code = "lv"+gameGradeItem.level;
                                    gameGradeItem.gameCode = term.gameCode;
                                    gameGradeItem.name =   tempTable["Grade"];
                                    gameGradeItem.count = tempTable["BasicStakes"];
                                    gameGradeItem.termCode = term.code;
                                    if(gameGradeItem.count == 0){
                                        gameGradeItem.bonus = 0;
                                    }else{
                                        gameGradeItem.bonus = tempTable["BasicBonus"].replace(/[^0-9]/g,"") * 100;
                                    }
                                    grades.push(gameGradeItem);
                                }
                            }
                            log.info(grades);
                            log.info(term);
                            log.info("耗时：" + (new Date().getTime() - openTime));
                            self.saveGrades(term, grades, function(err){
                                cb(err);
                            });
                        }else{
                            cb("要抓去的数据和抓取的数据不一致")
                        }
                    }catch (err){
                        log.error(err);
                        cb(err)
                    }
                }
            })
        }
    ], function(err){
        cb(err);
    });
};

TcDrawNumberQuery.prototype.getT03 = function(term, cb){
    var self = this;
    var openTime = new Date().getTime();
    async.waterfall([
        function(cb){
            var options = {url : 'http://www.310win.com/pailie3/kaijiang_sz_26.html',"encoding":'binary'};
            request(options, function (error, res, body) {
                if (!error && res.statusCode == 200) {
                    body = new Buffer(body, 'binary').toString();
                    var $ = cheerio.load(body);
                    var Id = $("#dropIssueNum").children().eq(0).attr("value");
                    cb(null, Id);
                }
            });
        },
        function(Id, cb){
            var options = {
                hostname: 'www.310win.com',
                port: 80,
                path: "/Info/Result/Numeric.aspx?load=ajax&typeID=26&IssueID=" +Id+ "&_=" + Math.random(),
                method: 'GET'
            };
            self.get(options, function(err, data){
                if(err){
                    cb(err);
                }else{
                    try{
                        if(term.code == data.IssueNum){
                            var wNum = data.Results;
                            var totalsalemoney = data.SaleMoney.replace(/[^0-9]/g, "") *100;
                            term.wNum = wNum;
                            term.status = 1500;
                            term.totalsalemoney = totalsalemoney;
                            term.pool =  data.PoolMoney.replace(/[^0-9]/g, "") * 100;
                            log.info(term);
                            log.info("耗时：" + (new Date().getTime() - openTime));
                            cb(null);
                        }else{
                            cb("要抓去的数据和抓取的数据不一致")
                        }
                    }catch (err){
                        log.error(err);
                        cb(err)
                    }
                }
            })
        },
        function(cb){
            var termTable = dc.main.get("term");
            var cond = {id: term.id};
            var formTerm = {$set:term};
            termTable.update(cond,  formTerm, {}, function(err, data){
                notifySer.saveTerm(term, function(err){
                    cb(err);
                });
            });
        }
    ], function(err){
        cb(err);
    });
};

TcDrawNumberQuery.prototype.getT04 = function(term, cb){
    var self = this;
    var openTime = new Date().getTime();
    async.waterfall([
        function(cb){
	    log.info("开始抓取排列五第"+term.code+"期数据");
            var options = {url : 'http://www.310win.com/pailie5/kaijiang_sz_27.html',"encoding":'binary'};
            request(options, function (error, res, body) {
                if (!error && res.statusCode == 200) {
                    body = new Buffer(body, 'binary').toString();
                    var $ = cheerio.load(body);
                    var Id = $("#dropIssueNum").children().eq(0).attr("value");
                    cb(null, Id);
                }
            });
        },
        function(Id, cb){
            var options = {
                hostname: 'www.310win.com',
                port: 80,
                path: "/Info/Result/Numeric.aspx?load=ajax&typeID=27&IssueID=" +Id+ "&_=" + Math.random(),
                method: 'GET'
            };
            self.get(options, function(err, data){
                if(err){
                    cb(err);
                }else{
                    try{
                        if(term.code == data.IssueNum){
                            var wNum = data.Results;
                            var totalsalemoney = data.SaleMoney.replace(/[^0-9]/g, "") *100;
                            term.wNum = wNum;
                            term.status = 1500;
                            term.totalsalemoney = totalsalemoney;
                            term.pool =  data.PoolMoney.replace(/[^0-9]/g, "") * 100;
                            log.info(term);
                            log.info("耗时：" + (new Date().getTime() - openTime));
                            cb(null);
                        }else{
                            cb("要抓去的数据和抓取的数据不一致")
                        }
                    }catch (err){
                        log.error(err);
                        cb(err)
                    }
                }
            })
        },
        function(cb){
            var termTable = dc.main.get("term");
            var cond = {id: term.id};
            var formTerm = {$set:term};
            termTable.update(cond, formTerm, {}, function(err, data){
                notifySer.saveTerm(term, function(err){
                    cb(err);
                });
            });
        }
    ], function(err){
        cb(err);
    });
};

TcDrawNumberQuery.prototype.get = function(options, cb)
{
    var self = this;
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        var resData = '';
        res.on('data', function (chunk) {
            resData += chunk;
        });

        res.on('end', function(){
            if(resData){
                cb(null, JSON.parse(resData));
            }else{
                log.error("请求返回结果为空");
            }
        });
    });
    req.setTimeout(20000, function(){
        cb(new Error("time out"), null);
    });
    req.on('error', function (e) {
        log.info('problem with request: ' + e.message);
        cb(e, null);
    });
    req.end();
};

var jcJob = new TcDrawNumberQuery();
jcJob.startJob();
