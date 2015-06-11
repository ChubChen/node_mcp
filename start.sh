#!/bin/sh
# start.sh  开机启动项目将此脚本加入 服务即可
#加入方法 
#第一步 cp start.sh /etc/init.d/nodeapp 
#第二步chmod +x /etc/init.d/nodeapp
#第三部 chkconfig --add nodeapp
#第四步 chkconfig nodeapp on
#chkconfig:2345 80 05 --指定在哪几个级别执行，0一般指关机，
#6指的是重启，其他为正常启动。80为启动的优先级，05为关闭的优先机
#description:mystart service
RETVAL=0
usage()
{
    echo "usage: `basename $0` start|stop|restart process name"
}
OPT=$1
TARGET=$2
if [ $# -eq 0 ]; then
        usage
        exit 1
fi
case $OPT in
        start|Start) echo "Starting....."
	source /etc/profile 
	declare -i i=1
	while((i == 1));do
   	 	mysql=`ps -ef|grep mysql|grep -v grep|awk '{print $2}'`
   		mongodb=`ps -ef|grep mongodb|grep -v grep|awk '{print $2}'`
    		if [ ${#mysql} -ne 0 ] && [ ${#mongodb} -ne 0 ] ; then
        		sh /data/workspace/nodejs/node_mcp/startShell.sh start $TARGET
        		sh /data/workspace/nodejs/node_mcp/Scheduler.sh start $TARGET
       			sh /data/workspace/nodejs/node_mcp/SchClient.sh start $TARGET
        		i=2
   		else
       			echo "由于数据库没有正常启动休眠2秒"
       			sleep 2
    		fi
	done
	;;
        stop|Stop) echo "Stopping....."
		sh /data/workspace/nodejs/node_mcp/startShell.sh stop 
                sh /data/workspace/nodejs/node_mcp/Scheduler.sh stop 
                sh /data/workspace/nodejs/node_mcp/SchClient.sh stop
	;;
        restart|ReStart) echo "ReStarting...."
		sh /data/workspace/nodejs/node_mcp/startShell.sh restart $TARGET
                sh /data/workspace/nodejs/node_mcp/Scheduler.sh restart $TARGET
                sh /data/workspace/nodejs/node_mcp/SchClient.sh restart $TARGET
	;;
        *)usage
        ;;
esac
exit $RETVAL
