


exports.DHIS_URL_BASE = "https://uphmis.in/uphmis/";


exports.username = "dashboard";
exports.password = "Dashboard@123";
exports.auth = "Basic " + new Buffer(exports.username + ":" + exports.password).toString("base64");


exports.endpointWhitelist = [
    'organisationUnits',
    'organisationUnitGroups',
    'indicatorGroups',
    'analytics'

]
