module.exports =  dvdms;

var constant=require("./CONSTANTS");
var ajax=require("./ajax");
var moment = require("moment");
var MomentRange = require('moment-range');
moment = MomentRange.extendMoment(moment);
var request = require("request");

function dvdms(){

    init();

    function init() {
        getOUs(function(ous){
            getDEs(function(des){
                var ousMap1 = ous.organisationUnits.reduce(function(map,obj){
                    if(obj.attributeValues.length > 0){
                        var dvdmsCode = obj.attributeValues.reduce(function(dvdmsCode,attrval){
                            if (attrval.attribute.code == "dvdmsStoreCode"){
                                return attrval.value
                            }
                            return dvdmsCode;
                        },false);

                        if(dvdmsCode){
                            map[dvdmsCode] = obj;
                        }
                    }
                    return map;
                },[]);

                var desMap1 = des.dataElements.reduce(function(map,obj){
                    if(obj.code){
                        var keyName = obj.formName +" ["+obj.code+"]"
                        map[keyName] = obj;
                    }
                    return map;
                },[]);

                transferData(ousMap1,desMap1,moment().format('YYYY-MM-DD'));
            })
        })
    }


    function transferData(ousMap,desMap,date){

        var eventDate = new Date('2020-04-01');
        const startOfMonth = moment(date).startOf('month').format('YYYY-MM-DD');
        const endOfMonth   = moment(date).endOf('month').format('YYYY-MM-DD');
        __logger.info("Moving for date[" + date +"] ");
        //__logger.info(Object.keys(ousMap))
		var dvs2 = {dataValues:[]};
        for(var key in ousMap)
        {
            requestPost(key,startOfMonth,endOfMonth);
        }
		
		ajax.postReq(constant.DHIS_URL_BASE+"/api/dataValueSets",dvs2,constant.auth,function(error,response,body){
                if(error){
                    __logger.error("Error with datavalue post"+error)
                    return;
                }
                
                if(body.status === 'ERROR')
                {
                    __logger.info(JSON.stringify(response));
                }
                else{
                    __logger.info(body.status + " " + JSON.stringify(body.importCount));
                }


                debugger
        })
		
        function requestPost(key,startOfMonth,endOfMonth){
            var options = {
                method: 'POST',
                'rejectUnauthorized': true,
                url: constant.dvdms_url,
                headers:
                    {
                        'cache-control': 'no-cache',
                        'content-type': 'text/plain',
                        authorization: 'Basic dXBfZHZkbXM6VVBfZHZkbSQ='
                    },
                body: '{"primaryKeys": ['+key+']}' };

            request(options, function (error, response, body) {
                //if (error) throw new Error(error);
			//setTimeout(function () {
                try {                    
					
						dvdmsImporter(JSON.parse(response.body),key, startOfMonth, endOfMonth);
					
                } catch (e) {
                    __logger.info("Error in API response at store id: "+key+" Error is: "+e)
                }
				//}, 1000);
                debugger;
            });
        }
        function dvdmsImporter(response,key,sdate,edate){
            //__logger.info(" DVDMS Integration" )
            

            for(var i=0; i<= response.dataValue.length-1 ;i++) {
                var record = response.dataValue[i];
                var ouID = key;


                var ouUID = ousMap[ouID].id;
                //console.log(response.uphmis_id);
                var drug = record[0];
                if(!desMap[drug])
                {
                    //__logger.info("Data Element "+drug+" Not Found");
                    continue;
                }
                var deUID = desMap[drug].id;
                var value = record[1];
                //console.log("value: "+record[1]);

                var dataValue1 = {};
                dataValue1.period = getPeriod(sdate, edate, "Monthly");
                //console.log(dataValue.period);
                dataValue1.orgUnit = ouUID;
                dataValue1.value = value;
                dataValue1.dataElement = deUID;
                dataValue1.comment = "api data";
                dvs2.dataValues.push(dataValue1);
            }
            if (dvs2.length == 0){
                return;
            }
            //console.log(dvs2);

            

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
        ajax.getReq(constant.DHIS_URL_BASE+"/api/dataElements?fields=id,name,formName,code&paging=false&filter=dataElementGroups.code:eq:dvdms_des"
            ,constant.auth
            ,function(error,response,body){

                if (error){
                    __logger.error("De Error" + response);
                    callback(null)
                    return;
                }
                callback(JSON.parse(body));

            })
    }
    function getOUs(callback){
        ajax.getReq(constant.DHIS_URL_BASE+"/api/organisationUnits?fields=id,name,attributeValues[value,attribute[id,name,code]]&paging=false&filter=organisationUnitGroups.id:eq:JRLIvJzK4H0",constant.auth,function(error,response,body){

            if (error){
                __logger.error("OU Error" + response);
                callback(null)
                return;
            }

            callback(JSON.parse(body));

        })
    }


}