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
            var customer = tticket.find({status:1000,printStatus:1300}, {}, []);
            customer.toArray(function(err ,data){
                console.log(data);
                if(data){
                    async.eachSeries(data, function (row, callback) {
                        if(row.rNumber){
                            var math = row.rNumber.split(";");
                            async.eachSeries(data, function (mathcode ,call) {
                                var peilv = data.split("|")[2].split(",");
                                async.eachSeries(peilv, function (peilv, cll) {
                                    if(peilv.indexOf('@') && peilv.substr(peilv.indexOf('@')).length >2  ){
                                        cll(null);
                                    }else{
                                        console.log(row);
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
        cb(err)
    })

}

new test();