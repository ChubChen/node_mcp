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
                oddsCode:"1@3.50;2@1.00;3@2.45", oddsInfo:"",oddsName:"", version:1};
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
