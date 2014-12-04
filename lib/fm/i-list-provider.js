

/**
 * @interface
 * @extends {fm.IAtomProvider}
 */
fm.IListProvider = function() {};


/**
 * @param {function(fm.Atom)} complete
 * @param {function(string, number=)} cancel
 * @param {fm.List} list
 */
fm.IListProvider.prototype.fold = function(complete, cancel, list) {};
