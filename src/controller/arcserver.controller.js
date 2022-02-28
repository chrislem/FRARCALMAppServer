const config = require('../../resources/config/config.json');
const excelservice = require('./excelservice')
const dbmanager = require('./dbmanager')
const fs = require("fs");
//const { execSync } = require("child_process");
const processmanager = require('./processmanager')


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

  function dateToYMD(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1; //Month from 0 to 11
    var y = date.getFullYear();
    return '' + y  + (m<=9 ? '0' + m : m) + (d <= 9 ? '0' + d : d);
  }

  
function createStaticData(socket, data, dest){
    console.log("Create StaticData");

    var staticdata = config.extractFileForStatic;
    
    staticdata.forEach(sd => {
        let stringtowrite = "StaticDataKey\tStaticDataValue\tStaticDataDescription\n";
        let res
        if(sd.refFile === undefined){
            console.log("flat file")
            res = sd.fixedValues
        }
        else{
            
            console.log("generate static data for:")
            if(sd.refFile == "portfolio"){
                
                res = excelservice.getDistinctValues(config.contract.dataPath+data.portfolio, sd.tab, sd.uniqueColumns, sd.separator)
                console.log(res);
            }
            else if(sd.refFile == "scenario"){
                res = excelservice.getDistinctValues(config.scenario.dataPath+data.scenario, sd.tab, sd.uniqueColumns, sd.separator)
                console.log(res);
            }
            else
                console.log ("createStaticData: Invalid type of ref fil")
        }

        if(res && res.length > 0){
            res.forEach(v => {
                stringtowrite = stringtowrite + v+"\t"+ v+"\t"+ v+"\n"
            } )
                
        }
        console.log(sd.outputFile)
        console.log(stringtowrite)

        fs.writeFile(dest+"/"+sd.outputFile, stringtowrite, function(err) {
            if (err) {
               throw err;
            }});   
    });

    
    console.log ("createStaticData: end");
}

//----------------------------------------------------------------------
// Exported functions

async function initEnvironment(socket, data){

    var socketID = socket.id;

    console.log("Socket ID:"+socketID);
    console.log("data:"+data);
    
    if (!fs.existsSync(config.arcserver.tempfolder)){
        return "Temporary folder does'nt exist"
    }

    const parent = config.arcserver.tempfolder+"/"+socketID;
    const dirnames  = [ "config", "data", "script"];
    
    var dir = config.arcserver.tempfolder+"/"+socketID;

    fs.mkdirSync(dir);
    fs.mkdirSync(dir + '/config');
    fs.mkdirSync(dir + '/data');
    fs.mkdirSync(dir + '/data/ALMApp');
    fs.mkdirSync(dir + '/script');

    console.log("folder created");
    
    result = { message : "Initialisation OK"}

    return result;    
}


async function createImportFile(socket, data){

    var socketID = socket.id;

    //extract portfolio file
    console.log("Portfolio file:" + data.portfolio);
    var res = excelservice.extractFilesFromExcelWithTemplate(config.arcserver.tempfolder+"/"+socketID+"/data/ALMApp", 
                config.contract.dataPath+data.portfolio, config.contract.excelTemplate);

    if(res == false)
        throw( "Extract Contract file failed");

    //extract scenario files
    console.log("Scenario file:" + data.scenario);
    var res = excelservice.extractFilesFromExcelWithTemplate(config.arcserver.tempfolder+"/"+socketID+"/data/ALMApp", 
    config.scenario.dataPath+data.scenario, config.scenario.excelTemplate);

    if(res == false)
        throw( "Extract Scenario file failed");


    createStaticData(socket, data, config.arcserver.tempfolder+"/"+socketID+"/data/ALMApp");


    result = { message : "Create import files OK"}
    return result;    
}

