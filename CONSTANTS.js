exports.DHIS_URL_BASE = "https://uphmis.in/uphmis";

exports.username = "";
exports.password = "";
exports.dvdms_user = "";
exports.dvdms_pass = "";

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

exports.dvdms_edl_url = "http://uatdwhup.dcservices.in/eAushadi_UP/rest/uphmis/edl/list";
exports.dvdms_ft_url = "http://uatdwhup.dcservices.in/eAushadi_UP/rest/uphmis/facilityType/list";
exports.dvdms_stock_url = "http://uatdwhup.dcservices.in/eAushadi_UP/rest/uphmis/stock/facilityType/"

exports.hausala_urls = {
    acc : "http://hausalasajheedari.in/api/index/get_accred_facilities_district_wise",
    amp : "http://hausalasajheedari.in/api/index/get_empanelled_surgeon_district_wise",
    rei : "http://hausalasajheedari.in/api/index/get_rembersment_district_wise"
}
