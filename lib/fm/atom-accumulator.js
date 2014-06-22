

/**
 * @constructor
 * @implements {fm.IAccumulator}
 * @param {fm.Atom} atom
 */
fm.AtomAccumulator = function(atom) {
  /**
   * @type {fm.Atom}
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
