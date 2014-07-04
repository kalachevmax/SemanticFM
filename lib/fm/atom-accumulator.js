

/**
 * @constructor
 * @implements {fm.IAccumulator}
 * @param {fm.Input} input
 */
fm.AtomAccumulator = function(input) {
  /**
   * @type {fm.Input}
   */
  this.__atom = input;
};


/**
 * @inheritDoc
 */
fm.AtomAccumulator.prototype.get = function() {
  return this.__atom;
};


/**
 * @inheritDoc
 */
fm.AtomAccumulator.prototype.update = function(data) {
  this.__atom = data;
};
