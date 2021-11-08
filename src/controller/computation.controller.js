const uploadFile = require("../middleware/upload");
const fs = require("fs");
const baseUrl = "http://localhost:8080/";
const config = require('../../resources/config/config.json');
const { exec } = require('child_process');
const arcserver = require("./arcserver.controller");
const { executeSQL } = require("./dbmanager");


var extension = (".xlsm", ".xls", ".xlsx")

const getPortfolios = (req, res) => {

  fs.readdir(config.contract.dataPath, function (err, files) {
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }

    let fileInfos = [];

    files.forEach((file) => {


      if (file.endsWith(extension))
        fileInfos.push({
          name: file,
          details: file + "(xxxxxx)"
        });
    });

    console.log(fileInfos);
    res.status(200).send(fileInfos);
  });
};

const getScenarios = (req, res) => {

  fs.readdir(config.scenario.dataPath, function (err, files) {
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }

    let fileInfos = [];

    files.forEach((file) => {
      if (file.endsWith(extension))
        fileInfos.push({
          name: file,
          details: file + "(xxxxxx)"
        });
    });

    res.status(200).send(fileInfos);
  });
};

const getFactsList = (req, res) => {
  console.log(config.frontConfiguration.factsList)
  
  let factsInfo = [];

  config.frontConfiguration.factsList.forEach((fact) => {
    
    factsInfo.push({
        name: fact,
        completed: false
      });
  });

  res.status(200).send(factsInfo);
};


async function startComputation(socket, data) {

  var dbname = (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2);
  try {

    console.log(data);
    
    /*
    {
  sid: '2021-11-17T23:00:00.000Z',
  portfolio: 'contracts.xlsx',
  scenario: 'scenario.xlsx',
  bucketStep: '12',
  bucketMaturity: '1m',
  facts: [
    'Outstanding Principal',
    'Average Outstanding Principal',
    'O.P. known rate'
  ]
  }*/
    /*var res = await arcserver.initEnvironment(socket, data);
    socket.emit('notification', res.message);

    res = await arcserver.createImportFile(socket, data);
    socket.emit('notification', res.message);

    res = await arcserver.createEnvironment(socket, data, dbname);
    socket.emit('notification', res.message);

    res = await arcserver.importData(socket, data);
    socket.emit('notification', res.message);

    res = await arcserver.executeComputation(socket, data);
    socket.emit('notification', res.message);

    res = await arcserver.exportResults(socket, data);
    socket.emit('notification', res.message);

    res = await arcserver.dropEnvironment(socket, data, dbname);
    socket.emit('notification', res.message);*/

  }
  catch (err) {
    console.log(err);
    socket.emit('error', err.message)
  }


}

module.exports = {
  getPortfolios,
  getScenarios,
  getFactsList,
  startComputation
};
