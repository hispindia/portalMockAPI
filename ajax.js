
var request = require('request');

exports.postReq = function(url,data,auth,callback) {
    request({
        url: url,
        method: "POST",
        json: true,   // <--Very important!!!
        body: data,
        headers: {
            "Authorization": auth,
            "Content-Type": "application/json",
        }
    }, function (error, response, body) {
        callback(error,response,body);
    });
}

exports.putReq = function(url,data,auth,callback) {
    request({
        url: url,
        method: "PUT",
        json: true,   // <--Very important!!!
        body: data,
        headers: {
            "Authorization": auth,
            "Content-Type": "application/json",
        }
    }, function (error, response, body) {
        callback(error,response,body);
    });
}

exports.getReq = function(url,auth,callback) {
    
    request({
        url: url,
        method: "GET",
        headers: {
            "Authorization": auth
        }
    }, function (error, response, body) {
	
        callback(error,response,body);

    });
}

exports.getReqWithoutAuth = function(url,callback){
    request({
        url: url,
        method: "GET"
    }, function (error, response, body){
        callback(error,response,body);
    });

}

exports.postReqWithoutAuth = function(url,pbody,callback){
    request({
        url: url,
        formData: pbody,
        method: "POST"
    }, function (error, response, body){
        callback(error,response,body);
    });
}



exports.odkRequest = function(path,callback){

    var constant = require("./CONSTANTS");

  var digestRequest = require('request-digest')(constant.ODK_USERNAME, constant.ODK_PASSWORD);
        digestRequest.request({
            host: constant.ODKURL_HOST,
            path: path,
            port: constant.ODKURL_PORT,
            method: 'GET',
            headers: {
                'Custom-Header': 'OneValue',
                'Other-Custom-Header': 'OtherValue'
            }
        }, function (error, response, body) {
            callback(error, response, body)
        });


}
