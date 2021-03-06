var express = require('express'), app = express();
var http = require('http');
var async = require('async');
var httpServer = http.createServer(app);

var config = require("mcp_config");
var errCode = config.ec;
var prop = config.prop;

var cmdFac = require("mcp_factory").cmdFac;
var dc = require('mcp_db').dc;

var esut = require("easy_util");
var log = esut.log;
var digestUtil = esut.digestUtil;

var Gateway = function(){
    var self = this;
};

Gateway.prototype.start = function(){
    var self = this;
    async.waterfall([
        //connect db
        function(cb)
        {
            dc.init(function(err){
                cb(err);
            });
        },
        //校验基础数据的可用性
        function(cb)
        {
            dc.check(function(err){
                cb(err);
            });
        },
        //start web
        function(cb)
        {
            self.startWeb();
            cb(null, "success");
        }
    ], function (err, result) {
        if(err)
        {
            console.error(err); // -> null
        }
        else
        {
            console.log(result); // -> 16
        }
    });
};

Gateway.prototype.startWeb = function()
{
    var self = this;

    //是Connect內建的middleware，设置此处可以将client提交过来的post请求放入request.body中
    app.use(express.bodyParser());
    //是Connect內建的，可以协助处理POST请求伪装PUT、DELETE和其他HTTP methods
    app.use(express.methodOverride());
    //route requests
    app.use(app.router);

    app.configure('development', function(){
        app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
    });

    app.configure('production', function(){
        app.use(express.errorHandler());
    });

    app.post("/mcp-filter/main/interface.htm", function(req, res){
        var message = req.body.message;
        self.handle(message, function(backMsgNode){
            res.json(backMsgNode);
            log.info(backMsgNode);
        });
    });

    app.get("/mcp-filter/main/interface.htm", function(req, res){
        var message = req.query.message;
        self.handle(message, function(backMsgNode){
            res.json(backMsgNode);
            log.info(backMsgNode);
        });
    });
    //特殊接
    app.post("/mcp-filter/getPrintTicket.htm", function(req, res){
        self.handleNew(req, function(backMsgNode){
            res.json(backMsgNode)
            log.info(backMsgNode);
        });
    });

    log.info("程序在端口" + prop.gtPort + "启动.........");
    httpServer.listen(prop.gtPort);
};
Gateway.prototype.handleNew = function(req, cb){
    var self = this;
    log.info("给梁峥增加的特殊接口"+req.request);
    try {
        log.info("message out:" + req.request);
        if(message == undefined){
           log.error("参数错误！");
            return;
        }
        //var msgNode = JSON.parse(message);

        var request = req.request;
        var data = req.data;
        var start = new Date().getTime();
        cmdFac.handleNew(request,function(err, body){
            var backHeadNode = {code:"10000", message:"处理成功", data:body};
            if(err){
                backHeadNode.code = "9999";
                backHeadNode.message = "处理失败！";
            }
            var end = new Date().getTime();
            log.info(request + ":" +data+ ":,用时:" + (end - start) + "ms");
            cb(backHeadNode);
        });
    }
    catch (err)
    {
        log.error("处理失败，失败原因：" + err);
        cb({code:99999,message:"处理失败"});
        return;
    }
}

Gateway.prototype.handle = function(message, cb)
{
    var self = this;
    log.info(message);
    try {
        log.info("message out:" + message);
        if(message == undefined){
            cb({head:{cmd:'E01'}, body:JSON.stringify(errCode.E0007)});
            return;
        }
        var msgNode = JSON.parse(message);
        var headNode = msgNode.head;
        var bodyStr = msgNode.body;
        var start = new Date().getTime();
        cmdFac.handle(headNode, bodyStr, function(err, bodyNode) {
            var backHeadNode = {messageId:digestUtil.createUUID()};
            var key = headNode.key;
            if(key == undefined)
            {
                key = digestUtil.getEmptyKey();
                if(headNode.digestType == '3des')
                {
                    headNode.digestType = "3des-empty";
                }
            }
            else
            {
                delete headNode.key;
            }
            if (bodyNode == undefined) {
                bodyNode = {};
            }
            if (err) {
                backHeadNode.repCode = err.repCode;
                backHeadNode.description = err.description;
            }
            else
            {
                backHeadNode.repCode = errCode.E0000.repCode;
                backHeadNode.description = errCode.E0000.description;
            }
            backHeadNode.timestamp = headNode.timestamp;
            backHeadNode.digestType = headNode.digestType;
            log.info(bodyNode);
            var decodedBodyStr = digestUtil.generate(backHeadNode, key, JSON.stringify(bodyNode));
            var end = new Date().getTime();
            log.info(headNode.cmd + ":" + headNode.userId + ":" + headNode.id + ",用时:" + (end - start) + "ms");
            cb({head: backHeadNode, body: decodedBodyStr});
        });
    }
    catch (err)
    {
        cb({head:{cmd:'E01'}, body:JSON.stringify(errCode.E2058)});
        return;
    }
};

var gateway = new Gateway();
gateway.start();