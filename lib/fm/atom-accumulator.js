

/**
 * @constructor
 * @implements {just.fm.IAccumulator}
 * @param {just.fm.Atom} atom
 */
just.fm.AtomAccumulator = function(atom) {
  /**
   * @type {just.fm.Atom}
   */
  this.__atom = atom;
};


/**
 * @inheritDoc
 */
just.fm.AtomAccumulator.prototype.get = function() {
  return this.__atom;
};


/**
 * @inheritDoc
 */
just.fm.AtomAccumulator.prototype.update = function(data) {
  this.__atom = data;
};
