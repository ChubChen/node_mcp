var async = require('async');
var dc = require("mcp_db").dc;
var esut = require('easy_util');
var test = function () {
    async.waterfall([
        function (cb) {
            dc.init(function(){
                cb(null);
            });
        },
        function (cb) {
            var tticket = dc.main.get("tticket");
            var customer = tticket.find({status:1000,printStatus:1300,customerId:"Q0002"}, {}, []);
            customer.toArray(function(err ,data){
                if(data){
                    async.eachSeries(data, function (row, callback) {
                        if(row.rNumber){
                            var math = row.rNumber.split(";");
                            async.eachSeries(math, function (mathcode ,call) {
                                var peilv = mathcode.split("|")[2].split(",");
                                async.eachSeries(peilv, function (iter, cll) {
                                    if(iter.indexOf('@') > 0  && iter.substr(peilv.indexOf('@')).length >2  ){
                                        cll(null);
                                    }else{
                                        console.log(row.id);
                                        cll(null);

                                    }
                                })
                                call(null);
                            });
                            callback(null);
                        }
                    })
                }else{
                    cb(null);
                }
            });
        }
    ], function (err) {
        cb(err);
    })

}

new test();