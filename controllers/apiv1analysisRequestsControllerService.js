'use strict'

const request = require('request');
const yaml = require('js-yaml');
var analyzer = require("./analyzer/operations");

function validate(req,res){

  var params = req.analysisRequest.value;
  console.log("Validity analysis over: <"+params.pricingURL+">");

    var result = {
      valid : false,
      explaining : ""
    }

/* TESTING ENDPOINTS

  var urlE = "https://gist.githubusercontent.com/pafmon/f12d1752f37b595369608aa46dfb5fb8/raw/341c58e33fd1ccc9385276aceb35bcd541ecaae9/error.yaml";
  var urlV = "https://gist.githubusercontent.com/pafmon/f12d1752f37b595369608aa46dfb5fb8/raw/341c58e33fd1ccc9385276aceb35bcd541ecaae9/valid.yaml";
  var urlI = "https://gist.githubusercontent.com/pafmon/f12d1752f37b595369608aa46dfb5fb8/raw/341c58e33fd1ccc9385276aceb35bcd541ecaae9/invalid.yaml";
*/
  var pricing; 

  request(params.pricingURL,{}, (err, resCode, body) => {    
    if (err) { 
        console.log(err);
        res.send(err); 
    }

    try {
    
      pricing = yaml.safeLoad(body);
    
      result.valid = analyzer.validity(pricing,{});
      result.explaining = analyzer.getValidityExplainig();
      console.log("   Validity Result -> "+result.valid);

      res.send(result);

    } catch (e) {

      res.send(e);

    }

  });


}

module.exports.addAnalysisRequest = function addAnalysisRequest(req, res, next) {

  var params = req.analysisRequest.value;
 

  switch(params.operation){

    case "validity": 
      validate(req,res);
      break;
    
    default: 
      res.send({
        message: 'OPERATION NOT SUPPORTED'
      });
      break;
  }


};