const p0 = require('./P0-syntax.js');
const p1 = require('./P1-validity.js');
const p2 = require('./P2-effectiveLimitation.js');
const p3 = require('./P3-compliance.js');

module.exports = {
    parse: p0.checkSyntax,
    validity: p1.validity,
    getValidityExplainig: p1.getExplaining,
    effectiveLimitation: p2.effectiveLimitation,
    compliance: p3.compliance,
};
