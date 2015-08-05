var async = require("async");
var dc = require("mcp_db").dc;

var test = function () {

}

test.prototype.start = function () {
    var self = this;
    async.waterfall([
        function (cb) {
            dc.init(function(err){
                cb(err);
            })
        },
        function (cb) {
            dc.check(function (err) {
                cb(err);
            })
        }
    ], function (cb) {
        var conntion = dc.main.getConn();
        var conn = conntion.conn;
        conn.beginTransaction(
            self.handle(conntion,function(err,data){
                console.log((err));
                //cb(err);
                if(err){
                    conn.rollback();
                }else{
                    conn.commit();
                }

           })
        );
    })
}

test.prototype.handle = function (conn, cb) {
    var self = this;
        async.waterfall([
            function (cb) {
                var sql = "insert into tticket(gameCode,pType,bType,amount,multiple,outerId,number,customerId,printId,termCode,createTime,status,orderId,auditTime) values('T51','02','21',400,1,123456,'02|201508053016|3,1;02|201508053016|1','Q0001','C0001','termCode',123123,1100,11,123)";
                conn.execute(sql, {}, function (err, data) {
                    console.log(data);
                    cb(err,data)
                });
                /*var ticket = {
                    gameCode:'T51', pType:'02', bType:'21', amount:400,
                    multiple:1, outerId:123456,
                    number:'02|201508053016|3,1;02|201508053016|1', customerId:'Q0001',printId:"C0001",termCode:'termCode',createTime:123123,status:1100,orderId:11,auditTime:123};
                tticket.save(ticket, {}, function(err, data){
                    //console.log(data.insertId);
                    cb(err,data);
                })*/

            }

        ], function (err, data) {
            console.log(err);
            console.log(data);
            cb(err)
        })
}

var t = new test();
t.start()