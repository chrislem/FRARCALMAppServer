const uploadFile = require("../middleware/upload");
const fs = require("fs");
const baseUrl = "http://localhost:8080/";
const config = require('../../resources/config/config.json');

const filecheck = require("../middleware/filecheck")
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

function startComputation(socket, data){
  let arcServer = new ARCServer(socket, data);

  socket.emit('notification', 'Init computation');
  res = arcServer.initComputation();
  console.log(res)
  socket.emit('notification', res);
  res = arcServer.extractImportFiles();
  socket.emit('notification', res);
  
}

  module.exports = {
    getPortfolios,
    getScenarios,
    startComputation
  };
  