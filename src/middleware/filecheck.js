var XLSX = require('xlsx');
const config = require('../../resources/config/config.json');

function checkFileWithTemplate(filePath, templatePath) {
    
    var res = {};

    //Read template 
    var wTemplate = XLSX.readFile(config.resourcePath+templatePath);
    var sheet_name_listTemplate = wTemplate.SheetNames;

    /*sheet_name_listTemplate.forEach((sheetname) => {
        console.log(sheetname)
      });*/

    //Read file 
    var wFile = XLSX.readFile(filePath);
    var sheet_name_listFile = wFile.SheetNames;
    res.result = "";
    /*sheet_name_listFile.forEach((sheetname) => {
        console.log(sheetname)
        res.result = res.result + "-" +sheetname;
      });*/

      res.status = true;

    return res;

}

function checkContract (fileName, message){
    return checkFileWithTemplate(fileName, config.contract.excelTemplate, message);
}

function checkScenario (fileName, message){
    return checkFileWithTemplate(fileName, config.scenario.excelTemplate, message);
}

module.exports = {
    checkContract,
    checkScenario
  };
  