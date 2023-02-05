/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-syntax */
const aux = require('./aux-functions.js');
const { Writable } = require('stream');

const { logger } = require('../configurations/');

var explainig = "init";

// ************************** BEGIN P1 VALIDITY DETECTION ************************** //
let capacity;

function setCapacity(cap) {
    capacity = cap;
}

function resetCapacity() {
    capacity = { requests: { max: 'Infinity', period: { amount: 1, unit: 'second' } } };
}

// ********************************* BEGIN CONFLICT DETECTION ********************************* //

// [P1 L2.2] There are no {consistency conflicts} (aux function)
function existsLimitsConsistencyConflictCheck(limit1, limit2, planName, path, method, metric) {
    // [P1 L2.2] There are no {consistency conflicts} between any pair of its {limits}, that is, a possible situation allowed by one limit implies the violation of the other {limit}.
    let existsInconsistency;

    if (limit1.period && limit2.period) {
        const N1 = aux.normalizedPeriod(limit1.period, metric, capacity);
        const N2 = aux.normalizedPeriod(limit2.period, metric, capacity);

        const PU1 = aux.PU(limit1, N1, metric, capacity);
        const PU2 = aux.PU(limit2, N2, metric, capacity);

        if (PU1 !== Infinity && PU2 !== Infinity) {
            // inconsistentes si el porcentaje de utilización de la "capacidad de la limitación con periodo más largo" es menor que "el porcentaje de utilización de la capacidad del periodo más corto"
            if (N1 >= N2) {
                // logger.debug(`${PU1} => ${PU2}: ${PU1 >= PU2}`);
                existsInconsistency = PU1 > PU2;
            } else if (N1 === N2 && PU1 === PU2) {
                existsInconsistency = false;
            } else {
                // logger.debug(`${PU1} < ${PU2}: ${PU1 < PU2}`);
                existsInconsistency = PU1 < PU2;
            }
        } else {
            // logger.debug(`Skipping ${PU1} or ${PU2} due to max=unlimited`);
            existsInconsistency = false;
        }
    } else {
        existsInconsistency = false;
    }

    // Merge conditions
    const condition = existsInconsistency === true;

    if (condition === true) {
        // logger.info("\x1b[31m", `Limit "${limit1.max} per ${limit1.period.amount}/${limit1.period.unit}" and "Limit ${limit2.max} per ${limit2.period.amount}/${limit2.period.unit}" are inconsistent`, "\x1b[0m");
        logger.validationWarning(`             L2.2 LIMIT CONSISTENCY CONFLICT: in ${planName}>${path}>${method}>${metric} ('${aux.printLimit(limit1)}' and '${aux.printLimit(limit2)}')`);
    } else {
        // logger.validation(`             L2.2 NO LIMIT CONSISTENCY CONFLICT (${aux.printLimit(limit1)} and ${aux.printLimit(limit2)}) OK`);
    }

    return condition;
}

// [P1 L2.2] There are no {consistency conflicts}
function existsLimitsConsistencyConflict(limits, planName, path, method, metric) {
    // [P1 L2.2] There are no {consistency conflicts} between any pair of its {limits}
    let existsConsistencyConflicts = false;
    for (let i = 0; i < limits.length; i += 1) {
        const limit1 = limits[i];
        for (let j = 0; j < limits.length; j += 1) {
            if (i !== j) {
                const limit2 = limits[j];
                existsConsistencyConflicts = existsConsistencyConflicts || existsLimitsConsistencyConflictCheck(limit1, limit2, planName, path, method, metric);
            }
        }
    }
    return existsConsistencyConflicts;
}

// [P1 L2.3] There are no {ambiguity conflict}} (aux function)
function existsAmbiguityConflictCheck(limit1, limit2, planName, path, method, metric) {
    const condition = limit1.period.unit === limit2.period.unit;

    if (condition === true) {
        // logger.info("\x1b[31m", `Limit "${limit1.max} per ${limit1.period.amount}/${limit1.period.unit}" and "Limit ${limit2.max} per ${limit2.period.amount}/${limit2.period.unit}" are inconsistent`, "\x1b[0m");
        logger.validationWarning(`             L2.3 AMBIGUITY CONFLICT: in  ${planName}>${path}>${method}>${metric} ('${aux.printLimit(limit1)}' and '${aux.printLimit(limit2)}')`);
    } else {
        // logger.validation(`             L2.3 NO AMBIGUITY CONFLICT (${aux.printLimit(limit1)} and ${aux.printLimit(limit1)})`);
    }

    return condition;
}

