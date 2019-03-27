module.exports =  hausala;

var constant=require("./CONSTANTS");
var ajax=require("./ajax");
var moment = require("moment");

function hausala(){    

    init();
    
    function init(){
        getOUs(function(ous){
            getDEs(function(des){

                var ousMap = ous.organisationUnits.reduce(function(map,obj){
                    if(obj.code){
                        map[obj.code] = obj;
                    }
                    return map;
                },[]);

                
                var desMap = des.dataElements.reduce(function(map,obj){
                    if(obj.code){
                        map[obj.code] = obj;
                    }
                    return map;
                },[]);
                
                transferData(ousMap,desMap);
            })
        })
        

    }

    function transferData(ousMap,desMap){
        debugger
    }
    function getDEs(callback){
        ajax.getReq(constant.DHIS_URL_BASE+"/api/dataElements?fields=id,name,code&paging=false",constant.auth,function(error,response,body){
            __logger.info("Got response" + error)
            
            if (error){
                __logger.error("Error" + response);
                callback(null)
                return;
            }

            
            callback(JSON.parse(body));
            
        })
    }
    
    function getOUs(callback){
        ajax.getReq(constant.DHIS_URL_BASE+"/api/organisationUnits?fields=id,name,code&paging=false",constant.auth,function(error,response,body){
            __logger.info("Got response" + error)
            
            if (error){
                __logger.error("Error" + response);
                callback(null)
                return;
            }

            
            callback(JSON.parse(body));
            
        })
    }
}
