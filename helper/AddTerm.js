var async = require('async');
var esut = require('easy_util');
var digest = esut.digestUtil;
var constants = require('mcp_constants');
var dc = require('mcp_db').dc;
var log = esut.log;
var fs = require('fs');
var path = require('path');

var moment = require("moment");

var initTerm = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb)
        {
            var table = dc.main.get("term");
            var startDate = 20150101;
            var endDate = 20150119;
            var gameCode = 'T05';
            var rst = [];
            for(var curDate = startDate; curDate <= endDate; curDate++)
            {
                var startTimeStamp = moment(curDate + "000000", "YYYYMMDDHHmmss").valueOf();
                var gap = 60*60*1000;
                for(var i = 1; i < 25; i++)
                {
                    var start = startTimeStamp + (i - 1)*gap;
                    var end = startTimeStamp + i*gap;
                    var code = (curDate*100 + i) + "";
                    var nextCode = "";
                    if(i == 24)
                    {
                        nextCode += ((curDate+1)*100 + 1) + "";
                    }
                    else
                    {
                        nextCode += (curDate*100 + i + 1) + "";
                    }
                    var term = {gameCode:gameCode, code:code, nextCode:nextCode,
                        openTime:start, closeTime:end,
                        status:constants.termStatus.NOT_ON_SALE, wNum:""};
                    term.id = term.gameCode + "_" + term.code;
                    rst[rst.length] = term;
                }
            }
            log.info(rst);

            async.eachSeries(rst, function(term, callback) {
                table.save(term, {}, function(err, data){
                    callback(err);
                });
            }, function(err){
                cb(null);
            });
        },
        function(cb)
        {
            cb(null, "success");
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

var initTermF04 = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb)
        {
            var table = dc.main.get("term");
            var gameCode = 'F04';
            var rst = [];

            var now = moment();
            for(var currDate = now; currDate <= moment().add(1, 'year'); currDate.add(1,'day')){
                var currDay = now.format("YYMMDD");
                for(var i = 1; i <= 73; i ++)
                {
                    var code = (currDay*1000)+i;
                    var nextCode = code + 1;
                    if(code%100 == 73){
                        nextCode = ((currDay+1)*1000)+1;
                    }
                    var startTimeStamp = moment("2020-01-01 00:00:00 ","YYYY-MM-DD HH:mm:ss").valueOf();
                    var term = {gameCode:gameCode, code:code, nextCode:nextCode,
                        openTime:startTimeStamp, closeTime:startTimeStamp,
                        status:constants.termStatus.NOT_ON_SALE, wNum:""};
                    term.id = term.gameCode + "_" + term.code;
                    //log.info(term);
                    rst[rst.length] = term;
                }
            }

            async.eachSeries(rst, function(term, callback) {
                table.save(term, {}, function(err, data){
                    callback(err);
                });
            }, function(err){
                cb(null);
            });
        },
        function(cb)
        {
            cb(null, "success");
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

var initTermF01 = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb)
        {
            // var table = dc.main.get("term");
            var gameCode = 'F01';
            // var rst = [];
            var write = fs.createWriteStream("/data/app/issue/test.txt");
            var startCode  = 2015045;
            var now = moment();
            var end = moment("20160101", "YYYYMMDD");
            for(var currDate = now; currDate < end; currDate.add(1,'day')){
                var guonian2 = moment("20150225", 'YYYYMMDD');
                var guonian1 = moment("20150218", 'YYYYMMDD');
                if(currDate > guonian1 && currDate < guonian2 ){
                    continue;
                }
                var weekDay = currDate.weekday();
                if(weekDay == 2 || weekDay == 0){
                    //log.info(weekDay);
                    //log.info(currDate.format("YYYY-MM-DD"));
                    var currCode = startCode;
                    var nextCode = startCode + 1;
                    var temp = new moment(currDate);
                    //log.info(currDate);
                    var sql = "insert into term (id, code, closeTime, openTime, gameCode, nextCode, status, version) values (";
                    sql = sql + "'F01_" +currCode +"','" + currCode + "','" + new Date(temp.add(2,'day').format("YYYY-MM-DD 19:55:00")).getTime() +"',";
                    sql = sql + "'"+new Date(currDate.format("YYYY-MM-DD 20:05:00")).getTime() + "','" + gameCode + "','" + nextCode + "','" + 1100 +"','1');";
                    log.info(sql);
                    write.write(sql);
                    write.write("\n");
                    startCode = nextCode;
                }else if(weekDay == 4){
                    //log.info(weekDay);
                    //log.info(currDate.format("YYYY-MM-DD"));
                    var currCode = startCode;
                    var nextCode = startCode + 1;
                    var temp = new moment(currDate);
                    var sql = "insert into term (id, code, closeTime, openTime, gameCode, nextCode, status, version) values (";
                    sql = sql + "'F01_" +currCode +"','" + currCode + "','" + new Date(temp.add(3,'day').format("YYYY-MM-DD 19:55:00")).getTime() +"',";
                    sql = sql + "'"+new Date(currDate.format("YYYY-MM-DD 20:05:00")).getTime() + "','" + gameCode + "','" + nextCode + "','" + 1100 +"','1');";
                    log.info(sql);
                    write.write(sql);
                    write.write("\n");
                    startCode = nextCode;
                }


            }
            write.end(function(){
                console.log("end");
            });
        },
        function(cb)
        {
            cb(null, "success");
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

/**
 *大乐透
 */
var initTermT01 = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb)
        {
            // var table = dc.main.get("term");
            var gameCode = 'T01';
            // var rst = [];
            var write = fs.createWriteStream("/data/app/issue/test.txt");
            var startCode  = 15046;
            var now = moment();
            var end = moment("20160101", "YYYYMMDD");
            for(var currDate = now; currDate < end; currDate.add(1,'day')){
                var guonian2 = moment("20150225", 'YYYYMMDD');
                var guonian1 = moment("20150218", 'YYYYMMDD');
                if(currDate >= guonian1 && currDate <= guonian2 ){
                    continue;
                }
                var weekDay = currDate.weekday();
                if(weekDay == 1 || weekDay == 6){
                    //log.info(weekDay);
                    //log.info(currDate.format("YYYY-MM-DD"));
                    var currCode = startCode;
                    var nextCode = startCode + 1;
                    var temp = new moment(currDate);
                    var term = {};
                    var sql = "insert into term (id, code, closeTime, openTime, gameCode, nextCode, status, version) values (";
                    sql = sql + "'T01_" +currCode +"','" + currCode + "','" + new Date(temp.add(2,'day').format("YYYY-MM-DD 19:55:00")).getTime() +"',";
                    sql = sql + "'"+new Date(currDate.format("YYYY-MM-DD 20:05:00")).getTime() + "','" + gameCode + "','" + nextCode + "','" + 1100 +"','1');";
                    //sql = "update term set gameCode = 'T01' where  code = '" + currCode +"' and gameCode = 'F01';"
                    log.info(sql);
                    write.write(sql);
                    write.write("\n");
                    startCode = nextCode;
                }else if(weekDay == 3){
                    //log.info(weekDay);
                    //log.info(currDate.format("YYYY-MM-DD"));
                    var currCode = startCode;
                    var nextCode = startCode + 1;
                    var temp = new moment(currDate);
                    var sql = "insert into term (id, code, closeTime, openTime, gameCode, nextCode, status, version) values (";
                    sql = sql + "'T01_" +currCode +"','" + currCode + "','" + new Date(temp.add(3,'day').format("YYYY-MM-DD 19:55:00")).getTime() +"',";
                    sql = sql + "'"+new Date(currDate.format("YYYY-MM-DD 20:05:00")).getTime() + "','" + gameCode + "','" + nextCode + "','" + 1100 +"','1');";
                    //sql = "update term set gameCode = 'T01' where  code = '" + currCode +"' and gameCode = 'F01';"
                    log.info(sql);
                    write.write(sql);
                    write.write("\n");
                    startCode = nextCode;
                }


            }
            write.end(function(){
                console.log("end");
            });
        },
        function(cb)
        {
            cb(null, "success");
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

/**
 * 七星彩
 */
var initTermT02 = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb)
        {
            // var table = dc.main.get("term");
            var gameCode = 'T02';
            // var rst = [];
            var write = fs.createWriteStream("/data/app/issue/test.txt");
            var startCode  = 15010;
            var now = moment();
            var end = moment("20160101", "YYYYMMDD");
            for(var currDate = now; currDate < end; currDate.add(1,'day')){
                var guonian2 = moment("20150225", 'YYYYMMDD');
                var guonian1 = moment("20150218", 'YYYYMMDD');
                if(currDate >= guonian1 && currDate <= guonian2 ){
                    continue;
                }
                var weekDay = currDate.weekday();
                if(weekDay == 5 || weekDay == 0){
                    //log.info(weekDay);
                    //log.info(currDate.format("YYYY-MM-DD"));
                    var currCode = startCode;
                    var nextCode = startCode + 1;
                    var temp = new moment(currDate);
                    var sql = "insert into term (id, code, createTime , endTime, openTime, gameCode, name, nextCode, status, version,prizepool, CONCEDEPOINTS) values (";
                    sql = sql + "'" +digest.createUUID() +"','" + currCode + "',to_date('" + moment().format("YYYY-MM-DD HH:mm:ss") + "','yyyy-mm-dd hh24:mi:ss'),to_date('" + temp.add(2,'day').format("YYYY-MM-DD 19:50:00") +"','yyyy-mm-dd hh24:mi:ss'),";
                    sql = sql + "to_date('"+currDate.format("YYYY-MM-DD 20:20:00") + "','yyyy-mm-dd hh24:mi:ss'),'" + gameCode + "','第"+currCode+"期','" + nextCode + "','" + 1100 +"','1'";
                    sql += ",0,0);";
                    //sql = "update term set gameCode = 'T01' where  code = '" + currCode +"' and gameCode = 'F01';"
                    log.info(sql);
                    write.write(sql);
                    write.write("\n");
                    startCode = nextCode;
                }else if(weekDay == 2){
                    //log.info(weekDay);
                    //log.info(currDate.format("YYYY-MM-DD"));
                    var currCode = startCode;
                    var nextCode = startCode + 1;
                    var temp = new moment(currDate);
                    var sql = "insert into term (id, code, createTime , endTime, openTime, gameCode, name, nextCode, status, version,prizepool, CONCEDEPOINTS) values (";
                    sql = sql + "'" +digest.createUUID() +"','" + currCode + "',to_date('" + moment().format("YYYY-MM-DD HH:mm:ss") + "','yyyy-mm-dd hh24:mi:ss'),to_date('" + temp.add(3,'day').format("YYYY-MM-DD 19:50:00") +"','yyyy-mm-dd hh24:mi:ss'),";
                    sql = sql + "to_date('"+currDate.format("YYYY-MM-DD 20:20:00") + "','yyyy-mm-dd hh24:mi:ss'),'" + gameCode + "','第"+currCode+"期','" + nextCode + "','" + 1100 +"','1'";
                    sql += ",0,0);";
                    //sql = "update term set gameCode = 'T01' where  code = '" + currCode +"' and gameCode = 'F01';"
                    log.info(sql);
                    write.write(sql);
                    write.write("\n");
                    startCode = nextCode;
                }
            }
            write.end(function(){
                console.log("end");
            });
        },
        function(cb)
        {
            cb(null, "success");
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

/**
 * 排列3
 */
var initTermT03 = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb)
        {
            // var table = dc.main.get("term");
            var gameCode = 'T03';
            // var rst = [];
            var write = fs.createWriteStream("/data/app/issue/test.txt");
            var startCode  = 15021;
            var now = moment();
            var end = moment("20160101", "YYYYMMDD");
            for(var currDate = now; currDate < end; currDate.add(1,'day')){
                var guonian2 = moment("20150225", 'YYYYMMDD');
                var guonian1 = moment("20150218", 'YYYYMMDD');
                if(currDate >= guonian1 && currDate <= guonian2 ){
                    continue;
                }
                var currCode = startCode;
                var nextCode = startCode + 1;
                var temp = new moment(currDate);
                var sql = "insert into term (id, code, createTime , endTime, openTime, gameCode, name, nextCode, status, version,prizepool, CONCEDEPOINTS) values (";
                sql = sql + "'" +digest.createUUID() +"','" + currCode + "',to_date('" + moment().format("YYYY-MM-DD HH:mm:ss") + "','yyyy-mm-dd hh24:mi:ss'),to_date('" + temp.add(1,'day').format("YYYY-MM-DD 19:50:00") +"','yyyy-mm-dd hh24:mi:ss'),";
                sql = sql + "to_date('"+currDate.format("YYYY-MM-DD 20:10:00") + "','yyyy-mm-dd hh24:mi:ss'),'" + gameCode + "','第"+currCode+"期','" + nextCode + "','" + 1100 +"','1'";
                sql += ",0,0);";
                //sql = "update term set gameCode = 'T01' where  code = '" + currCode +"' and gameCode = 'F01';"
                log.info(sql);
                write.write(sql);
                write.write("\n");
                startCode = nextCode;
            }
            write.end(function(){
                console.log("end");
            });
        },
        function(cb)
        {
            cb(null, "success");
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

/**
 * 排列5
 */
var initTermT04 = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb)
        {
            // var table = dc.main.get("term");
            var gameCode = 'T04';
            // var rst = [];
            var write = fs.createWriteStream("/data/app/issue/test.txt");
            var startCode  = 15021;
            var now = moment();
            var end = moment("20160101", "YYYYMMDD");
            for(var currDate = now; currDate < end; currDate.add(1,'day')){
                var guonian2 = moment("20150225", 'YYYYMMDD');
                var guonian1 = moment("20150218", 'YYYYMMDD');
                if(currDate >= guonian1 && currDate <= guonian2 ){
                    continue;
                }
                var currCode = startCode;
                var nextCode = startCode + 1;
                var temp = new moment(currDate);
                var sql = "insert into term (id, code, createTime , endTime, openTime, gameCode, name, nextCode, status, version,prizepool, CONCEDEPOINTS) values (";
                sql = sql + "'" +digest.createUUID() +"','" + currCode + "',to_date('" + moment().format("YYYY-MM-DD HH:mm:ss") + "','yyyy-mm-dd hh24:mi:ss'),to_date('" + temp.add(1,'day').format("YYYY-MM-DD 19:50:00") +"','yyyy-mm-dd hh24:mi:ss'),";
                sql = sql + "to_date('"+currDate.format("YYYY-MM-DD 20:10:00") + "','yyyy-mm-dd hh24:mi:ss'),'" + gameCode + "','第"+currCode+"期','" + nextCode + "','" + 1100 +"','1'";
                sql += ",0,0);";
                //sql = "update term set gameCode = 'T01' where  code = '" + currCode +"' and gameCode = 'F01';"
                log.info(sql);
                write.write(sql);
                write.write("\n");
                startCode = nextCode;
            }
            write.end(function(){
                console.log("end");
            });
        },
        function(cb)
        {
            cb(null, "success");
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

/**
 * 福彩3d
 */
var initTermF02 = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb)
        {
            // var table = dc.main.get("term");
            var gameCode = 'F02';
            // var rst = [];
            var write = fs.createWriteStream("/data/app/issue/test.txt");
            var startCode  = 2015021;
            var now = moment();
            var end = moment("20160101", "YYYYMMDD");
            for(var currDate = now; currDate < end; currDate.add(1,'day')){
                var guonian2 = moment("20150225", 'YYYYMMDD');
                var guonian1 = moment("20150218", 'YYYYMMDD');
                if(currDate >= guonian1 && currDate <= guonian2 ){
                    continue;
                }
                var currCode = startCode;
                var nextCode = startCode + 1;
                var temp = new moment(currDate);
                var sql = "insert into term (id, code, createTime , endTime, openTime, gameCode, name, nextCode, status, version,prizepool, CONCEDEPOINTS) values (";
                sql = sql + "'" +digest.createUUID() +"','" + currCode + "',to_date('" + moment().format("YYYY-MM-DD HH:mm:ss") + "','yyyy-mm-dd hh24:mi:ss'),to_date('" + temp.add(1,'day').format("YYYY-MM-DD 19:55:00") +"','yyyy-mm-dd hh24:mi:ss'),";
                sql = sql + "to_date('"+currDate.format("YYYY-MM-DD 20:10:00") + "','yyyy-mm-dd hh24:mi:ss'),'" + gameCode + "','第"+currCode+"期','" + nextCode + "','" + 1100 +"','1'";
                sql += ",0,0);";
                //sql = "update term set gameCode = 'T01' where  code = '" + currCode +"' and gameCode = 'F01';"
                log.info(sql);
                write.write(sql);
                write.write("\n");
                startCode = nextCode;
            }
            write.end(function(){
                console.log("end");
            });
        },
        function(cb)
        {
            cb(null, "success");
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

/**
 * 七乐彩
 */
var initTermF03 = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb)
        {
            // var table = dc.main.get("term");
            var gameCode = 'F03';
            // var rst = [];
            var write = fs.createWriteStream("/data/app/issue/test.txt");
            var startCode  = 2015010;
            var now = moment();
            var end = moment("20160101", "YYYYMMDD");
            for(var currDate = now; currDate < end; currDate.add(1,'day')){
                var guonian2 = moment("20150225", 'YYYYMMDD');
                var guonian1 = moment("20150218", 'YYYYMMDD');
                if(currDate >= guonian1 && currDate <= guonian2 ){
                    continue;
                }
                var weekDay = currDate.weekday();
                if(weekDay == 1 || weekDay == 3){
                    //log.info(weekDay);
                    //log.info(currDate.format("YYYY-MM-DD"));
                    var currCode = startCode;
                    var nextCode = startCode + 1;
                    var temp = new moment(currDate);
                    var sql = "insert into term (id, code, createTime , endTime, openTime, gameCode, name, nextCode, status, version,prizepool, CONCEDEPOINTS) values (";
                    sql = sql + "'" +digest.createUUID() +"','" + currCode + "',to_date('" + moment().format("YYYY-MM-DD HH:mm:ss") + "','yyyy-mm-dd hh24:mi:ss'),to_date('" + temp.add(2,'day').format("YYYY-MM-DD 19:55:00") +"','yyyy-mm-dd hh24:mi:ss'),";
                    sql = sql + "to_date('"+currDate.format("YYYY-MM-DD 20:00:00") + "','yyyy-mm-dd hh24:mi:ss'),'" + gameCode + "','第"+currCode+"期','" + nextCode + "','" + 1100 +"','1'";
                    sql += ",0,0);";
                    //sql = "update term set gameCode = 'T01' where  code = '" + currCode +"' and gameCode = 'F01';"
                    log.info(sql);
                    write.write(sql);
                    write.write("\n");
                    startCode = nextCode;
                }else if(weekDay == 5){
                    //log.info(weekDay);
                    //log.info(currDate.format("YYYY-MM-DD"));
                    var currCode = startCode;
                    var nextCode = startCode + 1;
                    var temp = new moment(currDate);
                    var sql = "insert into term (id, code, createTime , endTime, openTime, gameCode, name, nextCode, status, version,prizepool, CONCEDEPOINTS) values (";
                    sql = sql + "'" +digest.createUUID() +"','" + currCode + "',to_date('" + moment().format("YYYY-MM-DD HH:mm:ss") + "','yyyy-mm-dd hh24:mi:ss'),to_date('" + temp.add(3,'day').format("YYYY-MM-DD 19:55:00") +"','yyyy-mm-dd hh24:mi:ss'),";
                    sql = sql + "to_date('"+currDate.format("YYYY-MM-DD 20:00:00") + "','yyyy-mm-dd hh24:mi:ss'),'" + gameCode + "','第"+currCode+"期','" + nextCode + "','" + 1100 +"','1'";
                    sql += ",0,0);";
                    //sql = "update term set gameCode = 'T01' where  code = '" + currCode +"' and gameCode = 'F01';"
                    log.info(sql);
                    write.write(sql);
                    write.write("\n");
                    startCode = nextCode;
                }
            }
            write.end(function(){
                console.log("end");
            });
        },
        function(cb)
        {
            cb(null, "success");
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

/**
 * 七乐彩
 */
var initTermT05 = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb)
        {
            // var table = dc.main.get("term");
            var gameCode = 'T05';
            // var rst = [];
            var write = fs.createWriteStream("/data/app/issue/test.txt");
            var now = moment();
            var end = moment("20160201", "YYYYMMDD");
            for(var currDate = now; currDate < end; currDate.add(1,'day')){

                var guonian2 = moment("20150225", 'YYYYMMDD');
                var guonian1 = moment("20150218", 'YYYYMMDD');
                if(currDate >= guonian1 && currDate <= guonian2 ){
                    continue;
                }
                currDate.set('hour', 07);
                currDate.set('minute', 55);
                currDate.set('seconds', 00);
                var openTime = new moment(currDate);
                for(var i = 1; i <= 78 ; i++){
                    var currCode = currDate.format("YYMMDD")*100 + i;
                    var nextCode = currCode + 1;
                    var openStr = "";
                    var endStr = "";
                    if(i == 1){
                        openStr = openTime.format('YYYY-MM-DD HH:mm:ss');
                        openTime.set('hour', 09);
                        openTime.set('minute', 05);
                        openTime.set('seconds', 00);
                        endStr = openTime.format('YYYY-MM-DD HH:mm:ss');
                    }else{
                        openStr = openTime.format('YYYY-MM-DD HH:mm:ss');
                        endStr = new moment(openTime).add(10, 'm').format('YYYY-MM-DD HH:mm:ss');
                        openTime = openTime.add(10, 'm');
                    }
                    if(i == 78){
                        nextCode = openTime.add(1, 'day').format("YYMMDD")*100 + 1;
                    }
                    var sql = "insert into term (id, code, createTime , endTime, openTime, gameCode, name, nextCode, status, version,prizepool, CONCEDEPOINTS) values (";
                    sql = sql + "'" +digest.createUUID() +"','" + currCode + "',to_date('" + moment().format("YYYY-MM-DD HH:mm:ss") + "','yyyy-mm-dd hh24:mi:ss'),to_date('" + endStr +"','yyyy-mm-dd hh24:mi:ss'),";
                    sql = sql + "to_date('"+ openStr + "','yyyy-mm-dd hh24:mi:ss'),'" + gameCode + "','第"+currCode+"期','" + nextCode + "','" + 1100 +"','1'";
                    sql += ",0,0);";
                    log.info(sql);
                    write.write(sql);
                    write.write("\n");
                }
            }
            write.end(function(){
                console.log("end");
            })
        },
        function(cb)
        {
            cb(null, "success");
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

var initTermT05Bj = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb)
        {
            var table = dc.main.get("term");
            var startDate = 20150318;
            var endDate = 20150318;
            var gameCode = 'T05';
            var rst = [];
            for(var curDate = startDate; curDate <= endDate; curDate++)
            {
                var startTimeStamp = moment(curDate + "085000", "YYYYMMDDHHmmss").valueOf();
                var gap = 10*60*1000;
                for(var i = 1; i <=85; i++)
                {
                    var start = startTimeStamp + (i - 1)*gap;
                    var end = startTimeStamp + i*gap;
                    var code = (curDate*100 + i) + "";
                    code=code.substr(2);
                    var nextCode = "";
                    if(i == 1)
                    {
                        nextCode += (curDate*100 + i + 1) + "";
                        start = moment( curDate - 1+"23:00:00", "YYYYMMDDHHmmss").valueOf();
                    }
                    else
                    {
                        nextCode += (curDate*100 + i + 1) + "";
                    }
                    if(i==85){
                        nextCode = ((curDate+1)*100 + 1) + "";
                    }


                    var term = {gameCode:gameCode, code:code, nextCode:nextCode.substr(2),
                        openTime:start, closeTime:end,
                        status:constants.termStatus.NOT_ON_SALE, wNum:""};
                    term.id = term.gameCode + "_" + term.code;
                    rst[rst.length] = term;
                }
            }
            log.info(rst);

            async.eachSeries(rst, function(term, callback) {
                table.save(term, {}, function(err, data){
                    callback(err);
                });
            }, function(err){
                cb(null);
            });
        },
        function(cb)
        {
            cb(null, "success");
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};


initTermF01();
//console.log(moment().format("YYYY-MM-DD 19:50:00"));