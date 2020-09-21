const path = require('path');
const fs = require('fs');
const jsyaml = require('js-yaml');
const ZSchema = require('z-schema');
const config = require('../configurations');

const { logger } = config;

const MODEL_PATH = './../../model/SLA4OAI.schema.json';

const syntax = new ZSchema({
    ignoreUnresolvableReferences: true,
    ignoreUnknownFormats: false,
    forceItems: true,
    noEmptyStrings: true,
    noEmptyArrays: true,
});

// ************************** BEGIN P0 SYNTAX ERROR DETECTION ************************** //

function checkSyntax(sla4oaiObject) {
    try {
        const schemaPath = path.join(__dirname, MODEL_PATH);
        const sla4oaiSchema = jsyaml.safeLoad(fs.readFileSync(schemaPath, 'utf8'));
        syntax.validate(sla4oaiObject, sla4oaiSchema);
        return syntax.getLastErrors();
    } catch (err) {
        logger.error(`Error reading file ${MODEL_PATH}: ${err}`);
        return null;
    }
}

// ************************** END P0 SYNTAX ERROR DETECTION ************************** //

module.exports = {
    checkSyntax,
};