async function createEnvironment(socket, data, dbname, sid){
    var socketID = socket.id;
        
    var currentfolder = config.arcserver.tempfolder+"/"+socketID;

    await dbmanager.executeSQL("CREATE database "+dbname+" COLLATE latin1_General_CS_AS");

    var instancedata = fs.readFileSync(config.arcserver.serverinstancetemplate,'utf8');
                    
    console.log("Temp folder:"+currentfolder)

    instancedata =instancedata.replace("(ConfigurationPath)",config.arcserver.defaultconfiguration);
    instancedata =instancedata.replace("(DataPath)",currentfolder+"/data");
    instancedata =instancedata.replace("(DBServer)",config.databaseserver.server);
    instancedata =instancedata.replace("(DBPort)",config.databaseserver.port);
    instancedata =instancedata.replace("(DBName)",dbname);
    instancedata =instancedata.replace("(DBUser)",config.databaseserver.login);
    instancedata =instancedata.replace("(DBPassword)",config.databaseserver.password);


    console.log(instancedata)

    fs.writeFileSync(currentfolder+"/script/server.instance", instancedata);
         
    console.log('Create the repository');
    //
    cmd = config.arcserver.release ;

    //const exitCode = await processmanager.passthru(config.arcserver.release, [cmd], {}, socket);
   let exitCode = await processmanager.passthru(cmd, ["-i", currentfolder+"/script/server.instance", "--create-repository"], {}, socket);
    


     exitCode = await processmanager.passthru(cmd, 
        ["-i"
        , currentfolder+"/script/server.instance"
        , "--create-situationdate"
        , sid
        , "F"
        , "--login"
        , config.process.arcuser
        , "--password"
        , config.process.arcpassword
    ], {}, socket);
    

    result = { message : "Create environment OK"}
    return result;       

}

async function importData(socket, data, sid){

    var socketID = socket.id;
        
    var currentfolder = config.arcserver.tempfolder+"/"+socketID;

    console.log('Import Data');
    //
    cmd = config.arcserver.release ;

    var processlist = config.process.import;
    //const exitCode = await processmanager.passthru(config.arcserver.release, [cmd], {}, socket);
    for(const processname of processlist) {

        console.log("Execute process:"+processname);
        exitCode = await processmanager.passthru(cmd, 
            ["-i"
            , currentfolder+"/script/server.instance"
            , "--execute-process"
            , processname
            , "--situationdate"
            , sid+"F"
            , "--login"
            , config.process.arcuser
            , "--password"
            , config.process.arcpassword
        ], {}, socket);
    }

    result = { message : "Import Data OK"}
    return result; 
}


async function executeComputation(socket, data, sid){

    var socketID = socket.id;
        
    var currentfolder = config.arcserver.tempfolder+"/"+socketID;

    console.log('Computation process');
    //
    cmd = config.arcserver.release ;

    var processlist = config.process.computation;
    //const exitCode = await processmanager.passthru(config.arcserver.release, [cmd], {}, socket);
    for(const processname of processlist) {

        console.log("Execute process:"+processname);
        exitCode = await processmanager.passthru(cmd, 
            ["-i"
            , currentfolder+"/script/server.instance"
            , "--execute-process"
            , processname
            , "--situationdate"
            , sid+"F"
            , "--login"
            , config.process.arcuser
            , "--password"
            , config.process.arcpassword
        ], {}, socket);
    }
    result = { message : "execute Computation OK"}
    return result;    
}

async function exportResults(socket, data, sid){

    var socketID = socket.id;

    console.log("Socket ID:"+socketID);
    console.log("data:"+data);
    result = { message : "export Results OK"}
    return result;    
}

async function dropEnvironment(socket, data, dbname){

    await dbmanager.executeSQL("drop database "+dbname);

    result = { message : "drop Environment OK"}
    return result;    
}



module.exports = {
    initEnvironment ,
    createImportFile,
    createEnvironment ,
    importData ,
    executeComputation,
    exportResults ,
    dropEnvironment, 
    dateToYMD
}