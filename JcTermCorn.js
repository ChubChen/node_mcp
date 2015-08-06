/**
 * create by Ch on 2015-03-11
 */
var CronJob = require("cron").CronJob;
var http = require('http');
var qs = require('querystring');
var moment = require("moment");
var cons = require("mcp_constants");
var termStatus = cons.termStatus;
var async = require('async');
var esut = require('easy_util');
var dc = require('mcp_db').dc;
var log = esut.log;
var dateUtil = esut.dateUtil;

var JcTermCorn = function(){};

JcTermCorn.prototype.start = function()
{
    var self = this;
    async.waterfall([
        function(cb)
        {
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb)
        {
            self.job();
            cb(null, "success");
        },
    ], function (err, result) {
        if(err)
        {
            log.info(err); // -> null
        }
        else
        {
            log.info(result); // -> 16
        }
    });
}

JcTermCorn.prototype.get = function(options, cb)
{
    var self = this;
    log.info("请求数据时间");
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        var resData = '';
        res.on('data', function (chunk) {
            resData += chunk;
        });

        res.on('end', function(){
            if(resData){
                try{
                    cb(null, JSON.parse(resData));
                }catch (err){
                    log.error(err);
                }
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

JcTermCorn.prototype.handleT51 = function(Object, cb){
    async.waterfall([
        function (cb) {
            if(Object != undefined && Object!= null) {
		log.info("精彩网时间："+ Object.status.last_updated);
                var time = dateUtil.toDate(Object.status.last_updated).getTime();
                var jcUpdateTable = dc.mg.get("JcOddsLastUpdateTime");
                jcUpdateTable.findOne({"_id": "JCZQUPDATETIME"}, {}, [], function (err, data) {
                    if (err) {
                        cb(err)
                    } else {
                        if(data){
                            log.info(moment(data.date).format("YYYY-MM-DD HH:mm:ss"));
                            if (time <= data.date) {
                                cb("足球已经是最新的不用更新");
                            } else {
                                jcUpdateTable.findAndModify({"_id": "JCZQUPDATETIME"},{}, {$set:{"date": time}},[], function (err, data) {
                                    cb(null);
                                });
                            }
                        }else{
                            jcUpdateTable.save({"_id": "JCZQUPDATETIME","date": time},[], function (err, data) {
                                cb(null);
                            });
                        }
                    }
                });
            }else{
                cb(new Error("cuowu"));
            }
        },
        function(cb){
            var rstTermArray = new Array();
            var rstOddsArray = new Array();
            try{
                for(var key in Object.data){
                    var data = Object.data[key];
                    var beginDate = moment(data.b_date, "YYYY-MM-DD");
                    var week = beginDate.isoWeekday();
                    var code = beginDate.format("YYYYMMDD").valueOf() + week + data.num.substr(data.num.length-3);
                    var openTime = beginDate.format("YYYYMMDD hh:mm:ss");
                    var closeTime = data.date + " "+ data.time;
                    var status = termStatus.ON_SALE;
                    var term = {id:"T51_" + code, gameCode:"T51", code:code, nextCode: "-1", openTime:openTime, closeTime:closeTime, status:status};
                    var jcodds = {_id:"T51_" + code, matchCode: code, gameCode: "T51", createTime: moment().format("YYYYMMDD hh:mm:ss"),  l_cn:data.l_cn, home_cn:data.h_cn, guest_cn:data.a_cn,l_background_color:data.l_background_color };
                    rstTermArray.push(term);
                    if(data.had){
                        jcodds.had = {win:data.had.h, level:data.had.d, lose:data.had.a, status:data.had.p_status, single: data.had.single};
                    }
                    if(data.hhad){
                        jcodds.hhad = {win:data.hhad.h, level:data.hhad.d, lose:data.hhad.a, status:data.hhad.p_status, single: data.hhad.single, fixedodds: data.hhad.fixedodds};
                    }
                    //半全场
                    if(data.hafu){
                        jcodds.hafu = {winWinRate:data.hafu.hh, winLevelRate:data.hafu.hd, winLoseRate:data.hafu.ha,
                            levelWinRate:data.hafu.dh, levelLevelRate:data.hafu.dd, levelLoseRate:data.hafu.da,
                            loseWinRate:data.hafu.ah, loseLevelRate:data.hafu.ad, loseLoseRate:data.hafu.aa,
                            status:data.hafu.p_status, single: data.hafu.single };
                    }
                    if(data.crs){
                        jcodds.crs = {oneToZero:data.crs["0000"], twoToZero:data.crs["0200"], twoToOne:data.crs["0201"],
                            threeToZero:data.crs["0300"], threeToOne:data.crs["0301"], threeToTwo:data.crs["0302"],
                            fourToZero:data.crs["0400"], fourToOne:data.crs["0401"], fourToTwo:data.crs["0402"],
                            fiveToZero:data.crs["0500"], fiveToOne:data.crs["0501"], fiveToTwo:data.crs["0500"],
                            zeroToOne:data.crs["0001"], zeroToTwo:data.crs["0002"], oneToTwo:data.crs["0102"],
                            zeroToThree:data.crs["0003"], oneToThree:data.crs["0103"], twoToThree:data.crs["0203"],
                            zeroToFour:data.crs["0004"], oneToFour:data.crs["0104"], twoToFour:data.crs["0204"],
                            zeroToFive:data.crs["0005"], oneToFive:data.crs["0105"], twoToFive:data.crs["0205"],
                            zeroToZero:data.crs["0000"], oneToOne:data.crs["0101"], twoToTwo:data.crs["0202"],
                            threeToThree:data.crs["0303"], winOther:data.crs["-1-h"], lostOther:data.crs["-1-a"],
                            levelOther:data.crs["-1-d"],status:data.crs.p_status, single: data.crs.single };
                    }
                    if(data.ttg){
                        jcodds.ttg = {totalGoal0Rate:data.ttg.s0, totalGoal1Rate:data.ttg.s1, totalGoal2Rate:data.ttg.s2,
                            totalGoal3Rate:data.ttg.s3, totalGoal4Rate:data.ttg.s4, totalGoal5Rate:data.ttg.s5,
                            totalGoal6Rate:data.ttg.s6, totalGoal7Rate:data.ttg.s7,
                            status:data.ttg.p_status, single: data.ttg.single};
                    }
                    rstOddsArray.push(jcodds);
                }
            }catch (err){
                cb(err);
            }
            cb(null, rstTermArray, rstOddsArray);
        },
        //更新期次
        function(rstTermArray, rstOddsArray, cb){
            var cols = {id:1, gameCode:1, code:1};
            async.eachSeries(rstTermArray, function (term, callback) {
                var termTable = dc.main.get("term");
                 termTable.findOne({"id": term.id}, cols, [], function(err, data){
                     if(err){
                         log.error(err);
                         callback(err);
                     }else{
                         if(data == null || data == undefined){
                             termTable.save(term, [], function(err , data){
                                 callback(null);
                             })
                         }else{
                             callback(null);
                         }
                     }
                 });
            }, function (err) {
                if(err){
                    cb(err);
                }else{
                    cb(null, rstOddsArray);
                }
            });
        },
        //删除历史赔率
        function(rstOddsArray, cb){
            var jcoddsTable = dc.mg.get("jcodds");
            jcoddsTable.remove({gameCode:"T51"}, [], function(err,data){
                 cb(null, rstOddsArray);
            });
        },
        function(rstOddsArray, cb){
            async.eachSeries(rstOddsArray, function (odds, callback) {
                var jcoddsTable = dc.mg.get("jcodds");
                jcoddsTable.save(odds, function(err, data){
                        log.info(odds)
                       callback(null);
                })
            }, function (err) {
                cb(err);
            });
        }
    ],function (err, result) {
        cb(err);
    });
};

JcTermCorn.prototype.handleT52 = function(Object, cb){
    async.waterfall([
        function (cb) {
            var time = dateUtil.toDate(Object.status.last_updated).getTime();
            var jcUpdateTable = dc.mg.get("JcOddsLastUpdateTime");
            jcUpdateTable.findOne({"_id": "JCLQUPDATETIME"}, {}, [], function (err, data) {
                if(err){
                    cb(err)
                }else{
                    if(data){
                        if(time <= data.date){
                            cb("篮球已经是最新的不用更新");
                        }else{
                            jcUpdateTable.findAndModify({"_id":"JCLQUPDATETIME"},{}, {$set:{"date": time}}, [] ,function(err, data){
                                cb(null);
                            });
                        }
                    }else{
                        jcUpdateTable.save({"_id":"JCLQUPDATETIME" ,"date": time}, [] ,function(err, data){
                            cb(null);
                        });
                    }
                }
            });
        },
        function(cb){
            var rstTermArray = new Array();
            var rstOddsArray = new Array();
            try{
                for(var key in Object.data){
                    var data = Object.data[key];
                    var beginDate = moment(data.b_date, "YYYY-MM-DD");
                    var week = beginDate.isoWeekday();
                    var code = beginDate.format("YYYYMMDD").valueOf() + week + data.num.substr(data.num.length-3);
                    var openTime = beginDate.format("YYYYMMDD hh:mm:ss");
                    var closeTime = data.date + " "+ data.time;
                    var status = termStatus.ON_SALE;
                    var term = {id:"T52_" + code, gameCode:"T52", code:code, nextCode: "-1", openTime:openTime, closeTime:closeTime, status:status};
                    var jcodds = {_id:"T52_" + code, matchCode: code, gameCode: "T52", createTime: moment().format("YYYYMMDD hh:mm:ss"),  l_cn:data.l_cn, home_cn:data.h_cn, guest_cn:data.a_cn,l_background_color:data.l_background_color };
                    if(data.mnl){
                        jcodds.mnl = {win:data.mnl.h, lose:data.mnl.a, status:data.mnl.p_status, single: data.mnl.single, fixedodds: data.mnl.fixedodds};
                    }
                    if(data.hdc){
                        jcodds.hdc = {win:data.hdc.h,  lose:data.hdc.a, status:data.hdc.p_status, single: data.hdc.single, fixedodds: data.hdc.fixedodds};
                    }
                    //胜分差
                    if(data.wnm){
                        jcodds.wnm = {hostWin1:data.wnm.w1, hostWin2: data.wnm.w2, hostWin3: data.wnm.w3, hostWin4 : data.wnm.w4, hostWin5: data.wnm.w5, hostWin6: data.wnm.w6,
                            guestWin1: data.wnm.l1, guestWin2: data.wnm.l2, guestWin3: data.wnm.l3, guestWin4: data.wnm.l4, guestWin5: data.wnm.l5, guestWin6: data.wnm.l6,
                            status:data.wnm.p_status, single: data.wnm.single,fixedodds: data.hdc.fixedodds
                        };
                    }
                    if(data.hilo){
                        jcodds.hilo = {big:data.hilo.h,  small:data.hilo.l, status:data.hilo.p_status, single: data.hilo.single, fixedodds: data.hilo.fixedodds};
                    }
                    rstOddsArray.push(jcodds);
                    rstTermArray.push(term);
                }
            }catch (err){
                cb(err)
            }
            cb(null, rstTermArray,  rstOddsArray);
        },
        function(rstTermArray,  rstOddsArray,  cb){
            var cols = {id:1, gameCode:1, code:1};
            async.eachSeries(rstTermArray, function (term, callback) {
                var termTable = dc.main.get("term");
                termTable.findOne({"id": term.id}, cols, [], function(err, data){
                    if(err){
                        log.error(err);
                        callback(err);
                    }else{
                        if(data == null || data == undefined){
                            termTable.save(term, [], function(err , data){
                                callback(null);
                            })
                        }else{
                            callback(null);
                        }
                    }
                });
            }, function (err) {
                cb(err, rstOddsArray);
            });
        },
        //删除历史赔率
        function(rstOddsArray, cb){
            var jcoddsTable = dc.mg.get("jcodds");
            jcoddsTable.remove({gameCode:"T52"}, [], function(err,data){
                cb(null, rstOddsArray);
            });
        },
        function(rstOddsArray, cb){
            async.eachSeries(rstOddsArray, function (odds, callback) {
                var jcoddsTable = dc.mg.get("jcodds");
                jcoddsTable.save(odds, function(err, data){
                    log.info(odds)
                    callback(null);
                })
            }, function (err) {
                cb(err);
            });
        }
    ],function(err){
        cb(err);
    });
};

JcTermCorn.prototype.job = function () {
    var self = this;
    var corn = new CronJob('*/30 * * * * *', function () {
        async.waterfall([
               function(cb){
                   //竞猜足球的抓取胜平负数据
                   var data = {
                       'i_format': 'json',
                       'poolcode[0]':'hhad', //让球胜平负
                       'poolcode[1]':'had', //胜平负
                       'poolcode[2]':'crs', //比分
                       'poolcode[3]':'ttg', //总进球
                       'poolcode[4]':'hafu', //半全场
                       '_':new Date().getTime()
                   };
                   var content = qs.stringify(data);
                   var options = {
                       hostname: 'i.sporttery.cn',
                       port: 80,
                       path: '/odds_calculator/get_odds?' + content,
                       method: 'GET'
                   };
                   self.get(options, function(err , jsonData){
                       if(err){
                           log.info(err);
                           cb(err);
                       }else{
                           if(jsonData){
                               self.handleT51(jsonData, function(err){
                                   log.error(err);
                                   cb(null);
                               });
                           }else{
                               log.error(new Error("竞猜足球没有查询到结果"));
                               cb(null);
                           }
                       }
                   });
               },
               function(cb){
                   //竞猜篮球的抓取
                   var data = {
                       'i_format': 'json',
                       'poolcode[0]':'mnl', //胜负
                       'poolcode[1]':'hdc',//让分
                       'poolcode[2]':'wnm', //胜分差
                       'poolcode[3]':'hilo', //大小
                       '_':new Date().getTime()
                   };
                   var content = qs.stringify(data);
                   var options = {
                       hostname: 'i.sporttery.cn',
                       port: 80,
                       path: '/odds_calculator/get_odds?' + content,
                       method: 'GET'
                   };
                   self.get(options, function(err , jsonData){
                       if(err){
                           cb(err)
                       }else{
                           if(jsonData){
                               self.handleT52(jsonData, function(err){
                                   cb(err);
                               });
                           }else {
                               cb(new Error("竞猜篮球没有查询到结果"));
                           }
                       }
                   });
               }
        ],function(err){
            console.log(err);
            console.log("竞猜场次录入");
        })
   });
    corn.start();
};

var JcUpdate = new JcTermCorn();
JcUpdate.start();
