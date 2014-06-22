

/**
 * @interface
 */
fm.IAccumulator = function() {};


/**
 * @return {fm.Atom}
 */
fm.IAccumulator.prototype.get = function() {};


/**
 * @param {fm.Atom} data
 */
fm.IAccumulator.prototype.update = function(data) {};
