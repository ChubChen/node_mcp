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
        //start web
        function(cb)
        {
            self.job();
            cb(null, "success");
        }
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
            cb(null, JSON.parse(resData));
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

JcTermCorn.prototype.handle = function(err , Object){
    async.waterfall([
        function (cb) {
            //竞猜网上最后更新的时间
            var time = dateUtil.toDate(Object.status.last_updated).getTime();
            var jcUpdateTable = dc.mg.get("JcOddsLastUpdateTime");
            jcUpdateTable.findOne({"_id": "JCUPDATETIME"}, {}, [], function (err, data) {
                if(err){
                    cb(err)
                }else{
                    if(data && time <= data.date){
                        cb("已经是最新的不用更新");
                    }else{
                        jcUpdateTable.save({"_id":"JCUPDATETIME", date: time}, [] ,function(err, data){
                            cb(null);
                        });
                    }
                }
            });
        },
        function(cb){
            var rstTermArray = new Array();
            var rstOddsArray = new Array();
            for(var key in Object.data){
                var data = Object.data[key];
                var beginDate = moment(data.b_date, "YYYY-MM-DD");
                var week = beginDate.isoWeekday();
                var code = beginDate.format("YYYYMMDD").valueOf() + week + data.num.substr(data.num.length-3);
                var openTime = beginDate.format("YYYYMMDD hh:mm:ss");
                var closeTime = data.date + " "+ data.time;
                var status = termStatus.ON_SALE;
                var term = {id:"T51_" + code, gameCode:"T51", code:code, nextCode: "-1", openTime:openTime, closeTime:closeTime, status:status};
                rstTermArray.push(term);
                if(data.had){
                    var jcodds = {_id:"T51_" + code +"_" + 02, matchCode: code, gameCode: "T51", createTime: moment().format("YYYYMMDD hh:mm:ss"), pType: "02", matchName: data.h_cn + "|" + data.a_cn + "|" + data.l_cn + "|" + "0",
                        oddsInfo: data.had.h + "|" + data.had.d + "|" + data.had.a, oddsCode: "cn02", oddsName:"胜平负"};
                    if(data.had.single == 1 && data.had.o_type == "F"){
                        jcodds.oddsSingle = 1;
                    }else{
                        jcodds.oddsSingle = 0;
                    }
                    rstOddsArray.push(jcodds);
                }
                if(data.hhad){
                    var jcoddshhad = {_id:"T51_" + code + "_" + 01, matchCode:code, gameCode:"T51", createTime:moment().format("YYYYMMDD hh:mm:ss"), pType:"01", matchName:data.h_cn + "|" + data.a_cn + "|" + data.l_cn + "|" + data.hhad.fixedodds,
                        oddsInfo:data.hhad.h + "|" +data.hhad.d + "|" +data.hhad.a, oddsCode:"cn01", oddsName:"让球胜平负"};
                    if(data.hhad.single == 1 && data.hhad.o_type == "F"){
                        jcoddshhad.oddsSingle = 1;
                    }else{
                        jcoddshhad.oddsSingle = 0;
                    }
                    rstOddsArray.push(jcoddshhad);
                }
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
            jcoddsTable.drop(function(err,data){
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
        log.error(err);
        log.info("update JcTerm");
    });
};

JcTermCorn.prototype.job = function () {
    var self = this
    var corn = new CronJob('*/5 * * * *', function () {
        var data = {
            'i_format': 'json',
            'poolcode[0]':'hhad', //让球胜平负
            'poolcode[1]':'had', //胜平负
            //'poolcode[1]':'crs', //比分
            '_':new Date().getTime()
        };
        var content = qs.stringify(data);
        var options = {
            hostname: 'i.sporttery.cn',
            port: 80,
            path: '/odds_calculator/get_odds?' + content,
            method: 'GET'
        };
       self.get(options, self.handle);
   });
    corn.start();
};

var JcUpdate = new JcTermCorn();
JcUpdate.start();