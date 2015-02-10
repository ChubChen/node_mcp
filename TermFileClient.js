var CronJob = require("cron").CronJob;
var async = require('async');
var moment = require("moment");
var dc = require('mcp_db').dc;
var prop = require('mcp_config').prop;
var esut = require("easy_util");
var log = esut.log;
var digestUtil = esut.digestUtil;
var termSer = require("mcp_service").termSer;

var cons = require('mcp_constants');
var termStatus = cons.termStatus;
var msgStatus = cons.msgStatus;
var msgType = cons.msgType;

var msgFac = require("mcp_msg");
var clientHandle = msgFac.clientHandle;

var TermFileClient = function(){};

/**
 *
 */
TermFileClient.prototype.start = function()
{
    var self = this;
    async.waterfall([
        function(cb)
        {
            dc.init(function(err){
                cb(err);
            });
        },
        //start web
        function(cb)
        {
            self.handle();
            cb(null, "success");
        }
    ], function (err, result) {
        if(err)
        {
            log.info(err); // -> null
        }
        else
        {
            log.info(result); // -> 16
        }
    });
}

/**
 * 处理消息
 */
TermFileClient.prototype.handle = function()
{
    var self = this;
    self.handleJob = new CronJob('*/3 * * * * *', function () {
        log.info("get mst to consumer..................");
        clientHandle.getTermFileMsgFromPool(function(err, msg){
            if(msg) {
                clientHandle.handle(msg, function(err, data){});
            }
        });
    });
    self.handleJob.start();
}

var termFileClient = new TermFileClient();
termFileClient.start();