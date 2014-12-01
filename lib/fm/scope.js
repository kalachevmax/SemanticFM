

/**
 * @constructor
 * @param {!fm.Scope=} opt_parent
 */
fm.Scope = function(opt_parent) {
  /**
   * @type {fm.Scope}
   */
  this.__parent = opt_parent || null;

  /**
   * @type {!Array.<!fm.Scope>}
   */
  this.__childs = [];

  /**
   * @type {!Object.<string, !fm.Symbol>}
   */
  this.__symbols = {};
};


/**
 * @return {fm.Scope}
 */
fm.Scope.prototype.getParent = function() {
  return this.__parent;
};


/**
 * @param {!fm.Scope} scope
 */
fm.Scope.prototype.addChild = function(scope) {
  if (this.__childs.indexOf(scope) === -1) {
    this.__childs.push(scope);
  }
};


/**
 * @param {string} name
 * @return {fm.Symbol}
 */
fm.Scope.prototype.get = function(name) {
  if (typeof this.__symbols[name] !== 'undefined') {
    return this.__symbols[name];
  }

  if (this.__parent !== null) {
    return this.__parent.get(name);
  }

  return null;
};
