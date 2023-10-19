'use strict'

var varapiv1analysisRequestsController = require('./apiv1analysisRequestsControllerService');

module.exports.addAnalysisRequest = function addAnalysisRequest(req, res, next) {
  varapiv1analysisRequestsController.addAnalysisRequest(req, res, next);
};