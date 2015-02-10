var CronJob = require("cron").CronJob;
var async = require('async');
var moment = require("moment");
var dc = require('mcp_db').dc;

var config = require('mcp_config');
var ec = config.ec;
var prop = config.prop;

var esut = require("easy_util");
var log = esut.log;
var dateUtil = esut.dateUtil;
var digestUtil = esut.digestUtil;

var mcpUtil = require("mcp_util");
var notifyUtil = mcpUtil.notifyUtil;

var cons = require('mcp_constants');
var digestType = cons.digestType;
var notifyType = cons.notifyType;

var Notify = function(){
    var self = this;
    self.ec = {
        E0001:{code:"0001", description:'没有可发送的消息'}
    };
};

/**
 *
 */
Notify.prototype.start = function()
{
    var self = this;
    async.waterfall([
        function(cb)
        {
            dc.init(function(err){
                cb(err);
            });
        },
        //start msg hanled
        function(cb)
        {
            self.sendNotify();
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

Notify.prototype.sendNotify = function()
{
    var self = this;
    self.sendJob = new CronJob('*/5 * * * * *', function () {
        self.sendUntilEmpty();
    });
    self.sendJob.start();
}

/**
 * 发送消息，直到为空
 */
Notify.prototype.sendUntilEmpty = function()
{
    var self = this;
    var table = dc.mg.get("notifyqueen");
    async.waterfall([
        //从队列中取消息
        function(cb)
        {
            table.findAndRemove({}, {}, [], function(err, data){
                if(err)
                {
                    cb(err);
                    return;
                }
                if(!data)
                {
                    cb(self.ec.E0001);
                    return;
                }
                cb(null, data);
            });
        },
        //发送消息
        function(data, cb)
        {
            var msg = {};
            msg.uniqueId = digestUtil.createUUID();
            msg.content = data.content;
            msg.id = data._id;
            msg.type = data.type;
            msg.createTime = dateUtil.toString(data.createTime);

            var options = {
                hostname: data.ip,
                port: data.port,
                path: data.path,
                method: 'POST'
            };

            var key = data.key;
            var msgDigestType = data.digestType;
            if(msgDigestType == undefined)
            {
                msgDigestType = digestType.getInfoById(digestType.trippleDes).headCode;
            }
            else
            {
                msgDigestType = digestType.getInfoById(msgDigestType).headCode;
            }
            self.sendMsg(options, msgDigestType, key, msg, 1, function(err, data){
                cb(err, data);
            });
        }
    ], function (err, result) {
        //无消息可发送
        if(err == self.ec.E0001)
        {
            log.info(err);
        }
        else
        {
            if(err)
            {
                log.error(err);
            }
            self.sendUntilEmpty();
        }
    });
}

/**
 * 发送单个消息
 */
Notify.prototype.sendMsg = function(options, msgDigestType, key, msg, tryCount, cb)
{
    var self = this;
    if(!options.hostname || !key || key.length == 0)
    {
        cb(ec.E4002);
        return;
    }
    var cmd = '';
    if(msg.type == notifyType.TICKET)
    {
        cmd = "N02";
    }
    else if(msg.type == notifyType.GAME)
    {
        cmd = "N03";
    }
    else
    {
        cmd = "N01";
    }
    //不给商户发送的字段
    delete msg.type;
    delete msg.uniqueId;
    notifyUtil.send(options, msgDigestType, key, cmd, msg, function(err, data){
        if(err)
        {
            log.error("配置:");
            log.error(options);
            log.error("第" + tryCount + "次发送通知失败!");
            log.error("消息内容:");
            log.error(msg);
            tryCount++;
            if(tryCount > 3)
            {
                cb(err, data);
            }
            else
            {
                self.sendMsg(options, msgDigestType, key, msg, tryCount, cb);
            }
        }
        else
        {
            log.info("配置:");
            log.info(options);
            log.info("第" + tryCount + "次发送通知成功!");
            log.info("消息内容:");
            log.info(msg);
            cb(null, data);
        }
    });
}


var notify = new Notify();
notify.start();