For API Integration

Required standard format:

{
    "error": [],
    "errormsg": "",
    "successmsg": "",
    "status": "1",
    "data": {
        "date_from": "2014-04-01(PLEASE ENTER HERE date format(YYYY-MM-DD))",
        "date_to": "2020-02-01",
        "data": {
            "1(PLEASE ENTER HERE Organisation 'UUID')": {
                "EMAPNS(PLEASE ENTER HERE  Data Element 'UUID')": "0",
                "EMCMAP": "3",
                "EMSCAF": "0",
                "EMSASB": "17",
                "EMUNDP": "0",
                "EMONHD": "1",
                "EMPHYV": "0",
                "EMVASB": "0"
            }
        }
    }
}

Some configuration in dhis2 like DataElementGroup, DataElementGroup Code , Attribute.

run command on server

npm install // to install node js files in app

then 

node server.js // to run server.js file for UPHMIS Dashboard.
node api.js --portal=bcpm // to run api.js file for BCPM API
node api.js --portal=hausala // to run api.js file for Hausala

//Scheduling

node api.js // cron job run automatically 1st of every month at 12 noon for hausala api and 2nd of every month at 12 noon for bcpm





