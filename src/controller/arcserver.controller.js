const config = require('../../resources/config/config.json');
const fs = require("fs");
//const {promisify} = require('util');
//const mkdir = promisify(fs.mkdir);


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
        fs.mkdir(dir, function(err) {
           if (err) console.error(err);
           fs.mkdir(dir + '/config', function(err) {
              if (err) console.error(err);
              fs.mkdir(dir + '/data', function(err) {
                 if (err) console.error(err);
                 fs.mkdir(dir + '/script', function(err) {
                    if (err) console.error(err);
                 });
              });
           });
        });


        return "Initialisation OK";
    }

     extractImportFiles()
    {
        //extract portfolio file
        console.log("Portfolio file:" + this.computationData.portfolio);
        //extract scenario files
        console.log("Scenario file:" + this.computationData.scenario);

        return "Extract files OK";
    }

     createEnvironment(){

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