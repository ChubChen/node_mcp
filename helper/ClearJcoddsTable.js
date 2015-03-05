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
            var table = dc.main.get("jcodds");
            table.drop(function(err, data){
                cb(null);
            });
        },
        function(cb)
        {
            var table = dc.main.get("jcodds");
            table.create(function(err, data){
                cb(err);
            });
        },
        function(cb)
        {
            var table = dc.main.get("jcodds");
            var jcodds = {gameCode:"T51", matchCode:"201501010102",  matchName:"中国Vs日本", pType:"02",
                oddsCode:"cn02", oddsInfo:"1.45|2.45|3.00",oddsName:"", version:1};
            jcodds.id = jcodds.gameCode+"_"+jcodds.matchCode+"_"+jcodds.pType;
            table.save(jcodds, [], function(err, data){
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
