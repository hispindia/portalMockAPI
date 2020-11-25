module.exports =  bcpm;

var constant=require("./CONSTANTS");
var ajax=require("./ajax");
var moment = require("moment");
var MomentRange = require('moment-range');
moment = MomentRange.extendMoment(moment);

function bcpm(){

    init();
    
    function init() {
        getOUs(function(ous){
            getDEs(function(des){
                getCatOptioncombos(function(cat){
                var ousMap1 = ous.organisationUnits.reduce(function(map,obj){
                    if(obj.code != null){
                        var bcpmHMISCode = obj.code+"";
                        map[bcpmHMISCode] = obj;

                    }
                    return map;
                },[]);
                var valueMap = {};
                var desMap1 = des.dataElements.reduce(function(map,obj){
                    if(obj.attributeValues.length > 0) {
                        var bcpmdeCodeMap =obj.attributeValues.reduce(function (bcpmdeCode, attrval) {
                            if (attrval.attribute.name == "bcpm_decombo") {
                                var attJson = JSON.parse(attrval.value);

                                for(var k = 0 ;k<attJson.data.length; k++ )
                                {
                                    var id = attJson.data[k].id;
                                    map[id] = obj;
                                    var value = attJson.data[k].value;
                                    valueMap[id] = value;
                                }
                            }
                            return bcpmdeCode;
                        }, []);
                    }
                    return map;
                },[]);
                    //console.log(desMap1);
                var catComb = cat.categoryOptionCombos.reduce(function(map,obj){
                    if(obj.attributeValues.length > 0) {
                        var bcpmcatCode = obj.attributeValues.reduce(function (bcpmcatCode, attrval) {
                            if (attrval.attribute.name == "bcpm_decombo") {
                                return attrval.value;
                            }
                            return bcpmcatCode;
                        }, false);
                    }
                    if(bcpmcatCode){
                        map[bcpmcatCode] = obj;
                    }
                    if(obj.id === 'Ti9FJqkSK6J')
                    {
                        map['default'] = obj;
                    }
                    return map;
                },[]);
                //console.log(desMap1);
                transferData(ousMap1,desMap1,catComb,valueMap,moment().format('YYYY-MM-DD'));
                })
            })
        })
    }
    function getFinancialYear(date) {
        var financial_year = "";
        var today = new Date(date);
        if ((today.getMonth() + 1) <= 3) {
            financial_year = (today.getFullYear() - 1) + "-" + today.getFullYear()
        } else {
            financial_year = today.getFullYear() + "-" + (today.getFullYear() + 1)
        }
        return financial_year+"";
    }

    function transferData(ousMap,desMap,catComb,valueMap,date){

        var eventDate = new Date('2020-06-01');
        var eventDate2 = new Date(date);

        if (eventDate2.getDate() <= '15') {
             eventDate2.setMonth(eventDate2.getMonth() - 1);
        }

        console.log('current month previous month: '+eventDate2);

        const startOfMonth = moment(eventDate2).startOf('month').format('YYYY-MM-DD');
        const endOfMonth   = moment(eventDate2).endOf('month').format('YYYY-MM-DD');
        __logger.info("Moving for date[" + eventDate2 +"] ");

        console.log();
        var fyear = getFinancialYear(eventDate2);

        //console.log(eventDate.getMonth());

       for(var indi=1; indi<=constant.indi_length; indi++)
        {
            //debugger
                ajax.postReqWithoutAuth(
                    constant.bcpm,
                    {
                        "uid": "uphmis",
                        "pswrd": "uphmis@123",
                        "fy": "2020-21",
                        "indicator": indi,
                        "mnth": (eventDate2.getMonth()+1)
                    }, function (error, response, body) {
                        if (error) {
                            __logger.error(error);
                            return;
                        }
                        __logger.info(response.statusCode);
                        bcpmImporter(JSON.parse(response.body), startOfMonth, endOfMonth);
                        //debugger
                    });

        }

        function bcpmImporter(response){
            __logger.info(response.status+" BCPM " + response.fy + "-" + response.mnth)
            var dvs1 = {dataValues:[]};

            for(var i=0; i<= response.data.length-1 ;i++) {
                var record = response.data[i];
                var ouID = record.code_hmis;
                //console.log(ousMap[ouID])
                if (!ousMap[ouID]) {
                     __logger.info("district name:"+record.district_name+" block name:"+record.block_name+" SC name: "+record.sub_center_name+" hmis code" + ouID + " orgUnit not Mapped");
                     continue;
                 }
                 var ouUID = ousMap[ouID].id;
                 //console.log(response.uphmis_id);
                 var deUID = desMap[response.uphmis_id].id;
                 var catcombUid = '';
                 if(catComb[response.uphmis_id]){
                     catcombUid = catComb[response.uphmis_id].id;
                 }
                 else{
                     catcombUid = catComb['default'].id;
                 }

                var value = null;

                  if(record.hasOwnProperty(valueMap[response.uphmis_id]))
                    {
                        if(record[valueMap[response.uphmis_id]] != null) {
							if(record[valueMap[response.uphmis_id]] == 'yes')
							{
								value = "true";
							}
							else if(record[valueMap[response.uphmis_id]] == 'no'){
								value = "false";
							}
							else{
                            value = record[valueMap[response.uphmis_id]];
							}
                        }
						
                    }
                if(ouID == "406161"){
                    console.log(response.uphmis_id +" ouid: "+ ouID +" valueMap[response.uphmis_id] "+valueMap[response.uphmis_id]+" value is: "+value)
                }

                //console.log(value);
                var dataValue = {};
                dataValue.period = getPeriod(startOfMonth, endOfMonth, "Monthly");
                dataValue.orgUnit = ouUID;
                dataValue.value = value;
                dataValue.dataElement = deUID;
                dataValue.comment = 'api data'
                dataValue.categoryOptionCombo = catcombUid;
                dvs1.dataValues.push(dataValue);
                //console.log(dvs1)
            }
            if (dvs1.length == 0){
                return;
            }
            //console.log("dv length: "+dvs1.length);

            ajax.postReq(constant.DHIS_URL_BASE+"/api/dataValueSets",dvs1,constant.auth,function(error,response,body){
                if(error){
                    __logger.error("Error with datavalue post"+error)
                    return;
                }

                __logger.info(" " + JSON.stringify(body.importCount));

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
        ajax.getReq(constant.DHIS_URL_BASE+"/api/dataElements?fields=id,name,code,attributeValues[value,attribute[id,name,code]]&paging=false&filter=dataElementGroups.code:eq:bcpm_des"
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
        ajax.getReq(constant.DHIS_URL_BASE+"/api/organisationUnits?fields=id,name,code&paging=false&filter=organisationUnitGroups.id:eq:JRLIvJzK4H0",constant.auth,function(error,response,body){

            if (error){
                __logger.error("OU Error" + response);
                callback(null)
                return;
            }

            callback(JSON.parse(body));

        })
    }
    function getCatOptioncombos(callback){
        ajax.getReq(constant.DHIS_URL_BASE+"/api/categoryOptionCombos?fields=id,name,attributeValues[value,attribute[id,name,code]]&paging=false"
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

}
