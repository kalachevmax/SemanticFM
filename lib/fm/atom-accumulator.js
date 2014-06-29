

/**
 * @constructor
 * @implements {fm.IAccumulator}
 * @param {fm.Input} atom
 */
fm.AtomAccumulator = function(atom) {
  /**
   * @type {fm.Input}
   */
  this.__atom = atom;
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
