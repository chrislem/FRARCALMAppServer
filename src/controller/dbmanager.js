const config = require('../../resources/config/config.json');

var Connection = require('tedious').Connection;
var Request = require('tedious').Request
var TYPES = require('tedious').TYPES;

var configDB =  
{
    server: config.databaseserver.server,
    options: {},
    authentication: {
      type: "default",
      options: {  
        userName: config.databaseserver.login,
        password: config.databaseserver.password,
      }
    }
  };


const executeSQL = (sqlstatement) => new Promise((resolve, reject) => {
    console.log("sqlstatement on request"+sqlstatement);
    var result = "";    

    const connection = new Connection(configDB);

    const request = new Request(sqlstatement, (err) => {
        if (err) {
            console.log("Error on request");
            throw(err);
        } else {
            console.log("resolve result");
            if ((result == "" || result == null || result == "null")) result = "[]";  
                resolve(result);
        }       
    });    

    connection.on('connect', err => {
        if (err) {
            console.log("Error on connect");
            reject(err);
        }
        else {
            console.log("Execute sql");
            connection.execSql(request);
        }
    });   

    connection.connect();    
});

exports.executeSQL = executeSQL;