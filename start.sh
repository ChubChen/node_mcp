#!/bin/sh
# start.sh  开机启动项目

declare -i i=1
target=dev
while((i == 1));do
    mysql=`ps -ef|grep mysql|grep -v grep|awk '{print $2}'`
    mongodb=`ps -ef|grep mongodb|grep -v grep|awk '{print $2}'`
    if [ ${#mysql} -ne 0 ] && [ ${#mongodb} -ne 0 ] ; then
        echo "start my APP"
        sh /data/workspace/nodejs/node_mcp/startShell.sh start $target
        sh /data/workspace/nodejs/node_mcp/Scheduler.sh start $target
        sh /data/workspace/nodejs/node_mcp/SchClient.sh start $target
        i=2
    else
       echo "休眠2秒"
       sleep 2
    fi
done