// [P1 L2.3] There are no {ambiguity conflict}
function existsAmbiguityConflict(limits, planName, path, method, metric) {
    // [P1 L2.3] There are no {ambiguity conflict} between any pair of its {limits}, that is, two limits use the same period.
    let existsAmbiguityConflicts = false;
    for (let i = 0; i < limits.length; i += 1) {
        const limit1 = limits[i];
        for (let j = 0; j < limits.length; j += 1) {
            if (i !== j) {
                const limit2 = limits[j];
                existsAmbiguityConflicts = existsAmbiguityConflicts || existsAmbiguityConflictCheck(limit1, limit2, planName, path, method, metric);
            }
        }
    }

    // Merge conditions
    const condition = existsAmbiguityConflicts === true;
    return condition;
}

function existsCapacityConflictCheck(limit1, planName, path, method, metric) {
    // [P1 L2.4] There is no {capacity conflict}, that is, the limitation does not surpass the associated {capacity}.
    let existsInconsistency;

    if (limit1.period && capacity[metric] && capacity[metric].max && capacity[metric].max !== 'Infinity') {
        const N1 = aux.normalizedPeriod(limit1.period, metric, capacity);

        const PU1 = aux.PU(limit1, N1, metric, capacity);
        const PU2 = aux.PU(limit1, null, metric, capacity);

        if (PU1 !== Infinity && PU2 !== Infinity) {
            existsInconsistency = PU1 > 1 || PU2 > 1;
        } else {
            existsInconsistency = true;
        }
    } else {
        existsInconsistency = false;
    }

    const condition = existsInconsistency === true;

    if (condition === true) {
        logger.validationWarning(`             L2.4 CAPACITY CONFLICT: in ${planName}>${path}>${method}>${metric} ('${aux.printLimit(limit1)}')`);
    } else {
        // logger.validation(`             L2.4 NO CAPACITY CONFLICT (${aux.printLimit(limit1)}) OK`);
    }

    return condition;
}

// [P1 L2.4] There are no {capacity conflicts}
function existsCapacityConflict(limits, planName, path, method, metric) {
    // [P1 L2.4] There is no {capacity conflict}, that is, the limitation does not surpass the associated {capacity}
    let existsCapacityConflicts = false;
    for (let i = 0; i < limits.length; i += 1) {
        const limit1 = limits[i];
        existsCapacityConflicts = existsCapacityConflicts || existsCapacityConflictCheck(limit1, planName, path, method, metric);
    }
    return existsCapacityConflicts;
}

