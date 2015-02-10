var async = require('async');
var esut = require('easy_util');
var constants = require('mcp_constants');
var dc = require('mcp_db').dc;
var log = esut.log;

var initTerm = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb){
            var table = dc.main.get("term");
            table.drop(function(err, data){
                cb(null);
            });
        },
        function(cb)
        {
            var table = dc.main.get("term");
            table.create(function(err, data){
                cb(err);
            });
        },
        function(cb)
        {
            var table = dc.main.get("term");
            var now = new Date().getTime();
            var term = {gameCode:"T06", code:"2014001", nextCode:"2014002",
                openTime:now, closeTime:now + 60*60*1000,
                status:constants.termStatus.NOT_ON_SALE, wNum:"1,2,3,4"};
            term.id = term.gameCode + "_" + term.code;
            table.save(term, [], function(err, data){
                cb(err);
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

initTerm();
