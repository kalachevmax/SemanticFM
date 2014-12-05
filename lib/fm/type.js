

/**
 * @constructor
 * @param {string} name
 */
fm.Type = function(name) {
  /**
   * @type {string}
   */
  this.__name = name;

  /**
   * @type {!Array.<fm.Type>}
   */
  this.__factors = [];
};