// [P1   L3.2] There are no { consistency conflicts }
function existsPlanConsistencyConflict(plan, planName) {
    // [P1   L3.2] There are no { consistency conflicts } between any pair of its { limitations }, that is, two { limitations } over two related { metrics } (by a certain factor) can not be met at the same time.
    let existsConsistencyConflict = false;
    const existsConsistencyRelatedMetricsConflict = false;

    for (const [planLimitationsName1, planLimitations1] of Object.entries(plan)) {
        if (planLimitationsName1 === 'quotas' || planLimitationsName1 === 'rates') {
            for (const [limitationsPathName1, limitationsPath1] of Object.entries(planLimitations1)) {
                for (const [limitationsPathMethodName1, limitationsPathMethod1] of Object.entries(limitationsPath1)) {
                    for (const [limitationsPathMethodMetricName1, limitationsPathMethodMetric1] of Object.entries(limitationsPathMethod1)) {
                        for (const [limit1Name, limit1] of Object.entries(limitationsPathMethodMetric1)) {
                            for (const [planLimitationsName2, planLimitations2] of Object.entries(plan)) {
                                if (planLimitationsName2 === 'quotas' || planLimitationsName2 === 'rates') {
                                    for (const [limitationsPathName2, limitationsPath2] of Object.entries(planLimitations2)) {
                                        for (const [limitationsPathMethodName2, limitationsPathMethod2] of Object.entries(limitationsPath2)) {
                                            for (const [limitationsPathMethodMetricName2, limitationsPathMethodMetric2] of Object.entries(limitationsPathMethod2)) {
                                                for (const [limit2Name, limit2] of Object.entries(limitationsPathMethodMetric2)) {
                                                    if (planLimitationsName1 !== planLimitationsName2 && limitationsPathName1 === limitationsPathName2 && limitationsPathMethodName1 === limitationsPathMethodName2 && limitationsPathMethodMetricName1 === limitationsPathMethodMetricName2) {
                                                        const isLimitsConsistencyConflict = existsLimitsConsistencyConflictCheck(limit1, limit2, planName, limitationsPathName2, limitationsPathMethodName2, limitationsPathMethodMetricName2);
                                                        if (isLimitsConsistencyConflict === true) {
                                                            logger.validationWarning(`                L3.2 CONSISTENCY CONFLICT in >${planName}>${planLimitationsName1}>${limitationsPathName1}>${limitationsPathMethodName1}>${limitationsPathMethodMetricName1} ('${aux.printLimit(limit1)}') AND ${planName}>${planLimitationsName2}>${limitationsPathName2}>${limitationsPathMethodName2}>${limitationsPathMethodMetricName2} ('${aux.printLimit(limit2)}')`);
                                                        }
                                                        existsConsistencyConflict = existsConsistencyConflict || isLimitsConsistencyConflict;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Merge conditions
    const condition = existsConsistencyConflict === true || existsConsistencyRelatedMetricsConflict === true;

    if (condition === true) {
        // logger.validationWarning(`             L3.2 CONSISTENCY CONFLICT (${planName})`);
    } else {
        // logger.validation(`             L3.2 NO CONSISTENCY CONFLICT: (${planName}) OK`);
    }

    return condition;
}

function existsCostConsistencyConflictCheck(pricing, plan1, plan2, limitations1PathMethodMetricLimit, limitations2PathMethodMetricLimit, plan1Name, plan2Name, plan1LimitationsName, limitations1PathName, limitations1PathMethodName, limitations1PathMethodMetricName) {
    let isCostConsistencyConflict = false;

    // if (limitations1PathMethodMetricLimit.period.unit === limitations2PathMethodMetricLimit.period.unit) { // only comparable units can have cost conflict
    for (const prop1 in pricing) {
        if (Object.prototype.hasOwnProperty.call(pricing, prop1) && !Object.prototype.hasOwnProperty.call(plan1.pricing, prop1)) {
            plan1.pricing[prop1] = pricing[prop1];
        }
    }
    for (const prop2 in pricing) {
        if (Object.prototype.hasOwnProperty.call(pricing, prop2) && !Object.prototype.hasOwnProperty.call(plan2.pricing, prop2)) {
            plan2.pricing[prop2] = pricing[prop2];
        }
    }

    if (plan1.pricing.period && plan2.pricing.period) {
        const PL1 = aux.normalizedPeriod(plan1.pricing.period, null, capacity);
        const PL2 = aux.normalizedPeriod(plan2.pricing.period, null, capacity);

        const CU1 = plan1.pricing.cost / PL1;
        const CU2 = plan2.pricing.cost / PL2;

        // if PU1 > PU2 --> cost1 > cost2
        const N1 = aux.normalizedPeriod(limitations1PathMethodMetricLimit.period, null, capacity);
        const N2 = aux.normalizedPeriod(limitations2PathMethodMetricLimit.period, null, capacity);

        const PU1 = aux.PU(limitations1PathMethodMetricLimit, N1, null, capacity);
        const PU2 = aux.PU(limitations2PathMethodMetricLimit, N2, null, capacity);

        // if limit is lower-- > cost is lower-----> !(PU1 < PU2) || ((CU1) <= (CU2))
        // if limit is higher-- > cost is higher-----> !(PU1 > PU2) || ((CU1) >= (CU2))

        // isCostConsistencyConflict = (!(PU1 < PU2) || ((CU1) <= (CU2))) && (!(PU1 > PU2) || ((CU1) >= (CU2)));
        // isCostConsistencyConflict = !(!(PU1 < PU2) || ((CU1) <= (CU2))) || !(!(PU1 > PU2) || ((CU1) >= (CU2)));
        // isCostConsistencyConflict = ((PU1 < PU2) && !((CU1) <= (CU2))) || ((PU1 > PU2) && !((CU1) >= (CU2)));
        isCostConsistencyConflict = ((PU1 < PU2) && ((CU1) > (CU2))) || ((PU1 > PU2) && ((CU1) < (CU2)));

        // if (isCostConsistencyConflict === true) {
        //     logger.validationWarning(`             L4.2 COST CONSISTENCY CONFLICT in plan ${plan1Name}|${plan2Name} in >${plan1LimitationsName}>${limitations1PathName}>${limitations1PathMethodName}>${limitations1PathMethodMetricName} ('${aux.printLimit(limitations1PathMethodMetricLimit)}' > '${aux.printLimit(limitations2PathMethodMetricLimit)}' AND NOT '${plan1.pricing.cost} >= ${plan2.pricing.cost}')`);
        // }
    } else {
        logger.warning(`existsCostConsistencyConflict - Cannot compare non-period pricings (pricing should exist: global or per plan) cost in (${JSON.stringify(plan1.pricing)} and ${JSON.stringify(plan2.pricing)})`);
    }
    // }
    return isCostConsistencyConflict;
}

// [P1 L4.2] There are no {cost consistency conflicts} between any pair of its plans
function existsCostConsistencyConflict(plan1, plan2, plan1Name, plan2Name, pricing) {
    // [P1 L4.2] There are no {cost consistency conflicts} between any pair of its plans, that is, a {limitation} in one plan is less restrictive than the equivalent in another {plan} but the former {plan} is cheaper than the later.

    // let limitations1 = plan1.rates || [];
    // let quotas1 = plan1.quotas || [];
    // let limitations2 = plan1.rates || [];
    // let quotas2 = plan1.quotas || [];
    // let planLimitations1 = [...(Object.values(quotas1) || []), ...(Object.values(limitations1) || [])];
    // let planLimitations2 = [...(Object.values(quotas2) || []), ...(Object.values(limitations2) || [])];
    // let planPaths1 = [...(Object.values(planLimitations1) || [])];
    // let planPaths2 = [...(Object.values(planLimitations2) || [])];
    let existsCostConsistencyConflicts = false;
    for (const [plan1LimitationsName, plan1Limitations] of Object.entries(plan1)) {
        if (plan1LimitationsName === 'quotas' || plan1LimitationsName === 'rates') {
            for (const [plan2LimitationsName, plan2Limitations] of Object.entries(plan2)) {
                if (plan1LimitationsName === plan2LimitationsName) {
                    for (const [limitations1PathName, limitations1Path] of Object.entries(plan1Limitations)) {
                        for (const [limitations1PathMethodName, limitations1PathMethod] of Object.entries(limitations1Path)) {
                            for (const [limitations1PathMethodMetricName, limitations1PathMethodMetric] of Object.entries(limitations1PathMethod)) {
                                for (const limitations1PathMethodMetricLimit of limitations1PathMethodMetric) {
                                    let isCostConsistencyConflict1 = false; // the conflict should exist in every limit of the limitation
                                    // let conflictText = "";
                                    for (const [limitations2PathName, limitations2Path] of Object.entries(plan2Limitations)) {
                                        for (const [limitations2PathMethodName, limitations2PathMethod] of Object.entries(limitations2Path)) {
                                            for (const [limitations2PathMethodMetricName, limitations2PathMethodMetric] of Object.entries(limitations2PathMethod)) {
                                                let isCostConsistencyConflict2 = true; // the conflict should exist in every limit of the limitation
                                                for (const limitations2PathMethodMetricLimit of limitations2PathMethodMetric) {
                                                    // same (path, method, metric) AND only comparable units can have cost conflict
                                                    if (limitations1PathName === limitations2PathName && limitations1PathMethodName === limitations2PathMethodName && limitations1PathMethodMetricName === limitations2PathMethodMetricName) {
                                                        if (plan1.pricing && plan2.pricing) {
                                                            // If no cost, cost defaults to 0
                                                            plan1.pricing.cost = (plan1.pricing.cost !== null && plan1.pricing.cost !== undefined) ? plan1.pricing.cost : 0;
                                                            plan2.pricing.cost = (plan2.pricing.cost !== null && plan2.pricing.cost !== undefined) ? plan2.pricing.cost : 0;
                                                            if (!limitations1PathMethodMetricLimit.cost && !limitations2PathMethodMetricLimit.cost) {
                                                                if (!Number.isNaN(Number((plan1.pricing.cost))) && !Number.isNaN(Number(plan2.pricing.cost))) {
                                                                    if (limitations1PathMethodMetricLimit.period && limitations2PathMethodMetricLimit.period && limitations1PathMethodMetricLimit.period.unit === limitations2PathMethodMetricLimit.period.unit) {
                                                                        const existsACostConsistencyConflict = existsCostConsistencyConflictCheck(pricing, plan1, plan2, limitations1PathMethodMetricLimit, limitations2PathMethodMetricLimit, plan1Name, plan2Name, plan1LimitationsName, limitations1PathName, limitations1PathMethodName, limitations1PathMethodMetricName);
                                                                        isCostConsistencyConflict2 = isCostConsistencyConflict2 && existsACostConsistencyConflict;
                                                                        isCostConsistencyConflict1 = isCostConsistencyConflict1 || isCostConsistencyConflict2;
                                                                        // conflictText = `>${plan1LimitationsName}>${limitations1PathName}>${limitations1PathMethodName}>${limitations1PathMethodMetricName} ('${aux.printLimit(limitations1PathMethodMetricLimit)}' > '${aux.printLimit(limitations2PathMethodMetricLimit)}' AND NOT '${plan1.pricing.cost} >= ${plan2.pricing.cost}')`;
                                                                        if (isCostConsistencyConflict1 === true && isCostConsistencyConflict2 === true) {
                                                                            logger.validationWarning(`             L4.2 COST CONSISTENCY CONFLICT in plan '${plan1Name}'|'${plan2Name}' in >${plan1LimitationsName}>${limitations1PathName}>${limitations1PathMethodName}>${limitations1PathMethodMetricName} ('${aux.printLimit(limitations1PathMethodMetricLimit)}' > '${aux.printLimit(limitations2PathMethodMetricLimit)}' AND NOT '${plan1.pricing.cost} >= ${plan2.pricing.cost}')`);
                                                                        }
                                                                    } else {
                                                                        logger.debug(`existsCostConsistencyConflict - Cannot compare non-period pricings cost in (${JSON.stringify(plan1.pricing)} and ${JSON.stringify(plan2.pricing)})`);
                                                                        // continue;
                                                                    }
                                                                } else {
                                                                    logger.debug(`existsCostConsistencyConflict - Cannot compare NaN pricings cost in (${JSON.stringify(plan1.pricing)} and ${JSON.stringify(plan2.pricing)})`);
                                                                    // continue;
                                                                }
                                                            } else {
                                                                logger.debug(`existsCostConsistencyConflict - Cannot compare operationCost or overageCost pricings cost in plan '${plan1Name}'|'${plan2Name}' in >${plan1LimitationsName}>${limitations1PathName}>${limitations1PathMethodName}>${limitations1PathMethodMetricName} ('${aux.printLimit(limitations1PathMethodMetricLimit)}' > '${aux.printLimit(limitations2PathMethodMetricLimit)}' AND NOT '${plan1.pricing.cost} >= ${plan2.pricing.cost}')`);
                                                                // continue;
                                                            }
                                                        } else { // FIXME: simple cost is the only supported cost so far
                                                            // logger.warning(`existsCostConsistencyConflict - Cannot compare pricings in (${JSON.stringify(plan1.pricing)} and ${JSON.stringify(plan2.pricing)})`);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    existsCostConsistencyConflicts = existsCostConsistencyConflicts || isCostConsistencyConflict1;
                                    // if (existsCostConsistencyConflicts === true) {
                                    //     logger.validationWarning(`             L4.2 COST CONSISTENCY CONFLICT in plan ${plan1Name}|${plan2Name} in ${conflictText}`);
                                    // }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Merge conditions
    const condition = existsCostConsistencyConflicts === true;

    if (condition === true) {
        // logger.validationWarning(`             L4.2 COST CONSISTENCY CONFLICT: (${plan1} and ${plan2})`);
    } else {
        // logger.validation(`             L4.2 NO COST CONSISTENCY CONFLICT: (${plan1} and ${plan2}) OK`);
    }

    return condition;
}

function areMetricValidCheck(pricing) {
    const metricNames = Object.keys(pricing.metrics);
    let hasUndefinedMetrics = false;
    let everyMetricUsed = true;
    let areMetricValid = true;

    for (const [metricName, metric] of Object.entries(pricing.metrics)) {
        let isUsed = false;
        for (const [planName, plan] of Object.entries(pricing.plans)) {
            for (const [planLimitationsName, planLimitations] of Object.entries(plan)) {
                if (planLimitationsName === 'quotas' || planLimitationsName === 'rates') {
                    for (const [limitationsPathName, limitationsPath] of Object.entries(planLimitations)) {
                        for (const [limitationsPathMethodName, limitationsPathMethod] of Object.entries(limitationsPath)) {
                            for (const [limitationsPathMethodMetricName, limitationsPathMethodMetric] of Object.entries(limitationsPathMethod)) {
                                isUsed = isUsed || limitationsPathMethodMetricName === metricName;
                                const isUndefinedMetric = !metricNames.includes(limitationsPathMethodMetricName);
                                if (isUndefinedMetric === true) {
                                    logger.validationWarning(`  UNDEFINED METRIC ${limitationsPathMethodMetricName} in ${planName}>${limitationsPathName}>${limitationsPathMethodName}>${limitationsPathMethodMetricName} `);
                                }
                                hasUndefinedMetrics = hasUndefinedMetrics || isUndefinedMetric;
                            }
                        }
                    }
                }
            }
        }
        if (isUsed !== true) {
            logger.validationWarning(`  UNUSED METRIC '${metricName}'`);
        }

        everyMetricUsed = everyMetricUsed && isUsed;
    }

    areMetricValid = everyMetricUsed === true && hasUndefinedMetrics !== true;

    return areMetricValid;
}

// ********************************* END CONFLICT DETECTION ********************************* //

// P1   [L1   Valid limit] A {limit} is valid if:
function isValidLimit(limit, planName, path, method, metric) {
    logger.validation(`         CHECKING LIMIT VALIDITY (${aux.printLimit(limit)})...`);
    // [P1 L1.1] Its {threshold} is a natural number.
    const isNaturalNumber = limit.custom || limit.max >= 0 || limit.max === 'unlimited';
    if (isNaturalNumber !== true) {
        logger.validationWarning(`             !isNaturalNumber in  ${planName}>${path}>${method}>${metric}`);
    }

    // [P1 L1.2] It is consistent with its associated {capacity}, that is, it does not surpases the associated {capacity}.
    /*let existsLimitsConsistencyConflictCapacity = false;
    if (capacity[metric]) {
        const metricCapacity = capacity[metric];
        existsLimitsConsistencyConflictCapacity = existsLimitsConsistencyConflictCheck(limit, metricCapacity, planName, path, method, metric);
    }*/

    const condition = isNaturalNumber === true; // && existsLimitsConsistencyConflictCapacity !== true;

    if (condition !== true) {
        // logger.info("\x1b[31m", "isValidLimit", condition, "\x1b[0m");
        // logger.info(`In isValidLimit: ${condition}\n    isNaturalNumber=${isNaturalNumber} && !existsLimitsConsistencyConflictCapacity=${!existsLimitsConsistencyConflictCapacity}`);
        logger.validationWarning(`           NOK LIMIT VALIDITY in ${planName}>${path}>${method}>${metric} (${aux.printLimit(limit)}) NOK`);
        logger.validationWarning(`             isNaturalNumber=${isNaturalNumber}`);
        //logger.validationWarning(`             !existsLimitsConsistencyConflictCapacity=${existsLimitsConsistencyConflictCapacity !== true}`);
    } else {
        // logger.validation(`           LIMIT VALIDITY (${aux.printLimit(limit)}) OK`);
    }

    return condition;
}

// P1   [L2   Valid limitation] A {limitation} is valid if:
function isValidLimitation(limitation, planName, path, method, metric) {
    logger.validation(`       CHECKING LIMITATION VALIDITY (${aux.printLimitatation(limitation)})...`);

    // [P1 L2.1] All its {limits} are valid.
    let everyLimitIsValid = true;
    // for (const limit of limitation) {
    limitation.forEach((limit) => {
        const isValidLimitCheck = isValidLimit(limit, planName, path, method, metric);
        everyLimitIsValid = everyLimitIsValid && isValidLimitCheck;
    });

    // [P1 L2.2] There are no {consistency conflicts} between any pair of its {limits}, that is, a possible situation allowed by one limit implies the violation of the other {limit}.
    const existsConsistencyConflicts = existsLimitsConsistencyConflict(limitation, planName, path, method, metric);

    // [P1 L2.3] There are no {ambiguity conflict} between any pair of its {limits}, that is, two limits use the same period.
    const existsAmbiguityConflicts = existsAmbiguityConflict(limitation, planName, path, method, metric);

    // [P1 L2.4] There is no {capacity conflict}, that is, the limitation does not surpass the associated {capacity}.
    const existsCapacityConflicts = existsCapacityConflict(limitation, planName, path, method, metric);

    // Merge conditions
    const condition = everyLimitIsValid === true && existsConsistencyConflicts !== true && existsAmbiguityConflicts !== true && existsCapacityConflicts !== true;

    if (condition !== true) {
        // logger.info("\x1b[31m", "isValidLimitation", condition, "\x1b[0m");
        // logger.info(`In isValidLimitation: ${condition}\n    everyLimitIsValid=${everyLimitIsValid} && !existsConsistencyConflicts=${!existsConsistencyConflicts} && !existsAmbiguityConflicts=${!existsAmbiguityConflicts}`);
        logger.validationWarning(`         NOK LIMITATION VALIDITY in ${planName}>${path}>${method}>${metric} (${aux.printLimitatation(limitation)}) NOK`);
        logger.validationWarning(`           everyLimitIsValid=${everyLimitIsValid}`);
        logger.validationWarning(`           !existsConsistencyConflicts=${existsConsistencyConflicts !== true}`);
        logger.validationWarning(`           !existsAmbiguityConflicts=${existsAmbiguityConflicts !== true}`);
        logger.validationWarning(`           !existsCapacityConflicts=${existsCapacityConflicts !== true}`);
    } else {
        logger.validation(`         LIMITATION VALIDITY (${aux.printLimitatation(limitation)}) OK`);
    }
    return condition;
}

// P1   [L3   Valid plan] A {plan} is valid if:
function isValidPlan(plan, planName) {
    logger.validation(`     CHECKING PLAN VALIDITY (${planName})...`);

    // [P1 L3.1] All its {limitations} are valid.
    let everyLimitationIsValid = true;
    for (const [planLimitationsName, planLimitations] of Object.entries(plan)) {
        if (planLimitationsName === 'quotas' || planLimitationsName === 'rates') {
            for (const [limitationsPathName, limitationsPath] of Object.entries(planLimitations)) {
                for (const [limitationsPathMethodName, limitationsPathMethod] of Object.entries(limitationsPath)) {
                    for (const [limitationsPathMethodMetricName, limitationsPathMethodMetric] of Object.entries(limitationsPathMethod)) {
                        everyLimitationIsValid = everyLimitationIsValid && isValidLimitation(limitationsPathMethodMetric, planName, limitationsPathName, limitationsPathMethodName, limitationsPathMethodMetricName);
                    }
                }
            }
        }
    }

    let existsRelatedMetricConsistencyConflict = false;
    for (const [planLimitationsName1, planLimitations1] of Object.entries(plan)) {
        if (planLimitationsName1 === 'quotas' || planLimitationsName1 === 'rates') {
            for (const [limitationsPathName1, limitationsPath1] of Object.entries(planLimitations1)) {
                for (const [limitationsPathMethodName1, limitationsPathMethod1] of Object.entries(limitationsPath1)) {
                    for (const [limitationsPathMethodMetricName1, limitationsPathMethodMetric1] of Object.entries(limitationsPathMethod1)) {
                        for (const limitationsPathMethodMetricLimits1 of limitationsPathMethodMetric1) {
                            if (limitationsPathMethodMetricLimits1.relatedMetrics) {
                                for (const [limitationsPathMethodRelMetricName1, limitationsPathMethodRelMetric1] of Object.entries(limitationsPathMethodMetricLimits1.relatedMetrics)) {
                                    const currentMetricName = limitationsPathMethodMetricName1;
                                    const currentMetricLimit = limitationsPathMethodMetricLimits1;
                                    const currentRelatedMetric = limitationsPathMethodRelMetricName1;
                                    const currentFactor = limitationsPathMethodRelMetric1.factor;
                                    for (const [planLimitationsName2, planLimitations2] of Object.entries(plan)) {
                                        if (planLimitationsName2 === 'quotas' || planLimitationsName2 === 'rates') {
                                            for (const [limitationsPathName2, limitationsPath2] of Object.entries(planLimitations2)) {
                                                for (const [limitationsPathMethodName2, limitationsPathMethod2] of Object.entries(limitationsPath2)) {
                                                    for (const [limitationsPathMethodMetricName2, limitationsPathMethodMetric2] of Object.entries(limitationsPathMethod2)) {
                                                        if (limitationsPathMethodMetricName2 === currentRelatedMetric) { // if it's the related metric, the value must be in the bounds of the factor
                                                            for (const limitationsPathMethodMetricLimits2 of limitationsPathMethodMetric2) {
                                                                const relatedMetricName = limitationsPathMethodMetricName2;
                                                                const relatedMetricLimit = limitationsPathMethodMetricLimits2;
                                                                const isRelatedMetricConsistencyConflict = currentMetricLimit.max > relatedMetricLimit.max / currentFactor;
                                                                if (isRelatedMetricConsistencyConflict) {
                                                                    logger.validationWarning(`       LX.X RELATED METRICS CONSISTENCY CONFLICT in plan '${planName}' in >${planLimitationsName1}>${limitationsPathName1}>${limitationsPathMethodName1}>${currentMetricName} is limited to '${relatedMetricLimit.max / currentFactor}' by related metric '${relatedMetricName}' but the actual value is '${currentMetricLimit.max}'`);
                                                                }
                                                                existsRelatedMetricConsistencyConflict = existsRelatedMetricConsistencyConflict || isRelatedMetricConsistencyConflict;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // [P1   L3.2] There are no { consistency conflicts } between any pair of its { limitations }, that is, two { limitations } over two related { metrics } (by a certain factor) can not be met at the same time.
    const existsConsistencyConflicts = existsPlanConsistencyConflict(plan, planName);

    // Merge conditions
    const condition = everyLimitationIsValid === true && existsConsistencyConflicts !== true && existsRelatedMetricConsistencyConflict !== true;

    if (condition !== true) {
        // logger.info("\x1b[31m", "isValidPlan", condition, "\x1b[0m");
        // logger.info(`In isValidPlan: ${condition}\n    everyLimitationIsValid=${everyLimitationIsValid} && !existsConsistencyConflicts=${!existsConsistencyConflicts}`);
        logger.validationWarning(`       NOK PLAN VALIDITY in (${planName}) NOK`);
        logger.validationWarning(`         everyLimitationIsValid=${everyLimitationIsValid}`);
        logger.validationWarning(`         !existsConsistencyConflicts=${existsConsistencyConflicts !== true}`);
        logger.validationWarning(`         !existsRelatedMetricConsistencyConflict=${existsRelatedMetricConsistencyConflict !== true}`);
    } else {
        logger.validation(`       PLAN VALIDITY (${planName}) OK`);
    }

    return condition;
}

// P1   [L4   Valid pricing] A {pricing} is valid if:
function isValidPricing(globbedPricing, configuration) {

    for (const prop in configuration) {
        if (!Object.prototype.hasOwnProperty.call(globbedPricing, prop)) {
            globbedPricing[prop] = configuration[prop];
        }
    }
    logger.validation('   CHECKING PRICING VALIDITY...');

    if (globbedPricing.capacity) {
        resetCapacity();
        logger.validationWarning(`   UPDATING CAPACITY FROM '${JSON.stringify(capacity)}'...`);
        setCapacity(globbedPricing.capacity);
        logger.validationWarning(`     UPDATED TO '${JSON.stringify(capacity)}'`);
    } else {
        resetCapacity();
        logger.validationWarning(`   USING DEFAULT CAPACITY '${JSON.stringify(capacity)}'`);
    }

    const pricing = aux.deglobPricing(globbedPricing);

    // [P1 L4.1] All its {plans} are valid.
    let everyPlanIsValid = true;

    for (const planName in pricing.plans) {
        if (pricing.plans[planName]) {
            everyPlanIsValid = everyPlanIsValid && isValidPlan(pricing.plans[planName], planName);
            // if (everyPlanIsValid !== true) break;
        }
    }

    // [P1 L4.2] There are no {cost consistency conflicts} between any pair of its plans, that is, a {limitation} in one plan is less restrictive than the equivalent in another {plan} but the former {plan} is cheaper than the later.
    let existsCostConsistencyConflicts = false;
    for (const [plan1Name, plan1] of Object.entries(pricing.plans)) {
        for (const [plan2Name, plan2] of Object.entries(pricing.plans)) {
            if (plan1Name !== plan2Name) {
                existsCostConsistencyConflicts = existsCostConsistencyConflicts || existsCostConsistencyConflict(plan1, plan2, plan1Name, plan2Name, pricing.pricing);
            }
        }
    }

    const areMetricValid = areMetricValidCheck(pricing);

    // Merge conditions
    const condition = everyPlanIsValid === true && existsCostConsistencyConflicts !== true && areMetricValid === true;

    if (condition !== true) {
        // logger.info("\x1b[31m", "isValidPricing", condition, "\x1b[0m");
        // logger.info(`In isValidPricing: ${condition}\n    everyPlanIsValid=${everyPlanIsValid} && !existsCostConsistencyConflicts=${!existsCostConsistencyConflicts}`);
        logger.validationWarning('     NOK PRICING VALIDITY NOK');
        logger.validationWarning(`       everyPlanIsValid=${everyPlanIsValid}`);
        logger.validationWarning(`       !existsCostConsistencyConflicts=${existsCostConsistencyConflicts !== true}`);
        logger.validationWarning(`       areMetricValid=${areMetricValid === true}`);
    } else {
        logger.validation('     PRICING VALIDITY OK');
    }

    return condition;
}

// ************************** END P1 VALIDITY DETECTION ************************** //

module.exports = {
    validity: (plan, planName)  =>{
        logger.clearLog();
        return isValidPricing(plan, planName);
    },
    getExplaining: () => {
        return logger.getLog();
    }
};
