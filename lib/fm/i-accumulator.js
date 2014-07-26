

/**
 * @interface
 */
fm.IAccumulator = function() {};


/**
 * @return {fm.Input}
 */
fm.IAccumulator.prototype.get = function() {};


/**
 * @param {fm.Input} data
 */
fm.IAccumulator.prototype.update = function(data) {};
