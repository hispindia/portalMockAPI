
//exports.DHIS_URL_BASE = "https://uphmis.in/uphmis";
//exports.DHIS_URL_BASE = "https://ln1.hispindia.org/uphmis230";
exports.DHIS_URL_BASE = "http://localhost:8080/dhis";


exports.username = "samta";
exports.password = "";
exports.dvdms_user = "up_dvdms";
exports.dvdms_pass = "UP_dvdm$";
exports.auth = "Basic " + new Buffer(exports.username + ":" + exports.password).toString("base64");
exports.dvdms_auth = "Basic " + new Buffer(exports.dvdms_user + ":" + exports.dvdms_pass).toString("base64");
exports.endpointWhitelist = [
    'organisationUnits',
    'organisationUnitGroups',
    'indicatorGroups',
    'analytics'
]
exports.bcpm = "http://nhm-bcpm.in/nhm/api/subcenter_wise.php"

exports.indi_length = 12;

exports.dvdms_url = "https://updvdms.dcservices.in/HISUtilities/services/restful/DataService/getFilterWiseDataJSON/20";

exports.hausala_urls = {
    acc : "http://hausalasajheedari.in/api/index/get_accred_facilities_district_wise",
    amp : "http://hausalasajheedari.in/api/index/get_empanelled_surgeon_district_wise",
    rei : "http://hausalasajheedari.in/api/index/get_rembersment_district_wise"
}
