/* eslint-disable indent */
const config = require('../configurations');

const { logger } = config;

// ****************************** BEGIN AUX FUNCTIONS ****************************** //

function normalizedPeriod(p, metric, capacity) {
    let unit;
    let amount;
    if (metric && capacity[metric] && capacity[metric].period && capacity[metric].period.unit) {
        unit = capacity[metric].period.unit;
        amount = capacity[metric].period.amount;
    } else {
        unit = 'second';
        amount = 1;
        logger.debug('Using default normalization unit');
    }
    switch (unit) {
        case 'millisecond':
            logger.error('normalizedPeriod - from millisecond to whatever is not supported');
            return -1;
        case 'second':
            switch (p.unit) {
                case 'millisecond':
                    return amount / 1000;
                case 'second':
                    return amount;
                case 'minute':
                    return amount * 60;
                case 'hour':
                    return (amount * 3600); // 60 * 60);
                case 'day':
                    return (amount * 86400); // 60 * 60 * 24);
                case 'week':
                    return (amount * 604800); // 60 * 60 * 24 * 7);
                case 'month':
                    return (amount * 2628000); // 60 * 60 * 24 * 7 * 4);
                case 'year':
                    return (amount * 31556952); // 60 * 60 * 24 * 7 * 4 * 12);
                case 'decade':
                    return (amount * 315569520); // 60 * 60 * 24 * 7 * 4 * 12 * 10);
                case 'century':
                    return (amount * 3155695200); // 60 * 60 * 24 * 7 * 4 * 12 * 10 * 10);
                case 'forever':
                    return Infinity;
                default:
                    logger.error(`normalizedPeriod - from millisecond to ${p.unit} is not supported`);
                    return -1;
            }
        case 'minute':
            logger.error('normalizedPeriod - from minute to whatever is not supported');
            return -1;
        case 'hour':
            logger.error('normalizedPeriod - from hour to whatever is not supported');
            return -1;
        case 'day':
            logger.error('normalizedPeriod - from day to whatever is not supported');
            return -1;
        case 'week':
            logger.error('normalizedPeriod - from week to whatever is not supported');
            return -1;
        case 'month':
            logger.error('normalizedPeriod - from month to whatever is not supported');
            return -1;
        case 'year':
            logger.error('normalizedPeriod - from year to whatever is not supported');
            return -1;
        case 'decade':
            logger.error('normalizedPeriod - from decade to whatever is not supported');
            return -1;
        case 'century':
            logger.error('normalizedPeriod - from century to whatever is not supported');
            return -1;
        case 'forever':
            logger.error('normalizedPeriod - from forever to whatever is not supported');
            return -1;
        default:
            logger.error(`normalizedPeriod - from ${unit} to whatever is not supported`);
            return -1;
    }
}

function PU(limit, normalizedPeriodParam, metric, capacity) {
    const limitMax = !Number.isNaN(Number(limit.max)) ? limit.max : Infinity;
    if (normalizedPeriodParam) {
        return limitMax / normalizedPeriodParam;
    } if (capacity[metric] && capacity[metric].max) {
        return limitMax / capacity[metric].max;
    }
    logger.error('Cannot calculate PU, missing capacity or normalized period');
    return null;
}

function projectBurst(N, M, Mp) {
    if (Mp >= M) { return N * Math.ceil(Mp / M); }
    return N;
}

function projectUniform(N, M, Mp) {
    if (Mp < M) { return Math.ceil(N / Math.ceil(M / Mp)); }
    return N;
}

function printLimit(limit) {
    if (limit.max >= 0 && limit.period && limit.period.amount >= 0 && limit.period.unit) {
        return `${limit.max} per ${limit.period.amount}/${limit.period.unit}`;
    } if (limit.max >= 0 && !limit.period) {
        return `${limit.max} per request (no period)`;
    }
    return `Non formateable limit: ${JSON.stringify(limit)}`;
}

function printLimitatation(limitation) {
    let i = 0;
    let res = '';
    limitation.forEach((limit) => {
        res += `l${i}='${printLimit(limit)}'; `;
        i += 1;
    });
    return res;
}

// ****************************** END AUX FUNCTIONS ****************************** //

module.exports = {
    normalizedPeriod,
    PU,
    printLimitatation,
    printLimit,
    projectBurst,
    projectUniform,
};
