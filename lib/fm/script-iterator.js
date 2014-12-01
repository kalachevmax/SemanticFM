

/**
 * @constructor
 * @implements {fm.IIterator}
 * @param {fm.Script} script
 */
fm.ScriptIterator = function(script) {
  /**
   * @type {fm.Script}
   */
  this.__script = script;
};


/**
 * @inheritDoc
 */
fm.ScriptIterator.prototype.hasNext = function() {

};


/**
 * @inheritDoc
 */
fm.ScriptIterator.prototype.next = function() {};


/**
 * @inheritDoc
 */
fm.ScriptIterator.prototype.destroy = function() {};
