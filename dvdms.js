module.exports =  dvdms;

var constant=require("./CONSTANTS");
var ajax=require("./ajax");
var moment = require("moment");
var MomentRange = require('moment-range');
moment = MomentRange.extendMoment(moment);

function dvdms(){

    var edlt = [];
    init();

    function init() {

        getEDLDetail(function (edl) {
            var edlMap = edl.data.reduce(function (map, obj) {
                map[obj.drugId] = obj.drugName;
                return map;
            }, []);

        getOUs(function (ous) {
            getDEs(function (des) {
                var ousMap1 = ous.organisationUnits.reduce(function (map, obj) {
                    if (obj.attributeValues.length > 0) {
                        var dvdmsCode = obj.attributeValues.reduce(function (dvdmsCode, attrval) {
                            if (attrval.attribute.code == "dvdmsStoreCode") {
                                return attrval.value
                            }
                            return dvdmsCode;
                        }, false);

                        if (dvdmsCode) {
                            map[dvdmsCode] = obj;
                        }
                    }
                    return map;
                }, []);

                var desMap1 = des.dataElements.reduce(function (map, obj) {
                    if (obj.attributeValues.length > 0) {
                        var dragCode = obj.attributeValues.reduce(function (dragCode, attrval) {
                            if (attrval.attribute.code == "dragCode") {
                                return attrval.value
                            }
                            return dragCode;
                        }, false);

                        if (dragCode) {
                            map[dragCode] = obj;
                            edlt.push(dragCode);
                        }
                    }
                    return map;
                }, []);
                // console.log(ousMap1);
                transferData(edlMap, ousMap1, desMap1, moment().format('YYYY-MM-DD'));
            })
        })
    })
    }
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

    function transferData(edlMap,ousMap,desMap,date){

        //var eventDate = new Date('2020-08-01');
        const startOfMonth = moment(date).startOf('month').format('YYYY-MM-DD');
        const endOfMonth   = moment(date).endOf('month').format('YYYY-MM-DD');
        __logger.info("Moving for date[" + date +"] ");

        var period = getPeriod(startOfMonth, endOfMonth, "Monthly");
        //getFaciltyType(function(fst){
            //var fs = fst.data.reduce(function(map,obj){
                //map[obj.typeId] = obj.typeName;

                getStockDetail(14,function (object){
                    dvdmsImporter(14,object, startOfMonth, endOfMonth);
                })
                //return map;
            //},[]);
        //});

        function dvdmsImporter(facType,object,sdate,edate){

            var dvs2 = {dataValues:[]};

            var dataMap =[];

            for(var i=0; i<= object.data.length-1 ;i++) {
                var record = object.data[i];
                var ouid = record.facilityId;

                if (!ousMap[ouid]){
                    __logger.info("[OUNOTMAP- "+ouid+" ]  Org Unit Not Mapped \t facility name is: "+record.facilityName);
                    continue;
                }

                var ouUID = ousMap[ouid].id;

                for(var j= 0;j<= record.itemDetails.length-1;j++)
                {
                    var itemDtl = record.itemDetails[j];
                    var deId = itemDtl.itemId;
                    if (!desMap[deId]){
                        __logger.info("Drug id not found: "+deId+" \t Drug Name is: "+edlMap[deId]);
                        continue;
                    }
                    else{
                        dataMap[deId] = edlMap[deId];
                    }

                    var dataValue = {};
                    var deUID = desMap[deId].id;
                    var value = itemDtl.quantity;

                    dataValue.period = period;
                    dataValue.orgUnit = ouUID;
                    dataValue.value = value;
                    dataValue.dataElement = deUID;
                    //dataValue.categoryOptionCombo=decocMap[decoc].newcoc;
                    dvs2.dataValues.push(dataValue);
                }
            }
            //console.log(desMap);
/*
            for(var l=0;l<=edlt.length-1;l++){
                var edlId = edlt[l];
                //console.log(edlId);
                if(!dataMap[edlId]){
                    console.log(edlId+" ## "+edlMap[edlId]);
                }
            }*/

            if (dvs2.length == 0){
                return;
            }

               ajax.postReq(constant.DHIS_URL_BASE+"/api/dataValueSets",dvs2,constant.auth,function(error,response,body){
                if(error){
                    __logger.error("Error with datavalue post"+error)
                    return;
                }
                 __logger.info(body.status + " " + JSON.stringify(body.importCount));

                debugger
            })
        }
    }


    function getDEs(callback){
        ajax.getReq(constant.DHIS_URL_BASE+"/api/dataElements?fields=id,name,formName,code,attributeValues[value,attribute[id,name,code]]&paging=false&filter=dataElementGroups.code:eq:dvdms_des"
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
        ajax.getReq(constant.DHIS_URL_BASE+"/api/organisationUnits?fields=id,name,attributeValues[value,attribute[id,name,code]]&paging=false",constant.auth,function(error,response,body){

            if (error){
                __logger.error("OU Error" + response);
                return;
            }

            callback(JSON.parse(body));

        })
    }
    function getFaciltyType(callback){

        ajax.getDVDMSReq(constant.dvdms_ft_url,function(error,response,body){
            if (error){
                __logger.error("Facility Type API" + response);
                return;
            }

            callback(JSON.parse(body));
        })
    }
    function getStockDetail(facilityType, callback){

        ajax.getDVDMSReq(constant.dvdms_stock_url+facilityType,function(error,response,body){
            if (error){
                __logger.error("Facility Type API" + response);
                return;
            }
            callback(JSON.parse(body));
        })
    }
    function getEDLDetail(callback){
        ajax.getDVDMSReq(constant.dvdms_edl_url,function(error,response,body){
            if (error){
                __logger.error("Facility Type API" + response);
                return;
            }
            callback(JSON.parse(body));
        })
    }
}