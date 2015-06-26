

/**
 * @interface
 */
fm.IAccumulator = function() {};


/**
 * @return {fm.Input}
 */
fm.IAccumulator.prototype.get = function() {};


/**
 * @param {fm.Input=} opt_data
 */
fm.IAccumulator.prototype.update = function(opt_data) {};
