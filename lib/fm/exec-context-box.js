

/**
 * @constructor
 * @implements {fm.IBox.<fm.ExecContext>}
 * @param {string} name
 */
fm.ExecContextBox = function(name) {
	/**
	 * @type {string}
	 */
	this.__name = name;
};


/**
 * @inheritDoc
 */
fm.ExecContextBox.prototype.get = function(opt_context) {
	return fm.__contexts[this.__name] || null;
};
