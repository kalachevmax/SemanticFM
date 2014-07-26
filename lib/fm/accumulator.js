

/**
 * @constructor
 * @implements {fm.IAccumulator}
 * @param {fm.Input} data
 */
fm.Accumulator = function(data) {
  /**
   * @type {fm.Input}
   */
  this.__data = data;
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
fm.Accumulator.prototype.update = function(data) {
  this.__data = data;
};
