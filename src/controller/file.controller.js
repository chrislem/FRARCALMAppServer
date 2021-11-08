const uploadFile = require("../middleware/upload");
const fs = require("fs");
const baseUrl = "http://localhost:8080/";
const config = require('../../resources/config/config.json');
const excelservice = require('./excelservice')


const upload = async (req, res) => {

  if(req.url.includes("contractdata"))
    req.destinationPath = config.contract.dataPath;
  else if(req.url.includes("scenariodata"))
    req.destinationPath = config.scenario.dataPath;
  else 
    return res.status(500).send({
      message: "Invalid upload path",
    });

  try {
    await uploadFile(req, res);

    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }
    
    
    //var result = filecheck.checkContract(config.contract.dataPath+req.file.originalname);

    //console.log(result);
    result = {status: true}

    if (result.status == true)
      res.status(200).send({
        message: "Uploaded the file successfully: " + req.file.originalname + "(" +result.result+")",
      });
    else
    {

      res.status(500).send({
        message: "Could not upload file:"+ message.error,
      });
    }

  } catch (err) {
    console.log(err);

    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 2MB!",
      });
    }

    res.status(500).send({
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
    });
  }
};

const getListFiles = (req, res) => {
  if(req.url.includes("contractdata")){
    directoryPath = config.contract.dataPath;
    path = "contractdata/files/"
  }
    else if(req.url.includes("scenariodata")){
    directoryPath = config.scenario.dataPath;
    path = "scenariodata/files/"
  }
  else 
    return res.status(500).send({
      message: "Invalid upload path",
    });

    console.log(directoryPath);

  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }

    let fileInfos = [];

    files.forEach((file) => {

      fileInfos.push({
        name: file,
        url: baseUrl +path + file,
      });
    });

    res.status(200).send(fileInfos);
  });
};

const download = (req, res) => {
  const fileName = req.params.name;
  if(req.url.includes("contractdata"))
    directoryPath = config.contract.dataPath;
  else if(req.url.includes("scenariodata"))
    directoryPath = config.scenario.dataPath;
  else 
    return res.status(500).send({
      message: "Invalid upload path",
    });

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};

module.exports = {
  upload,
  getListFiles,
  download,
};
