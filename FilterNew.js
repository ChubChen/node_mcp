/**
 * Created by CH on 15-4-14.
 */
var express = require('express'), app = express();
var http = require('http');
var async = require('async');
var httpServer = http.createServer(app);

var config = require('mcp_config');
var prop = config.prop;
var errCode = config.ec;

var cmdFac = require("mcp_factory").cmdFac;
var dc = require('mcp_db').dc;

var esut = require("easy_util");
var log = esut.log;
var digestUtil = esut.digestUtil;
var dateUtil = esut.dateUtil;

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

var Filter = function(){
    var self = this;
};

Filter.prototype.start = function(){
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
        }
    ], function (err, result) {
        if(err)
        {
            console.error(err); // -> null
        }
        else
        {
            log.info(result); // -> 16
        }
    });
};

Filter.prototype.startWeb = function()
{
    var self = this;
    if (cluster.isMaster) {
        //首先启动是主进程
        log.info('[master] ' + "start master...");

        //创建CPU核数相同的进程
        for (var i = 0; i < numCPUs; i++) {
            var wk = cluster.fork();
            wk.send('[master] ' + 'hi worker' + wk.id);
        }

        //一系列的监听进程
        cluster.on('fork', function (worker) {
            log.info('[master] ' + 'fork: worker' + worker.id);
        });

        cluster.on('online', function (worker) {
            log.info('[master] ' + 'online: worker' + worker.id);
        });

        cluster.on('listening', function (worker, address) {
            log.info('[master] ' + 'listening: worker' + worker.id + ',pid:' + worker.process.pid + ', Address:' + address.address + ":" + address.port);
        });

        cluster.on('disconnect', function (worker) {
            log.info('[master] ' + 'disconnect: worker' + worker.id);
        });

        cluster.on('exit', function (worker, code, signal) {
            log.error('[master] ' + 'exit worker' + worker.id + ' died');
            cluster.fork();
        });

        process.on('uncaughtException', function(err){
            log.error("master error");
            log.error(err.stack);
        });
        /*//遍历每个进程监听 从进程给主进程的message消息
        Object.keys(cluster.workers).forEach(function(id) {
            cluster.workers[id].on('message', function(msg){
                log.info('[master] ' + 'message ' + msg);
            });
        });*/

    } else if (cluster.isWorker) {
        log.info('[worker] ' + "start worker ..." + cluster.worker.id);

       /*//从进程接受主进程消息
        process.on('message', function(msg) {
            log.info('[worker] '+msg);
            process.send('[worker] worker' + cluster.worker.id + ' received!');
        });*/


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
            self.handle(message, function(backMsg){
                try {
                    res.type('application/json;charset=utf-8');
                    res.send(backMsg);
                    //res.json(backMsg);
                    log.info('worker' + cluster.worker.id + ',PID:' + process.pid );
                }
                catch (err)
                {
                    log.info(err);
                }
            });
        });

        app.get("/mcp-filter/main/interface.htm", function(req, res){
            var message = req.query.message;
            self.handle(message, function( backMsg){
                try {
                    res.type('application/json;charset=utf-8');
                    res.send(backMsg);
                    log.info('worker' + cluster.worker.id + ',PID:' + process.pid );
                }
                catch (err)
                {
                    log.info(err);
                }
            });
        });

        app.post("/main/notify.htm", function(req, res){
            var message = req.body.message;
            log.info(message);
            res.json({});
        });
        httpServer.listen(prop.filterPort);
    }
};
Filter.prototype.handle = function(message, cb)
{
    var self = this;
    log.info("message :" + message);
    if(message == undefined){
        cb({head:errCode.E0007, body:"{}"});
        return;
    }
    try {
        var msgNode = JSON.parse(message);
    }catch (err){
        log.error(err);
        cb({head: errCode.E2058, body:"{}"});
    }
    var headNode = msgNode.head;
    var bodyStr = msgNode.body;
    var start = new Date().getTime();
    try{
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
            var decodedBodyStr = digestUtil.generate(backHeadNode, key, JSON.stringify(bodyNode));
            var end = new Date().getTime();
            log.info(headNode.cmd + ":" + headNode.userId + ":" + headNode.id + ",用时:" + (end - start) + "ms");
            log.info("backBody"+ JSON.stringify(bodyNode));
            cb({head: backHeadNode, body: decodedBodyStr});
        });
    }
    catch (err)
    {
        log.error(err);
        var backHeadNode = {messageId:digestUtil.createUUID()};
        backHeadNode.repCode = errCode.E9999.repCode;
        backHeadNode.description = errCode.E9999.description;
        backHeadNode.timestamp = dateUtil.getCurTime();
        backHeadNode.digestType = 'md5';
        var decodedBodyStr = digestUtil.generate(backHeadNode, key, '{}');
        cb({head:backHeadNode, body:decodedBodyStr});
        return;
    }
    //全局打印异常
    process.on('uncaughtException', function(err){
        log.error("[worker]" + cluster.worker.id + " error");
        log.error(err.stack);
        var backHeadNode = {messageId:digestUtil.createUUID()};
        backHeadNode.repCode = errCode.E9999.repCode;
        backHeadNode.description = errCode.E9999.description;
        backHeadNode.timestamp = dateUtil.getCurTime();
        backHeadNode.digestType = 'md5';
        var decodedBodyStr = digestUtil.generate(backHeadNode, key, '{}');
        cb({head:backHeadNode, body:decodedBodyStr});
    });
};

var f = new Filter();
f.start();
