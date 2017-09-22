


exports.DHIS_URL_BASE = "http://112.133.207.124/nieodk/";


exports.username = "admin";
exports.password = "Hisp@1234";
exports.auth = "Basic " + new Buffer(exports.username + ":" + exports.password).toString("base64");


exports.endpointWhitelist = [
    'organisationUnits',
    'organisationUnitGroups',
    'indicatorGroups',
    'analytics'

]