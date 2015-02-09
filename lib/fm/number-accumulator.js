

/**
 * @constructor
 * @implements {fm.IAccumulator}
 * @implements {fm.IUpdateable}
 * @param {number} opt_value
 */
fm.NumberAccumulator = function(opt_value) {
  /**
   * @type {number}
   */
  this.__value = opt_value || 0;
};


/**
 * @inheritDoc
 */
fm.NumberAccumulator.prototype.get = function() {
  return this.__value;
};


/**
 * @inheritDoc
 */
fm.NumberAccumulator.prototype.update = function(opt_value) {
  this.__value += opt_value || 1;
};
