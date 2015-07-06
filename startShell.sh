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
filterValue=`ps -ef|grep FilterNew.js|grep -v grep|awk '{print $2}'`
adminValue=`ps -ef|grep Admin.js|grep -v grep|awk '{print $2}'`
notifyValue=`ps -ef|grep Notify.js|grep -v grep|awk '{print $2}'`
jcTermCorn=`ps -ef|grep JcTermCorn.js|grep -v grep|awk '{print $2}'`
tcdrawNumber=`ps -ef|grep TcDrawNumberQuery.js|grep -v grep|awk '{print $2}'`

if [ $# -eq 0 ]; then
        usage
        exit 1
fi
case $OPT in
        start|Start) echo "Starting.....$PROCESSID"
         if [ ${#filterValue} -eq 0 ]; then
             nohup node FilterNew.js target=$PROCESSID > /data/mcplog/filter.log 2>&1 &
             echo "Start FilterNew.js success"
         fi
         if [ ${#notifyValue} -eq 0 ]; then
              nohup node Notify.js target=$PROCESSID > /data/mcplog/notify.log 2>&1 &
              echo "Start Notify.js success"
         fi
         if [ ${#adminValue} -eq 0 ]; then
              nohup node Admin.js  target=$PROCESSID > /data/mcplog/admin.log 2>&1 &
              echo "Start Admin.js success"
         fi
         if [ ${#jcTermCorn} -eq 0 ]; then
              nohup node JcTermCorn.js  target=$PROCESSID > /data/mcplog/jcTermCorn.log 2>&1 &
              echo "Start JcTermCorn.js success"
         fi
         if [ ${#tcdrawNumber} -eq 0 ]; then
               nohup node TcDrawNumberQuery.js  target=$PROCESSID > /data/mcplog/tcDrawNumberQuery.log 2>&1 &
               echo "Start TcDrawNumberQuery.js success"
         fi
        ;;
        stop|Stop) echo "Stopping.....$PROCESSID"
               if [ ${#filterValue} -ne 0 ];  then
                 kill -9  `ps -ef|grep FilterNew.js|grep -v grep|awk '{print $2}'`
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
               if [ ${#jcTermCorn} -ne 0 ];  then
                  kill -9  `ps -ef|grep JcTermCorn.js|grep -v grep|awk '{print $2}'`
                  echo "Stop JcTermCorn.js success"
               fi
               if [ ${#tcdrawNumber} -ne 0 ];  then
                  kill -9  `ps -ef|grep TcDrawNumberQuery.js|grep -v grep|awk '{print $2}'`
                  echo "Stop TcDrawNumberQuery.js success"
               fi
        ;;
        restart|ReStart) echo "ReStarting.....$PROCESSID"
               if [ ${#filterValue} -ne 0 ];  then
                 kill -9  `ps -ef|grep FilterNew.js|grep -v grep|awk '{print $2}'`
               fi
               nohup node FilterNew.js target=$PROCESSID > /data/mcplog/filter.log 2>&1 &
               if [ ${#notifyValue} -ne 0 ];  then
                 kill -9  `ps -ef|grep Notify.js|grep -v grep|awk '{print $2}'`
               fi
               nohup node Notify.js target=$PROCESSID > /data/mcplog/notify.log 2>&1 &
               if [ ${#jcTermCorn} -ne 0 ];  then
                  kill -9  `ps -ef|grep JcTermCorn.js|grep -v grep|awk '{print $2}'`
               fi
               nohup node JcTermCorn.js target=$PROCESSID > /data/mcplog/jcTermCorn.log 2>&1 &

               if [ ${#tcdrawNumber} -ne 0 ];  then
                  kill -9  `ps -ef|grep TcDrawNumberQuery.js|grep -v grep|awk '{print $2}'`
               fi
               nohup node TcDrawNumberQuery.js target=$PROCESSID > /data/mcplog/tcDrawNumberQuery.log 2>&1 &

               if [ ${#adminValue} -ne 0 ];  then
                 kill -9  `ps -ef|grep Admin.js|grep -v grep|awk '{print $2}'`
               fi
               nohup node Admin.js  target=$PROCESSID > /data/mcplog/admin.log 2>&1 &
               echo "ReStart success........"
        ;;
        *)usage
        ;;
esac
