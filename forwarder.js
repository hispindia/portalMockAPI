
module.exports =  forwarder;

var constant=require("./CONSTANTS");
var ajax=require("./ajax");
function forwarder(){    
    
    this.pass = function(req,callback){
                
        var params = req.originalUrl.substring(11,req.originalUrl.length);

        if (!filter(params)){
            var msg ={ "response" : "Access Denied"} 
            callback(JSON.stringify(msg));
            return;
        }
        __logger.info("Got request" + req.originalUrl)
        ajax.getReq(constant.DHIS_URL_BASE+"/api/"+params,constant.auth,function(error,response,body){
            __logger.info("Got response" + error)
            
            if (error){
                __logger.error("Error" + response);
                callback(null)
                return;
            }
            callback(body);
            
        })
        
    }

function filter(param){

    for (var i=0;i<constant.endpointWhitelist.length;i++){
        
        if (param.startsWith(constant.endpointWhitelist[i])){
            return true
        }
        
    }
    return false
    
}
    

}
