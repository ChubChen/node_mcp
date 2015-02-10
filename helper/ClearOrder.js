var async = require('async');
var esut = require('easy_util');
var constants = require('mcp_constants');
var dc = require('mcp_db').dc;
var log = esut.log;
var userType = constants.userType;

var addOrder = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb){
            var table = dc.main.get("torder");
            table.drop(function(err, data){
                cb(null);
            });
        },
        function(cb)
        {
            var table = dc.main.get("torder");
            table.create(function(err, data){
                cb(err);
            });
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

addOrder();