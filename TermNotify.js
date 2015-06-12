var service = require("mcp_service");
var notifySer = service.notifySer;
var dc = require('mcp_db').dc;

var Test = function(){};

Test.prototype.handleNotify = function () {
    async.waterfall([
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
        //更新期次状态
        function (cb) {
            var table = dc.main.get("term");
            var cond = {id: ""};
            table.findOne(cond, {}, [], function(err,term){
                term.status = "";
                cb(err, term);
            });
        },
        //发送期次已经开奖的消息
        function (term, cb) {
            //通知信息
            log.info("通知term");
            log.info(term);
            notifySer.saveTerm(term, cb);
        }
    ], function (err) {
        log.info("依发出")
    });
}
