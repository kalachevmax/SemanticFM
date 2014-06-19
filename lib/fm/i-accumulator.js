

/**
 * @interface
 */
just.fm.IAccumulator = function() {};


/**
 * @return {just.fm.Atom}
 */
just.fm.IAccumulator.prototype.get = function() {};


/**
 * @param {just.fm.Atom} data
 */
just.fm.IAccumulator.prototype.update = function(data) {};
