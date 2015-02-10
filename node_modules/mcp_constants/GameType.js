var GameType = function(){
    var self = this;
    self.info = [{id:1, code:'Normal', des:'普通'},
        {id:2, code:'Gaopin', des:'高频'},
        {id:3, code:'Jingcai', des:'竞彩'}];
    self.infoArray = {};
    self.init();
};

GameType.prototype.init = function()
{
    var self = this;
    for(var key in self.info)
    {
        var set = self.info[key];
        self.infoArray[set.id] = set;
        self[set.code] = set.id;
    };
};

GameType.prototype.getInfoById = function(id)
{
    var self = this;
    var obj = self.info;
    if(id != undefined)
    {
        obj = self.infoArray;
        obj = obj[id];
    }
    return obj;
};

module.exports = new GameType();

