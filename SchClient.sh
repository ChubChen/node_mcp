# Scheduler.sh
#启动后台项目和停止后台项目用
#启动方式 sh shell.sh start [参数 dev test run] 分别表示启动开发模式，测试模式，和生产模式
#停止方式 sh shell.sh stop

usage()
{
        echo "usage: `basename $0` start|stop process name"
}       
OPT=$1
PROCESSID=$2
pidValue=`ps -ef|grep SchClient.js|grep -v grep|awk '{print $2}'`
if [ $# -eq 0 ]; then
        usage
        exit 1
fi      
case $OPT in
        start|Start) echo "Starting.....$PROCESSID"
         if [ ${#pidValue} -eq 0 ]; then
             nohup node SchClient.js target=$PROCESSID  > /data/mcplog/schclient0.log 2>&1 &
             nohup node SchClient.js target=$PROCESSID  > /data/mcplog/schclient1.log 2>&1 &
             nohup node SchClient.js target=$PROCESSID  > /data/mcplog/schclient2.log 2>&1 &
             nohup node SchClient.js target=$PROCESSID  > /data/mcplog/schclient3.log 2>&1 &
             nohup node SchClient.js target=$PROCESSID  > /data/mcplog/schclient4.log 2>&1 &
             nohup node SchClient.js target=$PROCESSID  > /data/mcplog/schclient5.log 2>&1 &
             echo "Start  SchClient.js success"
          else
             echo "Please, Do not repeat the start"
          fi
        ;;
        stop|Stop) echo "Stopping.....$PROCESSID"
               if [ ${#pidValue} -ne 0 ];  then
                 kill -9  `ps -ef|grep SchClient.js|grep -v grep|awk '{print $2}'`
                 echo "Stop  SchClient.js success"
               else
                 echo "You cannot repeat stop"
               fi
        ;;
        restart|ReStart) echo "ReStarting.....$PROCESSID"
               if [ ${#pidValue} -ne 0 ];  then
                 kill -9  `ps -ef|grep SchClient.js|grep -v grep|awk '{print $2}'`
               fi
             nohup node SchClient.js target=$PROCESSID  > /data/mcplog/schclient0.log 2>&1 &
             nohup node SchClient.js target=$PROCESSID  > /data/mcplog/schclient1.log 2>&1 &
             nohup node SchClient.js target=$PROCESSID  > /data/mcplog/schclient2.log 2>&1 &
             nohup node SchClient.js target=$PROCESSID  > /data/mcplog/schclient3.log 2>&1 &
             nohup node SchClient.js target=$PROCESSID  > /data/mcplog/schclient4.log 2>&1 &
             nohup node SchClient.js target=$PROCESSID  > /data/mcplog/schclient5.log 2>&1 &
             echo "ReStart success......."
        ;;
        *)usage
        ;;
esac    
