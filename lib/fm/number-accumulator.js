

/**
 * @constructor
 * @extends {fm.Accumulator}
 * @param {number} opt_value
 */
fm.NumberAccumulator = function(opt_value) {
  fm.Accumulator.call(this);

  /**
   * @type {number}
   */
  this.__value = opt_value || 0;
};

util.inherits(fm.NumberAccumulator, fm.Accumulator);


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
