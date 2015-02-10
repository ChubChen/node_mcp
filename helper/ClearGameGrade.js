var async = require('async');
var esut = require('easy_util');
var constants = require('mcp_constants');
var dc = require('mcp_db').dc;
var log = esut.log;
var userType = constants.userType;

var addOperation = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb){
            var table = dc.main.get("gamegrade");
            table.drop(function(err, data){
                cb(null);
            });
        },
        function(cb)
        {
            var table = dc.main.get("gamegrade");
            table.create(function(err, data){
                cb(err);
            });
        },
        function(cb)
        {
            var table = dc.main.get("gamegrade");
            var gameCode = "T06";
            var termCode = "2014001";
            var lv1 = {gameCode:gameCode, termCode:termCode, level:1, name:"组选24", bonus:19700};
            lv1.id = gameCode + "_" + termCode + "_" + lv1.level;
            table.save(lv1, [], function(err, data){});
            var lv2 = {gameCode:gameCode, termCode:termCode, level:2, name:"组选12", bonus:39500};
            lv2.id = gameCode + "_" + termCode + "_" + lv2.level;
            table.save(lv2, [], function(err, data){});
            var lv3 = {gameCode:gameCode, termCode:termCode, level:3, name:"组选6", bonus:79100};
            lv3.id = gameCode + "_" + termCode + "_" + lv3.level;
            table.save(lv3, [], function(err, data){});
            var lv4 = {gameCode:gameCode, termCode:termCode, level:4, name:"组选4", bonus:118700};
            lv4.id = gameCode + "_" + termCode + "_" + lv4.level;
            table.save(lv4, [], function(err, data){});
            var lv5 = {gameCode:gameCode, termCode:termCode, level:5, name:"任选一", bonus:900};
            lv5.id = gameCode + "_" + termCode + "_" + lv5.level;
            table.save(lv5, [], function(err, data){});
            var lv6 = {gameCode:gameCode, termCode:termCode, level:6, name:"任选二", bonus:7400};
            lv6.id = gameCode + "_" + termCode + "_" + lv6.level;
            table.save(lv6, [], function(err, data){});
            var lv7 = {gameCode:gameCode, termCode:termCode, level:7, name:"任选三", bonus:59300};
            lv7.id = gameCode + "_" + termCode + "_" + lv7.level;
            table.save(lv7, [], function(err, data){});
            var lv8 = {gameCode:gameCode, termCode:termCode, level:8, name:"任选四", bonus:475100};
            lv8.id = gameCode + "_" + termCode + "_" + lv8.level;
            table.save(lv8, [], function(err, data){});
            cb(null, "success");
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

addOperation();