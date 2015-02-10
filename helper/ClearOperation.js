var async = require('async');
var esut = require('easy_util');
var constants = require('mcp_constants');
var dc = require('mcp_db').dc;
var log = esut.log;
var userType = constants.userType;

var addOperation = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb){
            var operationTable = dc.main.get("operation");
            operationTable.drop(function(err, data){
                cb(null);
            });
        },
        function(cb)
        {
            var operationTable = dc.main.get("operation");
            operationTable.create(function(err, data){
                cb(err);
            });
        },
        function(cb)
        {
            var operationTable = dc.main.get("operation");

            operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_PRINT', name:'出票管理', url:'', hasChildren:1, level:1}, [], function(err, data){
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_PRINT_QUEEN', parent:'ADMIN_PRINT', name:'出票队列', url:'print_queenList.html', hasChildren:0, level:6}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_PERMISSION', parent:'ADMIN_PRINT', name:'游戏管理', url:'game_control.html', hasChildren:0, level:5}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_CUSTOMER', parent:'ADMIN_PRINT', name:'帐号管理', url:'customer_list.html', hasChildren:0, level:4}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_TERM', parent:'ADMIN_PRINT', name:'期次查询', url:'term_list.html', hasChildren:0, level:3}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_TICKET', parent:'ADMIN_PRINT', name:'彩票查询', url:'ticket_list.html', hasChildren:0, level:2}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_ORDER', parent:'ADMIN_PRINT', name:'订单查询', url:'order_list.html', hasChildren:0, level:1}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_TERMREPORT', parent:'ADMIN_PRINT', name:'期次报表', url:'report_list.html', hasChildren:0}, [], function(err, data){
                });
            });

            operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_MANAGE', name:'内部管理', url:'', hasChildren:1, level:2}, [], function(err, data){
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_DRAW_QUEEN', parent:'ADMIN_MANAGE', name:'算奖队列', url:'ticket_drawList.html', hasChildren:0, level:5}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_MSG', parent:'ADMIN_MANAGE', name:'消息列表', url:'msg_list.html', hasChildren:0, level:4}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'CHANNEL_LIST_NOTIFY', parent:'ADMIN_MANAGE', name:'通知列表', url:'notify_list.html', hasChildren:0, level:3}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'CHANNEL_LIST_MONGO', parent:'ADMIN_MANAGE', name:'mongodb', url:'mongo_index.html', hasChildren:0, level:2}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'CHANNEL_LIST_MYSQL', parent:'ADMIN_MANAGE', name:'mysql', url:'mysql_index.html', hasChildren:0, level:1}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_GAME', parent:'ADMIN_MANAGE', name:'游戏列表', url:'game_list.html', hasChildren:0, level:6}, [], function(err, data){
                });
            });

