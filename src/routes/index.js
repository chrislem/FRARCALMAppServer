const express = require("express");
const router = express.Router();
const filecontroller = require("../controller/file.controller");
const computationcontroller = require("../controller/computation.controller");

let routes = (app) => {
  // router.post("/upload", controller.upload);
  // router.get("/files", controller.getListFiles);
  // router.get("/files/:name", controller.download);

  router.post("/scenariodata", filecontroller.upload);
  router.get("/scenariodata/files", filecontroller.getListFiles);
  router.get("/scenariodata/files/:name", filecontroller.download);

  router.post("/contractdata", filecontroller.upload);
  router.get("/contractdata/files", filecontroller.getListFiles);
  router.get("/contractdata/files/:name", filecontroller.download);

  router.get("/portfolios", computationcontroller.getPortfolios);
  router.get("/scenarios", computationcontroller.getScenarios);
  router.get("/facts", computationcontroller.getFactsList);

  app.use(router);
};

module.exports = routes;
