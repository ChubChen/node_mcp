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
var termStatus = cons.termStatus;

var mcp_control = require('mcp_control');
var notifyControl = mcp_control.notifyCtl;


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
    self.sendJob = new CronJob('*/10 * * * * *', function () {
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
        //10秒钟通知一次。并且取出所有队列消息并分组通知
        function (cb) {
            var cursor = table.find({},{},[]).sort({customerId:1}).limit(20);
            var userMap = new Object();
            var userOther = new Object();
            cursor.toArray(function (err, data) {
                async.eachSeries(data, function(ticket, callback){
                    self.getCmd(ticket, function(err, cmd){
                        if(err){
                            callback(err);
                        }else{
                            var key = ticket.customerId +"_"+ data;
                            if(!userMap[key]){
                                var array = new Array();
                                array.push(ticket.content);
                                userMap[key] = array;
                                var info = {};
                                info.userId = ticket.customerId;
                                info.cmd = cmd;
                                info.options = {
                                    hostname: ticket.ip,
                                    port: ticket.port,
                                    path: ticket.path,
                                    method: 'POST'
                                };
                                info.key = ticket.key;
                                var msgDigestType = ticket.digestType;
                                if(msgDigestType == undefined)
                                {
                                    msgDigestType = digestType.getInfoById(digestType.trippleDes).headCode;
                                }
                                else
                                {
                                    msgDigestType = digestType.getInfoById(msgDigestType).headCode;
                                }
                                info.msgDigestType = msgDigestType;
                                userOther[key] = info;
                                //table.remove({_id: ticket._id}, {},function(err, data){
                                    callback(err);
                                //});
                            }else{
                                userMap[key].push(ticket.content);
                               // table.remove({_id: ticket._id}, {},function(err, data){
                                    callback(err);
                               // });
                            }
                        }
                    })
                }, function (err) {
                    cursor.count(function(err, count){
                        cb(null, userMap, userOther, count);
                    });
                });
            });
        },
        //发送消息
        function(userMap, userOther, count, cb)
        {
            if(count > 0){
                for(var key in userMap ){
                    var msgArray = userMap[key];
                    var info = userOther[key];
                    log.info("开始向用户" + info.userId + "发送消息");
                    self.sendMsg(info.options, info.msgDigestType, info.key, info.cmd, msgArray, 1, function(err, data){
                        cb(err, data);
                    });
                }
            }else{
                cb(self.ec.E0001);
            }
        }
    ], function (err, result) {
        //无消息可发送
        if(err)
        {
            log.error(err);
        }
    });
}
Notify.prototype.getCmd = function(msg, cb){
    var cmd = '';
    if(msg.type == notifyType.TICKET)
    {
        cmd = "N02";

    }
    else if(msg.type == notifyType.GAME)
    {
        cmd = "N03";
    }
    else if(msg.type == notifyType.TERM)
    {
        if(msg.status == termStatus.ON_SALE){
            cmd = 'N04';
        }else if(msg.status == termStatus.END){
            cmd = 'N05';
        }else if(msg.status == termStatus.SEND){
            cmd = 'N06';
        }else if(msg.status == termStatus.DRAW){
            cmd = 'N07'
        }else if(msg.status == termStatus.SEAL){
            cmd = 'N08';
        }
    }else{
        cb(ec.E9000);
        return;
    }
    cb(null, cmd);
    return
}
/**
 * 发送单个消息
 */
Notify.prototype.sendMsg = function(options, msgDigestType, key, cmd, msgArray, tryCount, cb)
{
    var self = this;
    if(!options.hostname || !key || key.length == 0)
    {
        cb(ec.E4002);
        return;
    }
    async.waterfall([
        //根据业务过滤返回字段
        function(cb){
            notifyControl.handle(msgArray, cmd, function (err, bodyNode) {
                if(err){
                    cb(err);
                }else{
                    cb(null, bodyNode);
                }
            })
        }
    ],function(err, msg){
        if(err){
            log.error(err);
        }else{
            notifyUtil.send(options, msgDigestType, key, cmd, msg, function(err, data){
                if(err)
                {
                    log.error(err);
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
                        self.sendMsgAgain(options, msgDigestType, key, cmd, msg, tryCount, cb)
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
    });
}


Notify.prototype.sendMsgAgain = function(options, msgDigestType, cmd , key, msg, tryCount, cb){

    notifyUtil.send(options, msgDigestType, key, cmd, msg, function(err, data){
        if(err)
        {
            log.error(err);
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
};


var notify = new Notify();
notify.start();