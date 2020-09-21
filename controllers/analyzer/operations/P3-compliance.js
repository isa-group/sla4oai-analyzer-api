const config = require('../configurations');
const p2 = require('./P2-effectiveLimitation.js');

const { logger } = config;

// ************************** BEGIN P3 COMPLIANCE WITH USER NEEDS ************************** //

function complianceUserNeeds(pricing, userNeeds) {
    // var everyUserNeedIsSatisfied = true;
    const compliance = {};
    userNeeds.forEach((userNeed) => {
        // var existsCompliantPlan = false;
        Object.keys(userNeed).forEach((userNeedMetric) => {
            const effectiveLimitations = p2.effectiveLimitation(pricing, userNeed[userNeedMetric].period, 'uniform');
            effectiveLimitations.forEach((limitationsPlan, planName) => {
                compliance[planName] = false;
                limitationsPlan.forEach((limit, metricName) => {
                    if (metricName === userNeedMetric) {
                        const isUserNeedSatisfiedCheck = userNeed[userNeedMetric].max <= limit;
                        compliance[planName] = compliance[planName] || isUserNeedSatisfiedCheck;
                        if (isUserNeedSatisfiedCheck === true) {
                            logger.validation(`      NEED '${userNeed[userNeedMetric].max} ${metricName} per ${userNeed[userNeedMetric].period.amount} ${userNeed[userNeedMetric].period.unit}' IS SATISFIED BY '${limit[0]} ${metricName} per ${userNeed[userNeedMetric].period.amount} ${userNeed[userNeedMetric].period.unit}' IN PLAN '${planName}'`);
                        } else {
                            logger.validationWarning(`      NEED '${userNeed[userNeedMetric].max} ${metricName} per ${userNeed[userNeedMetric].period.amount} ${userNeed[userNeedMetric].period.unit}' IS NOT SATISFIED BY '${limit[0]} ${metricName} per ${userNeed[userNeedMetric].period.amount} ${userNeed[userNeedMetric].period.unit}' IN PLAN '${planName}'`);
                        }
                    }
                });
            });
        });
    });

    let everyUserNeedIsSatisfied = false;
    Object.entries(compliance).forEach(([planName, isCompliant]) => {
        // for (const [planName, isCompliant] of Object.entries(compliance)) {
        everyUserNeedIsSatisfied = everyUserNeedIsSatisfied || isCompliant;
        if (isCompliant === true) {
            logger.validationWarning(`    PLAN '${planName}' SATISFIY EVERY USER NEED`);
        } else {
            logger.validationWarning(`    PLAN '${planName}' DO NOT SATISFY EVERY USER NEED`);
        }
    });
    return everyUserNeedIsSatisfied;
}

// ************************** END P3 COMPLIANCE WITH USER NEEDS ************************** //

module.exports = {
    compliance: complianceUserNeeds,
};
