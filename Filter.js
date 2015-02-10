var express = require('express'), app = express();
var http = require('http');
var async = require('async');
var httpServer = http.createServer(app);

var config = require('mcp_config');
var prop = config.prop;
var errCode = config.ec;

var util = require('mcp_util');
var gatewayInterUtil = util.gatewayInterUtil;

var esut = require("easy_util");
var log = esut.log;
var digestUtil = esut.digestUtil;

var Filter = function(){
    var self = this;
};

Filter.prototype.start = function(){
    var self = this;
    async.waterfall([
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


Filter.prototype.startWeb = function()
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
        self.handle(message, function(err, backMsg){
            try {
                res.type('application/json;charset=utf-8');
                res.send(backMsg);
            }
            catch (err)
            {
                log.info(err);
            }
        });
    });

    app.get("/mcp-filter/main/interface.htm", function(req, res){
        var message = req.query.message;
        self.handle(message, function(err, backMsg){
            try {
                res.type('application/json;charset=utf-8');
                res.send(backMsg);
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
};

Filter.prototype.handle = function(message, cb)
{
    var self = this;
    var headNode;
    try {
        var msgNode = JSON.parse(message);
        headNode = msgNode.head;
    }
    catch (err)
    {
        log.error(err);
        var backHeadNode = {cmd:'E01', digestType:"MD5"};
        var backBodyStr = JSON.stringify(errCode.E0006);
        var backEncodedBody = digestUtil.generate(backHeadNode, null, backBodyStr);
        var backMsg = JSON.stringify({head:backHeadNode, body:backEncodedBody});
        cb(null, backMsg);
        return;
    }
    var start = new Date().getTime();
    gatewayInterUtil.get(message, function(err, backMsg){
        if(err)
        {
            log.error('problem with request: ', err);
            var errHeadNode = {digestType:"MD5"};
            var errBodyStr = JSON.stringify(errCode.E2059);
            var errEncodedBody = digestUtil.generate(errHeadNode, null, errBodyStr);
            var errbackMsg = JSON.stringify({head:errHeadNode, body:errEncodedBody});
            cb(null, errbackMsg);
        }
        else
        {
            var end = new Date().getTime();
            log.info(headNode.cmd + ":" + headNode.userId + ":" + headNode.id + ",用时:" + (end - start) + "ms");
            cb(null, backMsg);
        }
    });
};

var f = new Filter();
f.start();