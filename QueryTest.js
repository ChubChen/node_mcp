var platInterUtil = require('mcp_util').platInterUtil;
var moment  = require('moment');

var esut = require("easy_util");
var log = esut.log;
var digestUtil = esut.digestUtil;

var QueryTest = function(){
    var self = this;
    self.userId = 'Q0001';
    //self.userId = 'Test_Really_001';
    self.userType = "CHANNEL";
    //self.key = '7601403d33c4443d938bbbb864c4ac05';
    self.key = '135790';
    self.digestType = "md5";
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
            log.info("backMsg:" + JSON.stringify(backMsgNode));
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
    var bodyNode = {gameCode:"T03",termCode:'15130'};
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
    var bodyNode = {cond:{outerId:{$in:["imvui1za6zvndn29"]}}, sort:{}};
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
    var bodyNode = {gameCode:'T02',termCode:'15077'};
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

/**
 * 期次查询
 */
QueryTest.prototype.queryCQ06 = function()
{
    var self = this;
    var bodyNode = {};
    self.query("CQ06", bodyNode, function(err, backMsgNode){
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
QueryTest.prototype.queryCQ10 = function()
{
    var self = this;
    var bodyNode = {requestTime:moment().format('YYYY-MM-DD hh:mm:ss')};
    self.query("CQ10", bodyNode, function(err, backMsgNode){
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
QueryTest.prototype.queryCQ22 = function()
{
    var self = this;
    var bodyNode = {gameCode:'T51', pType:["02"]};
    self.query("CQ22", bodyNode, function(err, backMsgNode){
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
QueryTest.prototype.queryCQ21 = function()
{
    var self = this;
    var bodyNode = {gameCode:'T51', matchCode:["201507057001","201507057002"]};
    self.query("CQ21", bodyNode, function(err, backMsgNode){
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