/**
            operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_GAME', name:'游戏管理', url:'', hasChildren:1}, [], function(err, data){
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_GAME', parent:'ADMIN_GAME', name:'游戏列表', url:'game_list.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_TERM', parent:'ADMIN_GAME', name:'期次列表', url:'term_list.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_GAMEGRADE', parent:'ADMIN_GAME', name:'奖级列表', url:'gamegrade_list.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_RELATION', parent:'ADMIN_GAME', name:'出票转发', url:'relation_list.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_PRINT_QUEEN', parent:'ADMIN_GAME', name:'出票队列', url:'print_queenList.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_DRAW_QUEEN', parent:'ADMIN_GAME', name:'算奖队列', url:'ticket_drawList.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_PERMISSION', parent:'ADMIN_GAME', name:'游戏控制', url:'game_control.html', hasChildren:0}, [], function(err, data){
                });
            });
            operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_MSG', name:'消息管理', url:'', hasChildren:1}, [], function(err, data){
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_MSG', parent:'ADMIN_MSG', name:'消息列表', url:'msg_list.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_TERM_MSG', parent:'ADMIN_MSG', name:'期次消息', url:'term_msgList.html', hasChildren:0}, [], function(err, data){
                });
            });
            operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_SALE', name:'销售管理', url:'', hasChildren:1}, [], function(err, data){
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_ORDER', parent:'ADMIN_SALE', name:'订单列表', url:'order_list.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_TICKET', parent:'ADMIN_SALE', name:'票据列表', url:'ticket_list.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_TERMREPORT', parent:'ADMIN_SALE', name:'期次报表', url:'report_list.html', hasChildren:0}, [], function(err, data){
                });
            });
            operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_CUSTOMER', name:'用户管理', url:'', hasChildren:1}, [], function(err, data){
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_CUSTOMER', parent:'ADMIN_CUSTOMER', name:'用户列表', url:'customer_list.html', hasChildren:0}, [], function(err, data){
                });
            });
            operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_ACCOUNT', name:'账户管理', url:'', hasChildren:1}, [], function(err, data){
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_MONEYLOG', parent:'ADMIN_ACCOUNT', name:'账户流水', url:'moneylog_list.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_ACCOUNTCFG', parent:'ADMIN_ACCOUNT', name:'系统科目', url:'moneylog_subjectList.html', hasChildren:0}, [], function(err, data){
                });
            });

            operationTable.save({userType:userType.ADMINISTRATOR, id:'CHANNEL_NOTIFY', name:'通知管理', url:'', hasChildren:1}, [], function(err, data){
                operationTable.save({userType:userType.ADMINISTRATOR, id:'CHANNEL_LIST_NOTIFY', parent:'CHANNEL_NOTIFY', name:'通知列表', url:'notify_list.html', hasChildren:0}, [], function(err, data){
                });
            });

            operationTable.save({userType:userType.ADMINISTRATOR, id:'CHANNEL_ENTITY', name:'实体管理', url:'', hasChildren:1}, [], function(err, data){
                operationTable.save({userType:userType.ADMINISTRATOR, id:'CHANNEL_LIST_MONGO', parent:'CHANNEL_ENTITY', name:'mongodb', url:'mongo_index.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'CHANNEL_LIST_MYSQL', parent:'CHANNEL_ENTITY', name:'mysql', url:'mysql_index.html', hasChildren:0}, [], function(err, data){
                });
            });
            */

            operationTable.save({userType:userType.CHANNEL, id:'CHANNEL_MAIN_BANK', name:'充值', url:'recharge_bank.html', hasChildren:0 ,version:1, level:1}, [], function(err, data){
            });
            operationTable.save({userType:userType.CHANNEL, id:'CHANNEL_LIST_PRINT', name:'出票明细', url:'sale_print.html', hasChildren:0,version:1, level:2}, [], function(err, data){
            });
            operationTable.save({userType:userType.CHANNEL, id:'CHANNEL_LIST_DAY', name:'日销量中奖', url:'sale_day.html', hasChildren:0 ,version:1, level:3}, [], function(err, data){
            });
            operationTable.save({userType:userType.CHANNEL, id:'CHANNEL_LIST_TERM', name:'期销量中奖', url:'sale_term.html', hasChildren:0 ,version:1, level:4}, [], function(err, data){
            });
            operationTable.save({userType:userType.CHANNEL, id:'CHANNEL_LIST_MONEY', name:'账户流水查询', url:'sale_money.html', hasChildren:0 ,version:1, level:5}, [], function(err, data){
            });
            operationTable.save({userType:userType.CHANNEL, id:'CHANNEL_MAIN_ACCOUNT', name:'修改资料', url:'channel_myinfo.html', hasChildren:0 ,version:1, level:6}, [], function(err, data){
            });
            operationTable.save({userType:userType.CHANNEL, id:'CHANNEL_MAIN_RECHARGE', name:'修改密码', url:'channel_changepsw.html', hasChildren:0 ,version:1,level:7}, [], function(err, data){
            });


            cb(null, "success");
        }
    ], function (err, result) {
        log.info(err);
        log.info(result);
        log.info("end...........");
    });
};

addOperation();