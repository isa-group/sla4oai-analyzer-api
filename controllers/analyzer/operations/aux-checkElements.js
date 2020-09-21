/* eslint-disable guard-for-in */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-syntax */
const config = require('../configurations');

const { logger } = config;

function checkProperty(obj, prop, nameParam) {
    const name = (nameParam !== null && nameParam !== undefined) ? nameParam : prop;
    const hasOwnProperty = Object.prototype.hasOwnProperty.call(obj, prop);
    if (hasOwnProperty === true) {
        logger.validationWarning(`'${name}' YES`);
    } else {
        logger.validationWarning(`'${name}' NO`);
    }
    return hasOwnProperty;
}

function listProperties(pricing) {
    // logger.validationWarning("-- BEGIN VERBOSE LIST OF PROPERTIES --");
    // context: Context
    // infrastructure: Infrastructure
    // pricing?: Pricing
    // metrics: Metrics
    // plans?: Plans
    // quotas?: Quotas
    // rates?: Rates
    // guarantees?: Guarantees
    // configuration?: Configuration
    // availability?: string
    if (checkProperty(pricing, 'context', 'root/context')) {
        // id: string
        // sla: string
        // api: string
        // type: "plans" | "instance"
        // provider?: string
        // consumer?: string
        // validity?: Validity
        checkProperty(pricing.context, 'id', 'root/context/id');
        checkProperty(pricing.context, 'sla', 'root/context/sla');
        checkProperty(pricing.context, 'api', 'root/context/api');
        checkProperty(pricing.context, 'type', 'root/context/type');
        checkProperty(pricing.context, 'provider', 'root/context/provider');
        checkProperty(pricing.context, 'consumer', 'root/context/consumer');
        if (checkProperty(pricing.context, 'validity', 'root/context/validity')) {
            // effectiveDate: string
            // expirationDate ?: string
            checkProperty(pricing.context.validity, 'effectiveDate', 'root/context/validity/effectiveDate');
            checkProperty(pricing.context.validity, 'expirationDate', 'root/context/validity/expirationDate');
        }
    }
    if (checkProperty(pricing, 'infrastructure', 'root/infrastructure')) {
        // supervisor: string
        // monitor: string
        // [x: string]: string
        checkProperty(pricing.infrastructure, 'supervisor', 'root/infrastructure/supervisor');
        checkProperty(pricing.infrastructure, 'monitor', 'root/infrastructure/monitor');
    }
    if (checkProperty(pricing, 'pricing', 'root/pricing')) {
        // cost?: number | Cost | "custom"
        // currency?: string
        // billing?: "onepay" | "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
        // period?: Period
        if (checkProperty(pricing.pricing, 'cost', 'root/pricing/cost')) {
            // operation?: OperationCost
            // overage?: OverageCost
            // logger.validationWarning("-- HAS ${pricing.pricing.cost} COST");
            if (checkProperty(pricing.pricing.cost, 'operation', 'root/pricing/cost/operation')) {
                // volume: number
                // cost: number
                checkProperty(pricing.pricing.cost.operation, 'volume', 'root/pricing/cost/operation/volume');
                checkProperty(pricing.pricing.cost.operation, 'cost', 'root/pricing/cost/operation/cost');
            }
            if (checkProperty(pricing.pricing.cost, 'overage', 'root/pricing/cost/overage')) {
                // excess: number
                // cost: number
                checkProperty(pricing.pricing.cost.overage, 'excess', 'root/pricing/cost/overage/excess');
                checkProperty(pricing.pricing.cost.overage, 'cost', 'root/pricing/cost/overage/cost');
            }
        }
        checkProperty(pricing.pricing, 'currency', 'root/pricing/currency');
        checkProperty(pricing.pricing, 'billing', 'root/pricing/billing');
        if (checkProperty(pricing.pricing, 'period', 'root/pricing/period')) {
            // amount: number
            // unit: "millisecond" | "second" | "minute" | "hour" | "day" | "week" | "month" | "year" | "decade" | "century" | "forever"
            checkProperty(pricing.pricing.period, 'amount', 'root/pricing/period/amount');
            checkProperty(pricing.pricing.period, 'unit', 'root/pricing/period/unit');
        }
    }
    if (checkProperty(pricing, 'metrics', 'root/metrics')) {
        // logger.validationWarning("-- HAS ${Object.keys(pricing.metrics).length} METRICS");
        for (const [metricName, metric] of Object.entries(pricing.metrics)) {
            // type?: "integer" | "number" | "string" | "boolean"
            // format?: "int32" | "int64" | "float" | "double" | "string" | "byte" | "binary" | "date" | "date-time"
            // description?: string
            // unit?: string
            // resolution?: "check" | "consumption"
            // relatedMetrics?: Metric[]
            // logger.validationWarning("-- BEGIN metric");
            checkProperty(pricing.metrics[metricName], 'type', 'root/metrics/metric/type');
            checkProperty(pricing.metrics[metricName], 'format', 'root/metrics/metric/format');
            checkProperty(pricing.metrics[metricName], 'description', 'root/metrics/metric/description');
            checkProperty(pricing.metrics[metricName], 'unit', 'root/metrics/metric/unit');
            checkProperty(pricing.metrics[metricName], 'resolution', 'root/metrics/metric/resolution');
            checkProperty(pricing.metrics[metricName], 'relatedMetrics', 'root/metrics/metric/relatedMetrics');
            // logger.validationWarning("-- END metric");
        }
    }
    if (checkProperty(pricing, 'plans', 'root/plans')) {
        // [planName: string]: Plan
        // logger.validationWarning("-- HAS ${Object.keys(pricing.plans).length} PLANS");
        for (const [planName, plan] of Object.entries(pricing.plans)) {
            // configuration?: Configuration
            // availability?: string
            // pricing?: Pricing
            // quotas?: Quotas
            // rates?: Rates
            // guarantees?: Guarantees
            // logger.validationWarning("-- BEGIN plan");
            if (checkProperty(pricing.plans[planName], 'configuration', 'root/plans/plan/configuration')) {
                // [name: string]: string
                // logger.validationWarning("-- HAS ${Object.keys(pricing.configuration).length} CONFIGURATIONS");
            }
            checkProperty(pricing.plans[planName], 'availability', 'root/plans/plan/availability');
            if (checkProperty(pricing.plans[planName], 'pricing', 'root/plans/plan/pricing')) {
                // cost?: number | Cost | "custom"
                // currency?: string
                // billing?: "onepay" | "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
                // period?: Period
                if (checkProperty(pricing.plans[planName].pricing, 'cost', 'root/plans/plan/pricing/cost')) {
                    // operation?: OperationCost
                    // overage?: OverageCost
                    // logger.validationWarning("-- HAS ${pricing.plans[planName].pricing} COST");
                    if (checkProperty(pricing.plans[planName].pricing, 'operation', 'root/plans/plan/pricing/cost/operation')) {
                        // volume: number
                        // cost: number
                        checkProperty(pricing.plans[planName].pricing.operation, 'volume', 'root/plans/plan/pricing/cost/operation/volume');
                        checkProperty(pricing.plans[planName].pricing.operation, 'cost', 'root/plans/plan/pricing/cost/operation/cost');
                    }
                    if (checkProperty(pricing.plans[planName].pricing, 'overage', 'root/plans/plan/pricing/cost/overage')) {
                        // excess: number
                        // cost: number
                        checkProperty(pricing.plans[planName].pricing.overage, 'excess', 'root/plans/plan/pricing/cost/overage/excess');
                        checkProperty(pricing.plans[planName].pricing.overage, 'cost', 'root/plans/plan/pricing/cost/overage/cost');
                    }
                }
                checkProperty(pricing.plans[planName].pricing, 'currency', 'root/plans/plan/pricing/currency');
                checkProperty(pricing.plans[planName].pricing, 'billing', 'root/plans/plan/pricing/billing');
                if (checkProperty(pricing.plans[planName].pricing, 'period', 'root/plans/plan/pricing/period')) {
                    // amount: number
                    // unit: "millisecond" | "second" | "minute" | "hour" | "day" | "week" | "month" | "year" | "decade" | "century" | "forever"
                    checkProperty(pricing.plans[planName].pricing.period, 'amount', 'root/plans/plan/pricing/period/amount');
                    checkProperty(pricing.plans[planName].pricing.period, 'unit', 'root/plans/plan/pricing/period/unit');
                }
            }
            if (checkProperty(pricing.plans[planName], 'quotas', 'root/plans/plan/quotas')) {
                // [pathName: string]: Path
                // logger.validationWarning("-- HAS ${Object.keys(pricing.plans[planName].quotas).length} QUOTA PATHS");
                for (const [pathName, path] of Object.entries(pricing.plans[planName].quotas)) {
                    // logger.validationWarning("-- BEGIN path");
                    // [methodName: string]: Operation
                    // logger.validationWarning("-- HAS ${Object.keys(pricing.plans[planName].quotas[pathName]).length} QUOTA METHODS");
                    for (const [methodName, method] of Object.entries(pricing.plans[planName].quotas[pathName])) {
                        // logger.validationWarning("-- BEGIN method");
                        // [metricName: string]: Limit[]
                        // logger.validationWarning("-- HAS ${Object.keys(pricing.plans[planName].quotas[pathName][methodName]).length} QUOTA METRICS");
                        for (const [metricName, limits] of Object.entries(pricing.plans[planName].quotas[pathName][methodName])) {
                            // logger.validationWarning("-- BEGIN metric");
                            // [metricName: string]: Limit[]
                            // logger.validationWarning("-- HAS ${pricing.plans[planName].quotas[pathName][methodName][metricName].length} QUOTA LIMITS");
                            for (const i in pricing.plans[planName].quotas[pathName][methodName][metricName]) {
                                // logger.validationWarning("-- BEGIN 0");
                                // max: number | "unlimited"
                                // period?: Period
                                // scope?: string
                                // cost?: number | Cost
                                checkProperty(pricing.plans[planName].quotas[pathName][methodName][metricName][i], 'max', 'root/plans/plan/quotas/path/method/metric/0/max');
                                if (checkProperty(pricing.plans[planName].quotas[pathName][methodName][metricName][i], 'period', 'root/plans/plan/quotas/path/method/metric/0/period')) {
                                    // amount: number
                                    // unit: "millisecond" | "second" | "minute" | "hour" | "day" | "week" | "month" | "year" | "decade" | "century" | "forever"
                                    checkProperty(pricing.plans[planName].quotas[pathName][methodName][metricName][i].period, 'amount', 'root/plans/plan/quotas/path/method/metric/0/period/amount');
                                    checkProperty(pricing.plans[planName].quotas[pathName][methodName][metricName][i].period, 'unit', 'root/plans/plan/quotas/path/method/metric/0/period/unit');
                                }
                                checkProperty(pricing.plans[planName].quotas[pathName][methodName][metricName][i], 'scope', 'root/plans/plan/quotas/path/method/metric/0/scope');
                                if (checkProperty(pricing.plans[planName].quotas[pathName][methodName][metricName][i], 'cost', 'root/plans/plan/quotas/path/method/metric/0/cost')) {
                                    // operation ?: OperationCost
                                    // overage?: OverageCost
                                    // logger.validationWarning("-- HAS ${pricing.plans[planName].quotas[pathName][methodName][metricName][i].cost} COST");
                                    if (checkProperty(pricing.plans[planName].quotas[pathName][methodName][metricName][i].cost, 'operation', 'root/plans/plan/quotas/path/method/metric/0/cost/operation')) {
                                        // volume: number
                                        // cost: number
                                        checkProperty(pricing.plans[planName].quotas[pathName][methodName][metricName][i].cost.operation, 'volume', 'root/plans/plan/quotas/path/method/metric/0/cost/operation/volume');
                                        checkProperty(pricing.plans[planName].quotas[pathName][methodName][metricName][i].cost.operation, 'cost', 'root/plans/plan/quotas/path/method/metric/0/cost/operation/cost');
                                    }
                                    if (checkProperty(pricing.plans[planName].quotas[pathName][methodName][metricName][i].cost, 'overage', 'root/plans/plan/quotas/path/method/metric/0/cost/overage')) {
                                        // excess: number
                                        // cost: number
                                        checkProperty(pricing.plans[planName].quotas[pathName][methodName][metricName][i].cost.overage, 'excess', 'root/plans/plan/quotas/path/method/metric/0/cost/overage/excess');
                                        checkProperty(pricing.plans[planName].quotas[pathName][methodName][metricName][i].cost.overage, 'cost', 'root/plans/plan/quotas/path/method/metric/0/cost/overage/cost');
                                    }
                                }
                                // logger.validationWarning("-- END 0");
                            }
                            // logger.validationWarning("-- END metric");
                        }
                        // logger.validationWarning("-- END method");
                    }
                    // logger.validationWarning("-- END path");
                }
            }
            if (checkProperty(pricing.plans[planName], 'rates', 'root/plans/plan/rates')) {
                // [pathName: string]: Path
                // logger.validationWarning("-- HAS ${Object.keys(pricing.plans[planName].rates).length} RATE PATHS");
                for (const [pathName, path] of Object.entries(pricing.plans[planName].rates)) {
                    // logger.validationWarning("-- BEGIN path");
                    // [methodName: string]: Operation
                    // logger.validationWarning("-- HAS ${Object.keys(pricing.plans[planName].rates[pathName]).length} RATE METHODS");
                    for (const [methodName, method] of Object.entries(pricing.plans[planName].rates[pathName])) {
                        // logger.validationWarning("-- BEGIN method");
                        // [metricName: string]: Limit[]
                        // logger.validationWarning("-- HAS ${Object.keys(pricing.plans[planName].rates[pathName][methodName]).length} RATE METRICS");
                        for (const [metricName, limits] of Object.entries(pricing.plans[planName].rates[pathName][methodName])) {
                            // logger.validationWarning("-- BEGIN metric");
                            // [metricName: string]: Limit[]
                            // logger.validationWarning("-- HAS ${pricing.plans[planName].rates[pathName][methodName][metricName].length} RATE LIMITS");
                            for (const i in pricing.plans[planName].rates[pathName][methodName][metricName]) {
                                // logger.validationWarning("-- BEGIN 0");
                                // max: number | "unlimited"
                                // period?: Period
                                // scope?: string
                                // cost?: number | Cost
                                checkProperty(pricing.plans[planName].rates[pathName][methodName][metricName][i], 'max', 'root/plans/plan/rates/path/method/metric/0/max');
                                if (checkProperty(pricing.plans[planName].rates[pathName][methodName][metricName][i], 'period', 'root/plans/plan/rates/path/method/metric/0/period')) {
                                    // amount: number
                                    // unit: "millisecond" | "second" | "minute" | "hour" | "day" | "week" | "month" | "year" | "decade" | "century" | "forever"
                                    checkProperty(pricing.plans[planName].rates[pathName][methodName][metricName][i].period, 'amount', 'root/plans/plan/rates/path/method/metric/0/period/amount');
                                    checkProperty(pricing.plans[planName].rates[pathName][methodName][metricName][i].period, 'unit', 'root/plans/plan/rates/path/method/metric/0/period/unit');
                                }
                                checkProperty(pricing.plans[planName].rates[pathName][methodName][metricName][i], 'scope', 'root/plans/plan/rates/path/method/metric/0/scope');
                                if (checkProperty(pricing.plans[planName].rates[pathName][methodName][metricName][i], 'cost', 'root/plans/plan/rates/path/method/metric/0/cost')) {
                                    // operation ?: OperationCost
                                    // overage?: OverageCost
                                    // logger.validationWarning("-- HAS ${pricing.plans[planName].rates[pathName][methodName][metricName][i].cost} COST");
                                    if (checkProperty(pricing.plans[planName].rates[pathName][methodName][metricName][i].cost, 'operation', 'root/plans/plan/rates/path/method/metric/0/cost/operation')) {
                                        // volume: number
                                        // cost: number
                                        checkProperty(pricing.plans[planName].rates[pathName][methodName][metricName][i].cost.operation, 'volume', 'root/plans/plan/rates/path/method/metric/0/cost/operation/volume');
                                        checkProperty(pricing.plans[planName].rates[pathName][methodName][metricName][i].cost.operation, 'cost', 'root/plans/plan/rates/path/method/metric/0/cost/operation/cost');
                                    }
                                    if (checkProperty(pricing.plans[planName].rates[pathName][methodName][metricName][i].cost, 'overage', 'root/plans/plan/rates/path/method/metric/0/cost/overage')) {
                                        // excess: number
                                        // cost: number
                                        checkProperty(pricing.plans[planName].rates[pathName][methodName][metricName][i].cost.overage, 'excess', 'root/plans/plan/rates/path/method/metric/0/cost/overage/excess');
                                        checkProperty(pricing.plans[planName].rates[pathName][methodName][metricName][i].cost.overage, 'cost', 'root/plans/plan/rates/path/method/metric/0/cost/overage/cost');
                                    }
                                }
                                // logger.validationWarning("-- END 0");
                            }
                            // logger.validationWarning("-- END metric");
                        }
                        // logger.validationWarning("-- END method");
                    }
                    // logger.validationWarning("-- END path");
                }
            }
            if (checkProperty(pricing.plans[planName], 'guarantees', 'root/plans/plan/guarantees')) {
                // [pathName: string]: Guarantee
                // logger.validationWarning("-- HAS ${Object.keys(pricing.plans[planName].guarantees).length} GUARANTEES");
                for (const [guaranteeName, guarantee] of Object.entries(pricing.plans[planName].guarantees)) {
                    // [methodName: string]: GuaranteeObjective[]
                    // logger.validationWarning("-- BEGIN guarantee");
                    for (const i in pricing.plans[planName].guarantees[guaranteeName]) {
                        // objective: string
                        // period ?: Period
                        // window ?: "dynamic" | "static"
                        // scope ?: string
                        // logger.validationWarning("-- BEGIN 0");
                        checkProperty(pricing.plans[planName].guarantees[guaranteeName], 'objective', 'root/plans/plan/guarantees/guarantee/0/objective');
                        if (checkProperty(pricing.plans[planName].guarantees[guaranteeName], 'period', 'root/plans/plan/guarantees/guarantee/0/period')) {
                            // amount: number
                            // unit: "millisecond" | "second" | "minute" | "hour" | "day" | "week" | "month" | "year" | "decade" | "century" | "forever"
                            checkProperty(pricing.plans[planName].guarantees[guaranteeName].period, 'amount', 'root/plans/plan/guarantees/guarantee/0/period/amount');
                            checkProperty(pricing.plans[planName].guarantees[guaranteeName].period, 'unit', 'root/plans/plan/guarantees/guarantee/0/period/unit');
                        }
                        checkProperty(pricing.plans[planName].guarantees[guaranteeName], 'window', 'root/plans/plan/guarantees/guarantee/0/window');
                        checkProperty(pricing.plans[planName].guarantees[guaranteeName], 'scope', 'root/plans/plan/guarantees/guarantee/0/scope');
                        // logger.validationWarning("-- END 0");
                    }
                    // logger.validationWarning("-- END guarantee");
                }
            }
            // logger.validationWarning("-- END plan");
        }
        if (checkProperty(pricing, 'quotas', 'root/quotas')) {
            // [pathName: string]: Path
            // logger.validationWarning("-- HAS ${Object.keys(pricing.quotas).length} QUOTA PATHS");
            for (const [pathName, path] of Object.entries(pricing.quotas)) {
                // logger.validationWarning("-- BEGIN path");
                // [methodName: string]: Operation
                // logger.validationWarning("-- HAS ${Object.keys(pricing.quotas[pathName]).length} QUOTA METHODS");
                for (const [methodName, method] of Object.entries(pricing.quotas[pathName])) {
                    // logger.validationWarning("-- BEGIN method");
                    // [metricName: string]: Limit[]
                    // logger.validationWarning("-- HAS ${Object.keys(pricing.quotas[pathName][methodName]).length} QUOTA METRICS");
                    for (const [metricName, limits] of Object.entries(pricing.quotas[pathName][methodName])) {
                        // logger.validationWarning("-- BEGIN metric");
                        // [metricName: string]: Limit[]
                        // logger.validationWarning("-- HAS ${pricing.quotas[pathName][methodName][metricName].length} QUOTA LIMITS");
                        for (const i in pricing.quotas[pathName][methodName][metricName]) {
                            // logger.validationWarning("-- BEGIN 0");
                            // max: number | "unlimited"
                            // period?: Period
                            // scope?: string
                            // cost?: number | Cost
                            checkProperty(pricing.quotas[pathName][methodName][metricName][i], 'max', 'root/quotas/path/method/metric/0/max');
                            if (checkProperty(pricing.quotas[pathName][methodName][metricName][i], 'period', 'root/quotas/path/method/metric/0/period')) {
                                // amount: number
                                // unit: "millisecond" | "second" | "minute" | "hour" | "day" | "week" | "month" | "year" | "decade" | "century" | "forever"
                                checkProperty(pricing.quotas[pathName][methodName][metricName][i].period, 'amount', 'root/quotas/path/method/metric/0/period/amount');
                                checkProperty(pricing.quotas[pathName][methodName][metricName][i].period, 'unit', 'root/quotas/path/method/metric/0/period/unit');
                            }
                            checkProperty(pricing.quotas[pathName][methodName][metricName][i], 'scope', 'root/quotas/path/method/metric/0/scope');
                            if (checkProperty(pricing.quotas[pathName][methodName][metricName][i], 'cost', 'root/quotas/path/method/metric/0/cost')) {
                                // operation ?: OperationCost
                                // overage?: OverageCost
                                // logger.validationWarning("-- HAS ${pricing.quotas[pathName][methodName][metricName][i].cost} COST");
                                if (checkProperty(pricing.quotas[pathName][methodName][metricName][i].cost, 'operation', 'root/quotas/path/method/metric/0/cost/operation')) {
                                    // volume: number
                                    // cost: number
                                    checkProperty(pricing.quotas[pathName][methodName][metricName][i].cost.operation, 'volume', 'root/quotas/path/method/metric/0/cost/operation/volume');
                                    checkProperty(pricing.quotas[pathName][methodName][metricName][i].cost.operation, 'cost', 'root/quotas/path/method/metric/0/cost/operation/cost');
                                }
                                if (checkProperty(pricing.quotas[pathName][methodName][metricName][i].cost, 'overage', 'root/quotas/path/method/metric/0/cost/overage')) {
                                    // excess: number
                                    // cost: number
                                    checkProperty(pricing.quotas[pathName][methodName][metricName][i].cost.overage, 'excess', 'root/quotas/path/method/metric/0/cost/overage/excess');
                                    checkProperty(pricing.quotas[pathName][methodName][metricName][i].cost.overage, 'cost', 'root/quotas/path/method/metric/0/cost/overage/cost');
                                }
                            }
                            // logger.validationWarning("-- END 0");
                        }
                        // logger.validationWarning("-- END metric");
                    }
                    // logger.validationWarning("-- END method");
                }
                // logger.validationWarning("-- END path");
            }
        }
    }
    if (checkProperty(pricing, 'rates', 'root/rates')) {
        // [pathName: string]: Path
        // logger.validationWarning("-- HAS ${Object.keys(pricing.rates).length} RATE PATHS");
        for (const [pathName, path] of Object.entries(pricing.rates)) {
            // logger.validationWarning("-- BEGIN path");
            // [methodName: string]: Operation
            // logger.validationWarning("-- HAS ${Object.keys(pricing.rates[pathName]).length} RATE METHODS");
            for (const [methodName, method] of Object.entries(pricing.rates[pathName])) {
                // logger.validationWarning("-- BEGIN method");
                // [metricName: string]: Limit[]
                // logger.validationWarning("-- HAS ${Object.keys(pricing.rates[pathName][methodName]).length} RATE METRICS");
                for (const [metricName, limits] of Object.entries(pricing.rates[pathName][methodName])) {
                    // logger.validationWarning("-- BEGIN metric");
                    // [metricName: string]: Limit[]
                    // logger.validationWarning("-- HAS ${pricing.rates[pathName][methodName][metricName].length} RATE LIMITS");
                    for (const i in pricing.rates[pathName][methodName][metricName]) {
                        // logger.validationWarning("-- BEGIN 0");
                        // max: number | "unlimited"
                        // period?: Period
                        // scope?: string
                        // cost?: number | Cost
                        checkProperty(pricing.rates[pathName][methodName][metricName][i], 'max', 'root/rates/path/method/metric/0/max');
                        if (checkProperty(pricing.rates[pathName][methodName][metricName][i], 'period', 'root/rates/path/method/metric/0/period')) {
                            // amount: number
                            // unit: "millisecond" | "second" | "minute" | "hour" | "day" | "week" | "month" | "year" | "decade" | "century" | "forever"
                            checkProperty(pricing.rates[pathName][methodName][metricName][i].period, 'amount', 'root/rates/path/method/metric/0/period/amount');
                            checkProperty(pricing.rates[pathName][methodName][metricName][i].period, 'unit', 'root/rates/path/method/metric/0/period/unit');
                        }
                        checkProperty(pricing.rates[pathName][methodName][metricName][i], 'scope', 'root/rates/path/method/metric/0/scope');
                        if (checkProperty(pricing.rates[pathName][methodName][metricName][i], 'cost', 'root/rates/path/method/metric/0/cost')) {
                            // operation ?: OperationCost
                            // overage?: OverageCost
                            // logger.validationWarning("-- HAS ${pricing.rates[pathName][methodName][metricName][i].cost} COST");
                            if (checkProperty(pricing.rates[pathName][methodName][metricName][i].cost, 'operation', 'root/rates/path/method/metric/0/cost/operation')) {
                                // volume: number
                                // cost: number
                                checkProperty(pricing.rates[pathName][methodName][metricName][i].cost.operation, 'volume', 'root/rates/path/method/metric/0/cost/operation/volume');
                                checkProperty(pricing.rates[pathName][methodName][metricName][i].cost.operation, 'cost', 'root/rates/path/method/metric/0/cost/operation/cost');
                            }
                            if (checkProperty(pricing.rates[pathName][methodName][metricName][i].cost, 'overage', 'root/rates/path/method/metric/0/cost/overage')) {
                                // excess: number
                                // cost: number
                                checkProperty(pricing.rates[pathName][methodName][metricName][i].cost.overage, 'excess', 'root/rates/path/method/metric/0/cost/overage/excess');
                                checkProperty(pricing.rates[pathName][methodName][metricName][i].cost.overage, 'cost', 'root/rates/path/method/metric/0/cost/overage/cost');
                            }
                        }
                        // logger.validationWarning("-- END 0");
                    }
                    // logger.validationWarning("-- END metric");
                }
                // logger.validationWarning("-- END method");
            }
            // logger.validationWarning("-- END path");
        }
    }
    if (checkProperty(pricing, 'guarantees', 'root/guarantees')) {
        // [pathName: string]: Guarantee
        // logger.validationWarning("-- HAS ${Object.keys(pricing.guarantees).length} GUARANTEES");
        for (const [guaranteeName, guarantee] of Object.entries(pricing.guarantees)) {
            // [methodName: string]: GuaranteeObjective[]
            // logger.validationWarning("-- BEGIN guarantee");
            for (const i in pricing.guarantees[guaranteeName]) {
                // objective: string
                // period ?: Period
                // window ?: "dynamic" | "static"
                // scope ?: string
                // logger.validationWarning("-- BEGIN 0");
                checkProperty(pricing.guarantees[guaranteeName], 'objective', 'root/guarantees/guarantee/0/objective');
                if (checkProperty(pricing.guarantees[guaranteeName], 'period', 'root/guarantees/guarantee/0/period')) {
                    // amount: number
                    // unit: "millisecond" | "second" | "minute" | "hour" | "day" | "week" | "month" | "year" | "decade" | "century" | "forever"
                    checkProperty(pricing.guarantees[guaranteeName].period, 'amount', 'root/guarantees/guarantee/0/period/amount');
                    checkProperty(pricing.guarantees[guaranteeName].period, 'unit', 'root/guarantees/guarantee/0/period/unit');
                }
                checkProperty(pricing.guarantees[guaranteeName], 'window', 'root/guarantees/guarantee/0/window');
                checkProperty(pricing.guarantees[guaranteeName], 'scope', 'root/guarantees/guarantee/0/scope');
                // logger.validationWarning("-- END 0");
            }
            // logger.validationWarning("-- END guarantee");
        }
    }
    if (checkProperty(pricing, 'configuration', 'root/configuration')) {
        // [name: string]: string
        // logger.validationWarning("-- HAS ${Object.keys(pricing.configuration).length} CONFIGURATIONS");
    }
    checkProperty(pricing, 'availability', 'root/availability');

    // logger.validationWarning("-- END VERBOSE LIST OF PROPERTIES --");
}

module.exports = {
    listProperties,
};
