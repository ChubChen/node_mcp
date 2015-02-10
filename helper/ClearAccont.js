var async = require('async');
var esut = require('easy_util');
var constants = require('mcp_constants');
var dc = require('mcp_db').dc;
var log = esut.log;
var userType = constants.userType;

var addAccount = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb)
        {
            var table = dc.mg.get("account");
            table.save({_id:"Q0001", balance:0, version:0}, [], function(err, data){
            });
            cb(null, "success");
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

addAccount();