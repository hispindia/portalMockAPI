module.exports =  hausala;

var constant=require("./CONSTANTS");
var ajax=require("./ajax");
var moment = require("moment");
var MomentRange = require('moment-range');
moment = MomentRange.extendMoment(moment);

function hausala(){    

    init();
    
    function init(){
        getOUs(function(ous){
            getDEs(function(des){
debugger
                var ousMap = ous.organisationUnits.reduce(function(map,obj){
                    
                    if(obj.attributeValues.length > 0){
                        var hausalaCode = obj.attributeValues.reduce(function(hauslaCode,attrval){
                            if (attrval.attribute.code == "hausalaOUID"){
                                return attrval.value;
                            }
                            return hauslaCode; 
                        },false);
                        
                        if(hausalaCode){
                            map[hausalaCode] = obj;
                        }
                    }
                    return map;
                },[]);
                
                
                var desMap = des.dataElements.reduce(function(map,obj){
                    if(obj.code){
                        map[obj.code] = obj;
                    }
                    return map;
                },[]);
                
                transferData(ousMap,desMap,moment().format('YYYY-MM-DD'));
                //historicData(ousMap,desMap)
            })
        })
        

    }

    function historicData(ousMap,desMap){
        function* dateMaker(startDate,endDate){
            
            const range = moment.range(startDate,endDate);
            
            for (var day of range.by('months')) {
                yield day.format('YYYY-MM-DD');
            }
        }


        var dateYielder = dateMaker(moment('2017-04-01').format('YYYY-MM-DD'),moment('2019-05-01').format('YYYY-MM-DD'));

        transfer();
        function transfer(){
            var index = dateYielder.next();
            if (index.done){
                __logger.info("All Done")                
                return
            }
        
            transferData(ousMap,desMap,index.value);
            setTimeout(transfer,10000);
            
        }
        
    }
    
    function transferData(ousMap,desMap,date){
        const startOfMonth = moment(date).startOf('month').format('YYYY-MM-DD');
        const endOfMonth   = moment(date).endOf('month').format('YYYY-MM-DD');
        
        for (var key in constant.hausala_urls){
            __logger.info("Moving for date[" + date+"] "+key);

            ajax.postReqWithoutAuth(
                constant.hausala_urls[key],
                {
                    "from":startOfMonth,
                    "to":endOfMonth
                },function(error,response,body){
                    if (error){
                        __logger.error(error);
                        return;
                    }
                    
                    hausalaImporter(JSON.parse(body),startOfMonth,endOfMonth);
                                        
                });
            
        }
        
        function hausalaImporter(response){
            __logger.info(response.status+" Hausala " + response.data.date_from + "-" + response.data.date_to)
            var dvs = {dataValues:[]};
            
            for(var ouID in response.data.data){
                var record = response.data.data[ouID];

                if (!ousMap[ouID]){
                    __logger.info("[OUNOTMAP-"+ouID+"]Org Unit Not Mapped");
                    continue;
                }
                var ouUID = ousMap[ouID].id;
                
                for (var deID in record){
                    if (!desMap[deID]){
                        continue;
                    }
                    var deUID = desMap[deID].id;
                    var dataValue = {};
                    dataValue.period = getPeriod(startOfMonth,endOfMonth,"Monthly");
	            dataValue.orgUnit = ouUID;
	            dataValue.value = record[deID];
	            dataValue.dataElement = deUID;
	            //dataValue.categoryOptionCombo=decocMap[decoc].newcoc;
                    dvs.dataValues.push(dataValue);
                }
            }

            if (dvs.length == 0){
                return;
            }
            
            ajax.postReq(constant.DHIS_URL_BASE+"/api/dataValueSets",dvs,constant.auth,function(error,response,body){
                if(error){
                    __logger.error("Error with datavalue post"+error)
                    return;
                }
                __logger.info(body.status + " " + JSON.stringify(body.importCount));
                
                debugger
            })
            
            function getPeriod(startdate,enddate,ptype){
	        var pe = null;
	        var refDate = moment(startdate);
	        
	        switch(ptype){
	        case 'Monthly' : pe = refDate.format("YYYY") + "" + refDate.format("MM")
		    break;
	        case 'Yearly' : pe =  refDate.format("YYYY");
		    break;	
	        }
	    
	        return pe;
	    }
            
        }
    }
    
    
    
    function getDEs(callback){
        ajax.getReq(constant.DHIS_URL_BASE+"/api/dataElements?fields=id,name,code&paging=false&filter=dataElementGroups.code:eq:hausala_des",constant.auth,function(error,response,body){
            
            if (error){
                __logger.error("De Error" + response);
                callback(null)
                return;
            }

            
            callback(JSON.parse(body));
            
        })
    }
    
    function getOUs(callback){
        ajax.getReq(constant.DHIS_URL_BASE+"/api/organisationUnits?fields=id,name,attributeValues[value,attribute[id,name,code]]&paging=false",constant.auth,function(error,response,body){
            
            if (error){
                __logger.error("OU Error" + response);
                callback(null)
                return;
            }

            
            callback(JSON.parse(body));
            
        })
    }
}
