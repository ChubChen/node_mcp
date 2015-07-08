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
            var startDate = 20150610;
            var endDate = 20150610;
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
                    sql = sql + "'"+gameCode+"_" +currCode +"','" + currCode + "','" + new Date(temp.add(3,'day').format("YYYY-MM-DD 19:55:00")).getTime() +"',";
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
            var startCode  = 15062; //今天的场次
            var now = moment();
            var end = moment("20160101", "YYYYMMDD");
            var today = now.weekday();
            var count = 0;
            for(var currDate = now; currDate < end; currDate.add(1,'day')){
                var guonian2 = moment("20150225", 'YYYYMMDD');
                var guonian1 = moment("20150218", 'YYYYMMDD');
                if(currDate >= guonian1 && currDate <= guonian2 ){
                    continue;
                }
                //如果今天正好结束那么现在的场次应该到今天纠结束
                if( count ==0 ){
                    var currCode = startCode;
                    var nextCode = startCode + 1;
                    var term = {};
                    var temp = moment() ;
                    while(true){
                        var today = temp.weekday();
                        if(today == 5 ||today  == 0 || today == 2){
                            var sql = "insert into term (id, code, closeTime, openTime, gameCode, nextCode, status, version) values (";
                            sql = sql + "'"+gameCode+"_" +currCode +"','" + currCode + "','" + new Date(temp.format('YYYY-MM-DD 19:55:00')).getTime() +"',";
                            sql = sql + "'"+new Date(currDate).getTime() + "','" + gameCode + "','" + nextCode + "','" + 1100 +"','1');";
                            startCode = nextCode;
                            log.info(sql);
                            write.write(sql);
                            write.write("\n");
                            break;
                        }else{
                            temp.add(1,'day');
                        }
                    }
                }
                var weekDay = currDate.weekday();
                if(weekDay == 1 || weekDay == 6){

                    var currCode = startCode;
                    var nextCode = startCode + 1;
                    var temp = new moment(currDate);
                    var term = {};
                    var sql = "insert into term (id, code, closeTime, openTime, gameCode, nextCode, status, version) values (";
                    sql = sql + "'"+gameCode+"_" +currCode +"','" + currCode + "','" + new Date(temp.add(2,'day').format("YYYY-MM-DD 19:55:00")).getTime() +"',";
                    sql = sql + "'"+new Date(currDate.format("YYYY-MM-DD 20:05:00")).getTime() + "','" + gameCode + "','" + nextCode + "','" + 1100 +"','1');";
                    log.info(sql);
                    write.write(sql);
                    write.write("\n");
                    startCode = nextCode;
                }else if(weekDay == 3){
                    var currCode = startCode;
                    var nextCode = startCode + 1;
                    var temp = new moment(currDate);
                    var sql = "insert into term (id, code, closeTime, openTime, gameCode, nextCode, status, version) values (";
                    sql = sql + "'"+gameCode+"_" +currCode +"','" + currCode + "','" + new Date(temp.add(3,'day').format("YYYY-MM-DD 19:55:00")).getTime() +"',";
                    sql = sql + "'"+new Date(currDate.format("YYYY-MM-DD 20:05:00")).getTime() + "','" + gameCode + "','" + nextCode + "','" + 1100 +"','1');";
                    //sql = "update term set gameCode = 'T01' where  code = '" + currCode +"' and gameCode = 'F01';"
                    log.info(sql);
                    write.write(sql);
                    write.write("\n");
                    startCode = nextCode;
                }
                count ++;
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
            var gameCode = 'T02';
            var write = fs.createWriteStream("/data/app/issue/test.txt");
            var startCode  = 15063;
            var now = moment();
            var end = moment("20160101", "YYYYMMDD");
            var count = 0;
            for(var currDate = now; currDate < end; currDate.add(1,'day')){
                var guonian2 = moment("20150225", 'YYYYMMDD');
                var guonian1 = moment("20150218", 'YYYYMMDD');
                if(currDate >= guonian1 && currDate <= guonian2 ){
                    continue;
                }
                //如果今天正好结束那么现在的场次应该到今天纠结束
                if( count ==0 ){
                    var currCode = startCode;
                    var nextCode = startCode + 1;
                    var term = {};
                    var temp = moment() ;
                    while(true){
                        var today = temp.weekday();
                        if(today == 5 ||today  == 0 || today == 2){
                            var sql = "insert into term (id, code, closeTime, openTime, gameCode, nextCode, status, version) values (";
                            sql = sql + "'"+gameCode+"_" +currCode +"','" + currCode + "','" + new Date(temp.format('YYYY-MM-DD 19:55:00')).getTime() +"',";
                            sql = sql + "'"+new Date(currDate).getTime() + "','" + gameCode + "','" + nextCode + "','" + 1100 +"','1');";
                            startCode = nextCode;
                            log.info(sql);
                            write.write(sql);
                            write.write("\n");
                            break;
                        }else{
                            temp.add(1,'day');
                        }
                    }
                }
                var weekDay = currDate.weekday();
                if(weekDay == 5 || weekDay == 0){

                    var currCode = startCode;
                    var nextCode = startCode + 1;
                    var temp = new moment(currDate);
                    var sql = "insert into term (id, code, closeTime, openTime, gameCode, nextCode, status, version) values (";
                    sql = sql + "'"+gameCode+"_" +currCode +"','" + currCode + "','" + new Date(temp.add(2,'day').format("YYYY-MM-DD 19:55:00")).getTime() +"',";
                    sql = sql + "'"+new Date(currDate.format("YYYY-MM-DD 20:05:00")).getTime() + "','" + gameCode + "','" + nextCode + "','" + 1100 +"','1');";
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
                    var sql = "insert into term (id, code, closeTime, openTime, gameCode, nextCode, status, version) values (";
                    sql = sql + "'"+gameCode+"_" +currCode +"','" + currCode + "','" + new Date(temp.add(3,'day').format("YYYY-MM-DD 19:55:00")).getTime() +"',";
                    sql = sql + "'"+new Date(currDate.format("YYYY-MM-DD 20:05:00")).getTime() + "','" + gameCode + "','" + nextCode + "','" + 1100 +"','1');";
                    log.info(sql);
                    //log.info(new Date(currDate.format("YYYY-MM-DD 20:05:00")));
                    write.write(sql);
                    write.write("\n");
                    startCode = nextCode;
                }
                count++;
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
            var startCode  = 15145;
            var now = moment();
            var end = moment("20160101", "YYYYMMDD");
            var count = 0;
            for(var currDate = now; currDate < end; currDate.add(1,'day')){
                var guonian2 = moment("20150225", 'YYYYMMDD');
                var guonian1 = moment("20150218", 'YYYYMMDD');
                if(currDate >= guonian1 && currDate <= guonian2 ){
                    continue;
                }
                //如果今天正好结束那么现在的场次应该到今天纠结束
                if( count ==0 ){
                    var currCode = startCode;
                    var nextCode = startCode + 1;
                    var term = {};
                    var temp = moment() ;
                    var sql = "insert into term (id, code, closeTime, openTime, gameCode, nextCode, status, version) values (";
                    sql = sql + "'"+gameCode+"_" +currCode +"','" + currCode + "','" + new Date(temp.format('YYYY-MM-DD 19:55:00')).getTime() +"',";
                    sql = sql + "'"+new Date(currDate).getTime() + "','" + gameCode + "','" + nextCode + "','" + 1100 +"','1');";
                    startCode = nextCode;
                    log.info(sql);
                    write.write(sql);
                    write.write("\n");

                }
                var currCode = startCode;
                var nextCode = startCode + 1;
                var temp = new moment(currDate);
                var sql = "insert into term (id, code, closeTime, openTime, gameCode, nextCode, status, version) values (";
                sql = sql + "'"+gameCode+"_" +currCode +"','" + currCode + "','" + new Date(temp.add(1,'day').format("YYYY-MM-DD 19:55:00")).getTime() +"',";
                sql = sql + "'"+new Date(currDate.format("YYYY-MM-DD 20:05:00")).getTime() + "','" + gameCode + "','" + nextCode + "','" + 1100 +"','1');";
                //sql = "update term set gameCode = 'T01' where  code = '" + currCode +"' and gameCode = 'F01';"
                log.info(sql);
                write.write(sql);
                write.write("\n");
                startCode = nextCode;

                count ++;
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
            var startCode  = 15145;
            var now = moment();
            var end = moment("20160101", "YYYYMMDD");
            var count = 0;
            for(var currDate = now; currDate < end; currDate.add(1,'day')){
                var guonian2 = moment("20150225", 'YYYYMMDD');
                var guonian1 = moment("20150218", 'YYYYMMDD');
                if(currDate >= guonian1 && currDate <= guonian2 ){
                    continue;
                }
                //如果今天正好结束那么现在的场次应该到今天纠结束
                if( count ==0 ){
                    var currCode = startCode;
                    var nextCode = startCode + 1;
                    var term = {};
                    var temp = moment() ;
                    var sql = "insert into term (id, code, closeTime, openTime, gameCode, nextCode, status, version) values (";
                    sql = sql + "'"+gameCode+"_" +currCode +"','" + currCode + "','" + new Date(temp.format('YYYY-MM-DD 19:55:00')).getTime() +"',";
                    sql = sql + "'"+new Date(currDate).getTime() + "','" + gameCode + "','" + nextCode + "','" + 1100 +"','1');";
                    startCode = nextCode;
                    log.info(sql);
                    write.write(sql);
                    write.write("\n");

                }
                var currCode = startCode;
                var nextCode = startCode + 1;
                var temp = new moment(currDate);
                var sql = "insert into term (id, code, closeTime, openTime, gameCode, nextCode, status, version) values (";
                sql = sql + "'"+gameCode+"_" +currCode +"','" + currCode + "','" + new Date(temp.add(1,'day').format("YYYY-MM-DD 19:55:00")).getTime() +"',";
                sql = sql + "'"+new Date(currDate.format("YYYY-MM-DD 20:05:00")).getTime() + "','" + gameCode + "','" + nextCode + "','" + 1100 +"','1');";
                //sql = "update term set gameCode = 'T01' where  code = '" + currCode +"' and gameCode = 'F01';"
                log.info(sql);
                write.write(sql);
                write.write("\n");
                startCode = nextCode;

                count ++;
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
                    var startTime = "";
                    var endTime = "";
                    if(i == 1){
                        startTime = new Date(openTime).getTime();
                        openTime.set('hour', 09);
                        openTime.set('minute', 05);
                        openTime.set('seconds', 00);
                        endTime = new Date(openTime).getTime();
                    }else{
                        startTime = new Date(openTime).getTime();
                        openTime = openTime.add(10, 'm');
                        endTime = new Date(openTime).getTime();
                    }
                    if(i == 78){
                        nextCode = new moment(openTime).add(1,'day').format("YYMMDD")*100 + i;
                    }
                    var term = {};
                    term.id = gameCode+"_"+currCode;
                    term.gameCode = gameCode;
                    term.code = currCode;
                    term.closeTime= endTime;
                    term.openTime = startTime;
                    term.status = 1100;
                    term.nextCode = nextCode;
                    log.info(term);
                    var termTable = dc.main.get("term");
                    termTable.save(term, [], function(err){
                        if(err)
                        log.error(err);
                    });
                    write.write(term.toString());
                    write.write("\n");
                }
            }
            write.end(function(){
                console.log("end");
            });
            cb(null);
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



var initTermT05HB = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb)
        {
            var gameCode = 'T05';
            var now = moment("20150709", "YYYYMMDD");
            var end = moment("20151231", "YYYYMMDD");
            var termArray = new Array();
            for(var currDate = now; currDate < end; currDate.add(1,'day')){

                var guonian2 = moment("20150225", 'YYYYMMDD');
                var guonian1 = moment("20150218", 'YYYYMMDD');
                if(currDate >= guonian1 && currDate <= guonian2 ){
                    continue;
                }

                var openTime = new moment(currDate);
                var firstTime = new moment(currDate).add(-1,'day');
                firstTime.set('hour', 22);
                firstTime.set('minute', 00);
                firstTime.set('seconds', 00);
                for(var i = 1; i <= 79 ; i++){
                    var currCode = currDate.format("YYMMDD")*100 + i;
                    var nextCode = currCode + 1;
                    var startTime = "";
                    var endTime = "";
                    if(i == 1){
                        startTime = new Date(firstTime)//.getTime();
                        openTime.set('hour', 09);
                        openTime.set('minute', 00);
                        openTime.set('seconds', 00);
                        endTime = new Date(openTime)//.getTime();
                    }else{
                        startTime = new Date(openTime)//.getTime();
                        openTime = openTime.add(10, 'm');
                        endTime = new Date(openTime)//.getTime();
                    }
                    if(i == 79){
                        nextCode = new moment(openTime).add(1,'day').format("YYMMDD")*100 + i;
                    }
                    var term = {};
                    term.id = gameCode+"_"+currCode;
                    term.gameCode = gameCode;
                    term.code = currCode;
                    term.closeTime= endTime;
                    term.openTime = startTime;
                    term.status = 1100;
                    term.nextCode = nextCode;
                    log.info(term);
                    termArray.push(term);
                }
            }
            cb(null, termArray);
        },
        function(termAray, cb)
        {
            var termTable = dc.main.get("term");
            async.eachSeries(termAray, function(term , callback){
                termTable.save(term, [], function(err){
                    if(err)
                        log.error(err);
                    callback(err);
                });
            });
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });

};

initTermT05HB();
