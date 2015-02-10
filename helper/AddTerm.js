var async = require('async');
var esut = require('easy_util');
var constants = require('mcp_constants');
var dc = require('mcp_db').dc;
var log = esut.log;

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

initTermF04();

