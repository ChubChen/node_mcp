var CronJob = require("cron").CronJob;
var async = require('async');
var moment = require("moment");
var dc = require('mcp_db').dc;
var prop = require('mcp_config').prop;


var esut = require("easy_util");
var log = esut.log;
var digestUtil = esut.digestUtil;


var service = require("mcp_service");
var termSer = service.termSer;
var msgSer = service.msgSer;

var cons = require('mcp_constants');
var termStatus = cons.termStatus;
var msgStatus = cons.msgStatus;
var msgType = cons.msgType;

var issueModel = require("mcp_issue").issueModel;
var master = require("mcp_msg").masterHandle;

var Scheduler = function(){};

/**
 *
 */
Scheduler.prototype.start = function()
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
            self.issue();
            cb(null);
        },
        //start msg hanled
        function(cb)
        {
            self.startMsgConsumerJob();
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
};

Scheduler.prototype.issue = function()
{
    var self = this;
    self.issueJob = new CronJob('*/10 * * * * *', function () {
        issueModel.findToHandle(function(err, data){
            if(err)
            {
                log.info(err);
            }
        });
    });
    self.issueJob.start();
}

/**
 * 启动处理已经完成的消息的任务类
 */
Scheduler.prototype.startMsgConsumerJob = function()
{
    var self = this;
    self.checkHandledJob = new CronJob('*/5 * * * * *', function () {
        self.handleMsg(function(err, data){
            log.info("处理已经完成的消息:")
            log.info(err);
            log.info(data);
        });
    });
    self.checkHandledJob.start();
};

/**
 * 处理消息
 */
Scheduler.prototype.handleMsg = function(cb)
{
    var self = this;
    var hasNext = true;
    async.whilst(
        function() { return hasNext},
        function(whileCb) {
            master.getFromPool(function(err, msg){
                if(msg)
                {
                    master.handle(msg, function(err, data){
                        whileCb(err);
                    });
                }
                else
                {
                    whileCb();
                    hasNext = false;
                }
            });
        },
        function(err) {
            cb(err, null);
        }
    );
}


var sch = new Scheduler();
sch.start();