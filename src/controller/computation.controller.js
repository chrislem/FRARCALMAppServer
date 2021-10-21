const uploadFile = require("../middleware/upload");
const fs = require("fs");
const baseUrl = "http://localhost:8080/";
const config = require('../../resources/config/config.json');
const { exec } = require('child_process');
let ARCServer = require('./arcserver.controller').ARCServer;

const getPortfolios = (req, res) => {

    fs.readdir(config.contract.dataPath, function (err, files) {
      if (err) {
        res.status(500).send({
          message: "Unable to scan files!",
        });
      }
  
      let fileInfos = [];
  
      files.forEach((file) => {
  
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
  
        fileInfos.push({
          name: file,
          details: file + "(xxxxxx)"
        });
      });
  
      res.status(200).send(fileInfos);
    });
  };

  function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

async function startComputation(socket, data){
  let arcServer = new ARCServer(socket, data);

  await socket.emit('notification', 'Init computation');
  res = arcServer.initComputation();
  console.log(res)
  await socket.emit('notification', res);
  res = arcServer.extractImportFiles();
  await socket.emit('notification', res);
  res = await arcServer.createEnvironment();
  await socket.emit('notification', "Environment created: "+res);
  
}

  module.exports = {
    getPortfolios,
    getScenarios,
    startComputation
  };
  