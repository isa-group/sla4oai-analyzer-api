const config = require('../configurations');
const aux = require('./aux-functions.js');

const { logger } = config;

// ************************** BEGIN P2 EFFECTIVE LIMITATION ************************** //

function effectiveLimitationCalc(limits, period) {
    const projectionsBurst = [];
    const projectionsUniform = [];
    limits.forEach((limitElement) => {
        const N = limitElement.max;
        const M = aux.normalizedPeriod(limitElement.period);
        const Mp = aux.normalizedPeriod(period);
        projectionsBurst.push(aux.projectBurst(N, M, Mp));
        projectionsUniform.push(aux.projectUniform(N, M, Mp));
    });

    const res = {
        burst: Math.min(...projectionsBurst),
        uniform: Math.max(...projectionsUniform),
    };

    return res;
}

function effectiveLimitation(pricing, period, modeParam) {
    if (modeParam && (modeParam !== 'burst' && modeParam !== 'uniform' && modeParam !== 'all')) {
        logger.error(`Mode ${modeParam} unrecognized`);
        return -1;
    }
    const mode = (modeParam !== null && modeParam !== undefined) ? modeParam : 'uniform';
    logger.debug(`   USING MODE '${mode}'`);

    const limitationsPerPlan = new Map();
    const effectiveLimitationsPerPlan = new Map();
    Object.keys(pricing.plans).forEach((planName) => {
        const plan = pricing.plans[planName];

        limitationsPerPlan.set(planName, []);
        const limitationsPerMetric = new Map();
        // const effectiveLimitationsPerMetric = new Map();
        Object.entries(plan).forEach(([planLimitationsName, planLimitations]) => {
            if (planLimitationsName === 'quotas' || planLimitationsName === 'rates') {
                Object.values(planLimitations).forEach((limitationsPath) => {
                    Object.values(limitationsPath).forEach((limitationsPathMethod) => {
                        Object.entries(limitationsPathMethod).forEach(([limitationsPathMethodMetricName, limitationsPathMethodMetric]) => {
                            if (!limitationsPerMetric.get(limitationsPathMethodMetricName) || !limitationsPerMetric.get(limitationsPathMethodMetricName).length > 0) {
                                limitationsPerMetric.set(limitationsPathMethodMetricName, []);
                            }
                            limitationsPathMethodMetric.forEach((limitationsPathMethodMetricLimit) => {
                                if (limitationsPathMethodMetricLimit.period) {
                                    limitationsPerMetric.get(limitationsPathMethodMetricName).push(limitationsPathMethodMetricLimit);
                                }
                            });
                        });
                    });
                });
            }
        });
        limitationsPerPlan.set(planName, limitationsPerMetric);
    });

    // logger.validationWarning(`   CALCULATING EFFECTIVE LIMITATIONS FOR PERIOD '${period.unit}'...`);
    limitationsPerPlan.forEach((limitationsPlan, planName) => {
        effectiveLimitationsPerPlan.set(planName, []);
        // logger.validationWarning(`     IN PLAN '${planName}'...`);
        const effectiveLimitationsPerMetric = new Map();
        limitationsPlan.forEach((limits, metricName) => {
            const res = effectiveLimitationCalc(limits, period);

            logger.validation(`       IN PLAN '${planName}' FOR METRIC '${metricName}' (burst): ${res.burst}`);
            logger.validation(`       IN PLAN '${planName}' FOR METRIC '${metricName}' (uniform): ${res.uniform}`);

            if (mode === 'all') {
                effectiveLimitationsPerMetric.set(metricName, res);
            } else {
                effectiveLimitationsPerMetric.set(metricName, res[mode]);
            }
        });
        effectiveLimitationsPerPlan.set(planName, effectiveLimitationsPerMetric);
    });

    return effectiveLimitationsPerPlan;
}

// ************************** END P2 EFFECTIVE LIMITATION ************************** //

module.exports = {
    effectiveLimitation,
};
