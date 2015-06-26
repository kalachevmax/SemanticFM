

/**
 * @constructor
 * @param {boolean} opt_mergeable
 */
fm.ExecContext = function(opt_mergeable) {
	/**
	 * @type {!Object.<string, fm.SymbolValue>}
	 */
	this.__symbols = {};

	/**
	 * @type {boolean}
	 */
	this.__mergeable = opt_mergeable || false;
};


/**
 * @param {fm.Type} type
 * @param {fm.SymbolValue} value
 * @return {fm.SymbolValue}
 */
fm.ExecContext.prototype.__createSymbol = function(type, value) {
	switch (type) {
		case fm.Type.NUMBER_ACCUMULATOR:
			if (typeof value === 'number') {
				return new fm.NumberAccumulator(value);
			}
	}

	return value;
};


/**
 * @return {boolean}
 */
fm.ExecContext.prototype.isMergeable = function() {
	return this.__mergeable;
};


/**
 * @param {function(string, fm.SymbolValue)} handler
 */
fm.ExecContext.prototype.forEachSymbol = function(handler) {
	for (var name in this.__symbols) {
		handler(name, this.__symbols[name]);
	}
};


/**
 * @param {!fm.ExecContext} context
 */
fm.ExecContext.prototype.mergeWith = function(context) {
	var self = this;

	context.forEachSymbol(function(name, value) {
		self.__symbols[name] = value;
	});
};


/**
 * @param {string} name
 * @return {fm.SymbolValue}
 */
fm.ExecContext.prototype.getSymbol = function(name) {
	return this.__symbols[name] !== undefined ? this.__symbols[name] : null;
};


/**
 * @param {string} name
 * @return {boolean}
 */
fm.ExecContext.prototype.hasSymbol = function(name) {
	return this.__symbols[name] !== undefined;
};


/**
 * @param {string} name
 * @param {fm.Type} type
 * @param {fm.SymbolValue} value
 */
fm.ExecContext.prototype.addSymbol = function(name, type, value) {
	return this.__symbols[name] = this.__createSymbol(type, value);
};


/**
 * @param {string} name
 * @param {fm.SymbolValue} value
 */
fm.ExecContext.prototype.updateSymbol = function(name, value) {
	return this.__symbols[name] = value;
};


/**
 * @param {string} name
 * @param {string} operationName
 * @return {boolean}
 */
fm.ExecContext.prototype.isSymbolImplements = function(name, operationName) {
	return typeof this.__symbols[name][operationName] === 'function';
};


fm.ExecContext.prototype.destroy = function() {
	this.__symbols = {};
};
