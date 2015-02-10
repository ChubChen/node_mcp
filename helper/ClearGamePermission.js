var async = require('async');
var esut = require('easy_util');
var constants = require('mcp_constants');
var gameStatus = constants.gameStatus;
var dc = require('mcp_db').dc;
var log = esut.log;

var addGamePermission = function () {
    async.waterfall([
        function (cb) {
            dc.init(function (err) {
                cb(err);
            });
        },
        function (cb) {
            var table = dc.mg.get("gamePermission");
            table.drop(function (err, data) {
                cb(null);
            });
        },
        function (cb) {
            var table = dc.mg.get("gamePermission");
            table.create(function (err, data) {
               cb(err);
            })
        },
        function (cb) {
            var table = dc.mg.get("gamePermission");
            var permission = gameStatus.USABLE;
            var T06 = {_id:"T06",gamePermission:permission};
            var F04 = {_id:"F04",gamePermission:permission};
            var F02 = {_id:"F02",gamePermission:permission};
            var T05 = {_id:"T05",gamePermission:permission};
            var T01 = {_id:"T01",gamePermission:permission};
            var T51 = {_id:"T51",gamePermission:permission};
            table.save(T06 ,[], function(err, data){});
            table.save(F04 ,[], function(err, data){});
            table.save(F02 ,[], function(err, data){});
            table.save(T05 ,[], function(err, data){});
            table.save(T01 ,[], function(err, data){});
            table.save(T51 ,[], function(err, data){});
            cb(null);
        }
    ], function (err, result) {
        log.error(err);
        log.info("end............");
    });
}
addGamePermission();