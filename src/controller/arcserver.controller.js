const config = require('../../resources/config/config.json');
const excelservice = require('./excelservice')
const fs = require("fs");
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

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

class ARCServer
{
    constructor(socket, computationData)
   { this.socket = socket;
    this.computationData = computationData;
    }
    
    initComputation(){
        //Create folder for data
        console.log("Socket ID"+this.socket.id);
        console.log("data"+this.computationData);
        
        if (!fs.existsSync(config.arcserver.tempfolder)){
            return "Temporary folder does'nt exist"
        }
        
        // var sessionFolder = config.arcserver.tempfolder+"/"+this.socket.id;
        // try {
        //     const parent = config.arcserver.tempfolder;
        //     const dirnames  = [this.socket.id, this.socket.id+"/config", this.socket.id+"/data", this.socket.id+"/script"];
        
        //     await Promise.all(
        //       dirnames.map(dirname => fsPromises.mkdir(`${parent}/${dirname}`).catch(console.error))
        //     );
        
        //     // All dirs are created here or errors reported.
        //   } catch (err) {
        //     console.error(err);
        //   }
        const parent = config.arcserver.tempfolder+"/"+this.socket.id;
        const dirnames  = [ "config", "data", "script"];
        
        var dir = config.arcserver.tempfolder+"/"+this.socket.id;

        fs.mkdirSync(dir);
        fs.mkdirSync(dir + '/config');
        fs.mkdirSync(dir + '/data');
        fs.mkdirSync(dir + '/script');

        console.log("folder created");
        
        return "Initialisation OK";
    }

     extractImportFiles()
    {
        //extract portfolio file
        console.log("Portfolio file:" + this.computationData.portfolio);
        var res = excelservice.extractFilesFromExcelWithTemplate(config.arcserver.tempfolder+"/"+this.socket.id+"/data", config.contract.dataPath+this.computationData.portfolio, config.contract.excelTemplate);

        if(res == false)
            return "Extract Contract file failed";

        //extract scenario files
        console.log("Scenario file:" + this.computationData.scenario);
        var res = excelservice.extractFilesFromExcelWithTemplate(config.arcserver.tempfolder+"/"+this.socket.id+"/data", config.scenario.dataPath+this.computationData.scenario, config.scenario.excelTemplate);

        if(res == false)
            return "Extract Contract file failed";

        return "Extract files OK";
    }

    async createEnvironment(){
        //Connect to database
        var connection = new Connection(configDB);

        var dbname = (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2);
        // Setup event handler when the connection is established. 
        connection.on('connect', function(err) {
          if(err) {
            console.log('Error: ', err)
          }
          else {
            console.log("db name:"+dbname);
            var request = new Request("CREATE database "+dbname+" COLLATE latin1_General_CS_AS", function(err, rowCount) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(rowCount + ' rows');
                }
              });
          
              request.on('done', function (rowCount, more, rows) { 
                  console.log("DB created");
              });
              connection.execSql(request);            
          }         
        });
      
        // Initialize the connection.
        connection.connect(); 

        // create server.instance
        fs.readFile(config.arcserver.serverinstancetemplate, 'utf8' , (err, data) => {
            if (err) {
              console.error(err)
              return
            }
            console.log(data)
          })



        return dbname;
    }

     importScenarioData(){

    }

     importContractData(){

    }

     executeComputation(){

    }

     exportReport(){

    }

    endofcomputation(){
        //drop database

        //drop folder
    }
}

module.exports = {
    ARCServer: ARCServer
}