

/**
 * @interface
 * @extends {fm.IAtomProvider}
 */
fm.IListProvider = function() {};


/**
 * @param {function()} complete
 * @param {function()} cancel
 * @param {fm.List} list
 */
fm.IListProvider.prototype.fold = function(complete, cancel, list) {};
