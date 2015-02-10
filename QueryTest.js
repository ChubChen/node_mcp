var platInterUtil = require('mcp_util').platInterUtil;
var esut = require("easy_util");
var log = esut.log;
var digestUtil = esut.digestUtil;

var QueryTest = function(){
    var self = this;
    self.userId = 'Q0001';
    //self.userId = 'Test_Really_001';
    self.userType = "CHANNEL";
    //self.key = '7601403d33c4443d938bbbb864c4ac05';
    self.key = 'cad6011f5f174a359d9a36e06aada07e';
    self.digestType = "3des";
};

QueryTest.prototype.query = function(cmd, bodyNode, cb)
{
    var self = this;
    platInterUtil.get(self.userId, self.userType, self.digestType, self.key, cmd, bodyNode, function(err, backMsgNode){
        if(err)
        {
            cb(err, backMsgNode);
        }
        else
        {
            var backBodyStr = digestUtil.check(backMsgNode.head, self.key, backMsgNode.body);
            var backBodyNode = JSON.parse(backBodyStr);
            cb(null, backBodyNode);
        }
    });
};

/**
 * 期次查询
 */
QueryTest.prototype.queryCQ01 = function()
{
    var self = this;
    var bodyNode = {cond:{gameCode:{$in:['T06']}}, sort:{}, skip:0, limit:20};
    log.info(bodyNode);
    self.query("CQ01", bodyNode, function(err, backMsgNode){
        if(err)
        {
            log.info('err:' + err);
        }
        else
        {
            log.info('back:');
            log.info(backMsgNode);
        }
    });
};

/**
 * 期次查询
 */
QueryTest.prototype.queryCQ02 = function()
{
    var self = this;
    var bodyNode = {cond:{}, sort:{}, skip:0, limit:20};
    self.query("CQ02", bodyNode, function(err, backMsgNode){
        if(err)
        {
            log.info('err:' + err);
        }
        else
        {
            log.info('back:');
            log.info(backMsgNode);
        }
    });
}

/**
 * 期次查询
 */
QueryTest.prototype.queryCQ03 = function()
{
    var self = this;
    var bodyNode = {cond:{gameCode:'T06'}, sort:{}, skip:0, limit:20};
    self.query("CQ03", bodyNode, function(err, backMsgNode){
        if(err)
        {
            log.info('err:' + err);
        }
        else
        {
            log.info('back:');
            log.info(backMsgNode);
        }
    });
}

/**
 * 奖级查询
 */
QueryTest.prototype.queryCQ04 = function()
{
    var self = this;
    var bodyNode = {cond:{gameCode:'F04', termCode:'2014002'}, sort:{}, skip:0, limit:20};
    self.query("CQ04", bodyNode, function(err, backMsgNode){
        if(err)
        {
            log.info('err:' + err);
        }
        else
        {
            log.info('back:');
            log.info(backMsgNode);
        }
    });
}

/**
 * 期次报表查询
 */
QueryTest.prototype.queryCQ05 = function()
{
    var self = this;
    var bodyNode = {cond:{gameCode:'T06', termCode:'2014001'}, sort:{}, skip:0, limit:20};
    self.query("CQ05", bodyNode, function(err, backMsgNode){
        if(err)
        {
            log.info('err:' + err);
        }
        else
        {
            log.info('back:');
            log.info(backMsgNode);
        }
    });
}

var queryTest = new QueryTest();
queryTest.queryCQ04();
