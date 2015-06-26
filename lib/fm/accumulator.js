

/**
 * @constructor
 * @implements {fm.IAccumulator}
 * @implements {fm.IUpdateable}
 * @param {fm.Input=} opt_data
 */
fm.Accumulator = function(opt_data) {
  /**
   * @type {fm.Input}
   */
  this.__data = opt_data || null;
};


/**
 * @inheritDoc
 */
fm.Accumulator.prototype.get = function() {
  return this.__data;
};


/**
 * @inheritDoc
 */
fm.Accumulator.prototype.update = function(opt_data) {
  this.__data = typeof opt_data !== 'undefined' ? opt_data : null;
};
