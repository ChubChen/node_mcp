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
            var table = dc.main.get("customer");
            table.drop(function(err, data){
                cb(null);
            });
        },
        function(cb)
        {
            var table = dc.main.get("customer");
            table.create(function(err, data){
                cb(err);
            });
        },
        function(cb)
        {
            var table = dc.main.get("customer");
            table.save({id:"admin", name:"管理员",password:"123456", type:userType.ADMINISTRATOR}, [], function(err, data){
                cb(err);
            });
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

addOperation();