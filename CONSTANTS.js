


exports.DHIS_URL_BASE = "http:///";


exports.username = "";
exports.password = "";
exports.auth = "Basic " + new Buffer(exports.username + ":" + exports.password).toString("base64");


exports.endpointWhitelist = [
    'organisationUnits',
    'organisationUnitGroups',
    'indicatorGroups',
    'analytics'

]