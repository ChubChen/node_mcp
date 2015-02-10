#!/bin/sh
# shell.sh
#启动和停止项目用
#启动方式 sh shell.sh start [参数 dev test run] 分别表示启动开发模式，测试模式，和生产模式
#停止方式 sh shell.sh stop

usage()
{
        echo "usage: `basename $0` start|stop process name"
}       
OPT=$1
PROCESSID=$2
filterValue=`ps -ef|grep Filter.js|grep -v grep|awk '{print $2}'`
adminValue=`ps -ef|grep Admin.js|grep -v grep|awk '{print $2}'`
gatewayValue=`ps -ef|grep Gateway.js|grep -v grep|awk '{print $2}'`
notifyValue=`ps -ef|grep Notify.js|grep -v grep|awk '{print $2}'`
if [ $# -eq 0 ]; then
        usage
        exit 1
fi      
case $OPT in
        start|Start) echo "Starting.....$PROCESSID"
         if [ ${#filterValue} -eq 0 ]; then
             nohup node Filter.js target=$PROCESSID > /data/mcplog/filter.log 2>&1 &
             echo "Start filter.js success"
         fi
         if [ ${#notifyValue} -eq 0 ]; then
             nohup node Notify.js target=$PROCESSID > /data/mcplog/notify.log 2>&1 &
             echo "Start Notify.js success"
         fi
         if [ ${#adminValue} -eq 0 ]; then
             nohup node Admin.js  target=$PROCESSID > /data/mcplog/admin.log 2>&1 &
             echo "Start Admin.js success"
         fi
         if [ ${#gatewayValue} -eq 0 ]; then
             nohup node Gateway.js target=$PROCESSID gtPort=9090 > /data/mcplog/gateway9090.log 2>&1 &
             nohup node Gateway.js target=$PROCESSID gtPort=9091 > /data/mcplog/gateway9091.log 2>&1 &
             nohup node Gateway.js target=$PROCESSID gtPort=9092 > /data/mcplog/gateway9092.log 2>&1 &
             nohup node Gateway.js target=$PROCESSID gtPort=9093 > /data/mcplog/gateway9093.log 2>&1 &
             nohup node Gateway.js target=$PROCESSID gtPort=9094 > /data/mcplog/gateway9094.log 2>&1 &
             echo "Start Gateway.js success"
         fi
         if [ ${#filterValue} -ne 0 -a ${#adminValue} -ne 0 -a ${#gatewayValue} -ne 0 ]; then
            echo "No bootable projects"
         fi

        ;;
        stop|Stop) echo "Stopping.....$PROCESSID"
               if [ ${#filterValue} -ne 0 ];  then
                 kill -9  `ps -ef|grep Filter.js|grep -v grep|awk '{print $2}'`
                 echo "Stop Filter.js success"
               fi
               if [ ${#adminValue} -ne 0 ];  then
                 kill -9  `ps -ef|grep Admin.js|grep -v grep|awk '{print $2}'`
                 echo "Stop Admin.js success"
               fi
               if [ ${#notifyValue} -ne 0 ];  then
                 kill -9  `ps -ef|grep Notify.js|grep -v grep|awk '{print $2}'`
                 echo "Stop Notify.js success"
               fi
               if [ ${#gatewayValue} -ne 0 ];  then
                  kill -9  `ps -ef|grep Gateway.js|grep -v grep|awk '{print $2}'`
                  echo "Stop Gateway.js success"
               fi
        ;;
        restart|ReStart) echo "ReStarting.....$PROCESSID"
               if [ ${#filterValue} -ne 0 ];  then
                 kill -9  `ps -ef|grep Filter.js|grep -v grep|awk '{print $2}'`
               fi
               nohup node Filter.js target=$PROCESSID > /data/mcplog/filter.log 2>&1 &
                if [ ${#notifyValue} -ne 0 ];  then
                 kill -9  `ps -ef|grep Notify.js|grep -v grep|awk '{print $2}'`
               fi
               nohup node Notify.js target=$PROCESSID > /data/mcplog/notify.log 2>&1 &
               if [ ${#adminValue} -ne 0 ];  then
                 kill -9  `ps -ef|grep Admin.js|grep -v grep|awk '{print $2}'`
               fi
               nohup node Admin.js  target=$PROCESSID > /data/mcplog/admin.log 2>&1 &
               if [ ${#gatewayValue} -ne 0 ];  then
                  kill -9  `ps -ef|grep Gateway.js|grep -v grep|awk '{print $2}'`
               fi
               nohup node Gateway.js target=$PROCESSID gtPort=9090 > /data/mcplog/gateway9090.log 2>&1 &
               nohup node Gateway.js target=$PROCESSID gtPort=9091 > /data/mcplog/gateway9091.log 2>&1 &
               nohup node Gateway.js target=$PROCESSID gtPort=9092 > /data/mcplog/gateway9092.log 2>&1 &
               nohup node Gateway.js target=$PROCESSID gtPort=9093 > /data/mcplog/gateway9093.log 2>&1 &
               nohup node Gateway.js target=$PROCESSID gtPort=9094 > /data/mcplog/gateway9094.log 2>&1 &
               echo "ReStart success........"
        ;;
        *)usage
        ;;
esac    
