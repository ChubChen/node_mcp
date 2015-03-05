/**
 * Created by CH on 15-3-5.
 */
var http = require('http');
var qs = require('querystring');
var moment = require("moment");
var cons = require("mcp_constants");
var termStatus = cons.termStatus;
var async = require('async');
var esut = require('easy_util');
var dc = require('mcp_db').dc;
var log = esut.log;

var data = {
    'i_format': 'json',
    'i_callback':'getData',
    //'poolcode[]':'hhad',
    'poolcode[]':'hhad',
    '_':new Date().getTime()
};

var content = qs.stringify(data);

var options = {
    hostname: 'i.sporttery.cn',
    port: 80,
    path: '/odds_calculator/get_odds?' + content,
    method: 'GET'
};

var req = http.request(options, function (res) {
    res.setEncoding("utf8");
    var resData = "";
    res.on("data", function (data) {
        resData += data;
    });
    res.on("end", function () {
        async.waterfall([
            function(cb){
                dc.init(function(err){
                    cb(err);
                });
            },
            function(cb){
                var objStr=resData.substring(8,resData.length-2);
                var obj = JSON.parse(objStr);

                var time=obj.status;
                console.log('场次最后更新时间：'+time.last_updated);
                var data = obj.data;
                var termArray = new Array();
                for(var key in data){
                    termArray.push(data[key]);
                }

                var Termtable = dc.main.get("term");

                async.each(termArray, function (term, callback) {
                    var dateStr = moment(term.date, "YYYY-MM-DD");
                    var code = dateStr.format("YYYYMMDD").valueOf()+ dateStr.weekday()+ term.num.substr(term.num.length-3);
                    var openTime = moment().format("YYYYMMDD hh:mm:ss");
                    var closeTime = term.date + " "+ term.time;
                    var status = termStatus.ON_SALE;

                    var tableTerm = {id:"T51_"+code, gameCode:"T51",code:code,nextCode:"-1",openTime:openTime,closeTime:closeTime,status:status};
                    Termtable.save(tableTerm, {},  function(){
                        if(term.had != undefined) {
                            var jcodds = {id:"T51_"+code+"_"+02,matchCode: code, gameCode: "T51", createTime: moment().format("YYYYMMDD hh:mm:ss"), pType: "02", matchName: term.h_cn + "|" + term.a_cn + "|" + term.l_cn + "|" + "",
                                oddsInfo: term.had.h + "|" + term.had.d + "|" + term.had.a, oddsCode: "cn02", oddsName: ""};
                            var jcoddsTable = dc.main.get("jcodds");
                            console.log(jcodds);
                            jcoddsTable.save(jcodds , {}, function(err){
                                log.info(err);
                                callback(null);
                            });
                        }
                        if(term.hhad != undefined){
                            var jcoddshhad = {id:"T51_"+code+"_"+01,matchCode:code,gameCode:"T51",createTime:moment().format("YYYYMMDD hh:mm:ss"),pType:"01",matchName:term.h_cn+"|"+term.a_cn+"|"+term.l_cn+"|"+term.hhad.fixedodds,
                                oddsInfo:term.hhad.h+"|"+term.hhad.d+"|"+term.hhad.a,oddsCode:"cn01",oddsName:""};
                            var jcoddsTable = dc.main.get("jcodds");
                            console.log(jcoddshhad);
                            jcoddsTable.save(jcoddshhad ,{}, function(err){
                                log.info(err);
                                callback(null);
                            });
                        }
                    });

                });
            }], function (err, result) {
            log.info(err);
            log.info("end...........");
        });
    });
});

req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
});

req.end();
