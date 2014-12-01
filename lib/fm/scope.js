

/**
 * @constructor
 * @param {!fm.Args} args
 * @param {!fm.Scope=} opt_parent
 */
fm.Scope = function(args, opt_parent) {
  /**
   * @type {fm.Scope}
   */
  this.__parent = opt_parent || null;

  /**
   * @type {!Array.<!fm.Scope>}
   */
  this.__childs = [];

  /**
   * @type {!fm.Args}
   */
  this.__args = args;

  /**
   * @type {!Object.<string, !fm.Symbol>}
   */
  this.__symbols = {};

  /**
   * @type {number}
   */
  this.__currentSymbolIndex = 0;
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
 * @param {!fm.Scope} scope
 */
fm.Scope.prototype.removeChild = function(scope) {
  this.__childs.splice(this.__childs.indexOf(scope), 1);
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


/**
 * @param {string} name
 * @param {fm.Type} type
 */
fm.Scope.prototype.populateSymbol = function(name, type) {
  var value = this.__args.get(this.__currentSymbolIndex);

  if (fm.typeof(value, type)) {
    this.__symbols[name] = fm.createSymbol(type);
  }
};
