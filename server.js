var constant=require("./CONSTANTS");
var CronJob = require('cron').CronJob;
var moment = require("moment");
var express = require('express');
var forwarder = require('./forwarder');
forwarder = new forwarder();

// Initialise
var app = express();
/**
 * Set up CORS Settings
 */ app.use(function (req, res, next) {

     // Website you wish to allow to connect
     res.setHeader('Access-Control-Allow-Origin', '*');

     // Request methods you wish to allow
     res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

     // Request headers you wish to allow
     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

     // Pass to next layer of middleware
     next();
 });/**
     */
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));


/** Set Up Logging
 */ var winston = require('winston');
global.__logger = new (winston.Logger)({
    level : 'silly',
    transports: [
        new (winston.transports.Console)({
            colorize: true,
            timestamp: true
        }),
        new (winston.transports.File)({
            filename: './logs/server.log',
            timestamp: true
        })
    ]
});
/**
 */

var server = app.listen(8000, function () {
    var host = server.address().address
    var port = server.address().port

    __logger.info("Server listening at http://%s:%s", host, port);
    
})


// Open API for sending email
app.get('/portalAPI/*', function(req, res){
    var name = req.query.name
    var tei =req.query.tei

    var ou = req.query.ou;

    forwarder.pass(req,function(result){
    
        res.writeHead(200, {'Content-Type': 'json'});
        res.end(result);    
    });

    
})


// Open API for sending email for daily report
app.get('/sendDailyReports', function(req, res){
    var date = req.query.date

    if (!date){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('No date passed(YYYY-MM-DD)');
        return;
    }
    var reportSender = require('./sendReports');            
    reportSender.init(moment(date, "MM-DD-YYYY").format("YYYY-MM-DD"));

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('ok');
    
})


__logger.info("Starting service");

