

/**
 * @namespace
 */
var fm = {};


/**
 * @namespace
 */
fm.acts = {};


/**
 * @namespace
 */
fm.list = {};


/**
 * @typedef {*}
 */
fm.Input;


/**
 * @typedef {Array.<fm.Input>}
 */
fm.List;


/**
 * @typedef {function(!Function, !Function, fm.Input=)}
 */
fm.Action;


/**
 * @typedef {function(function(boolean), !Function, fm.Input)}
 */
fm.ConditionAction;


/**
 * @typedef {!Array.<fm.Action>}
 */
fm.Script;


/**
 *
 */
fm.nop = function() {};


/**
 * @param {fm.ConditionAction} condition
 * @param {fm.Action} trueBranch
 * @param {fm.Action=} opt_falseBranch
 * @return {fm.Action}
 */
fm.if = function(condition, trueBranch, opt_falseBranch) {};


/**
 * @param {fm.Action} condition
 * @param {!Function} handleStopped
 * @return {fm.Action}
 */
fm.check = function(condition, handleStopped) {};


/**
 * @param {fm.ConditionAction} condition
 * @param {fm.Action} script
 * @return {fm.Action}
 */
fm.while = function(condition, script) {};


/**
 * @param {fm.Script} script
 * @param {fm.Script} reverseScript
 * @return {fm.Action}
 */
fm.transact = function(script, reverseScript) {};


/**
 * @param {fm.Script} script
 * @return {fm.Action}
 */
fm.script = function(script) {};


/**
 * @param {fm.Action} action
 * @return {fm.Action}
 */
fm.map = function(action) {};


/**
 * @param {fm.Action} action
 * @return {fm.Action}
 */
fm.each = function(action) {};


/**
 * @param {function(fm.Input, fm.Input)} fn
 * @param {fm.Input} base
 * @return {fm.Action}
 */
fm.reduce = function(fn, base) {};


/**
 * @param {fm.ConditionAction} condition
 * @return {fm.Action}
 */
fm.filter = function(condition) {};


/**
 * @param {fm.Input} base
 * @return {fm.IAccumulator}
 */
fm.createAccumulator = function(base) {};


/**
 * @param {!Function} syncFn
 * @return {fm.Action}
 */
fm.async = function(syncFn) {};


/**
 * @interface
 */
fm.IAccumulator = function() {};


/**
 * @return {fm.Input}
 */
fm.IAccumulator.prototype.get = function() {};


/**
 * @param {fm.Input} data
 */
fm.IAccumulator.prototype.update = function(data) {};


/**
 * @constructor
 * @implements {fm.IAccumulator}
 * @param {fm.Input} data
 */
fm.Accumulator = function(data) {};


/**
 * @inheritDoc
 */
fm.Accumulator.prototype.get = function() {};


/**
 * @inheritDoc
 */
fm.Accumulator.prototype.update = function(data) {};



/**
 * @interface
 */
fm.IIterator = function() {};


/**
 * @return {boolean}
 */
fm.IIterator.prototype.hasNext = function() {};


/**
 * @return {fm.Input}
 */
fm.IIterator.prototype.next = function() {};


/**
 *
 */
fm.IIterator.prototype.destroy = function() {};


/**
 * @param {fm.Script} script
 * @return {fm.Action}
 */
fm.acts.fold = function(script) {};


/**
 * @param {fm.Script} script
 * @param {number} amount
 * @return {fm.Action}
 */
fm.acts.foldLimit = function(script, amount) {};


/**
 * @param {fm.Script} script
 * @return {fm.Action}
 */
fm.acts.fork = function(script) {};


/**
 * @param {fm.Script} script
 * @param {fm.Action} action
 * @return {fm.Action}
 */
fm.acts.wrap = function(script, action) {};


/**
 * @param {fm.Action} action
 * @return {fm.Action}
 */
fm.list.walk = function(action) {};


/**
 * @param {function(fm.Input, fm.Input, !Function, !Function)} fn
 * @param {fm.Input} base
 * @return {fm.Action}
 */
fm.list.fold = function(fn, base) {};


/**
 * @param {fm.ConditionAction} condition
 * @return {fm.Action}
 */
fm.list.filter = function(condition) {};


/**
 * @param {fm.List} list
 * @return {fm.Action}
 */
fm.list.fork = function(list) {};


/**
 * @constructor
 * @implements {fm.IIterator}
 * @param {fm.List} list
 */
fm.list.Iterator = function(list) {};


/**
 * @return {boolean}
 */
fm.list.Iterator.prototype.hasNext = function() {};


/**
 * @return {fm.Input}
 */
fm.list.Iterator.prototype.next = function() {};


/**
 *
 */
fm.list.Iterator.prototype.destroy = function() {};


/**
 * @constructor
 * @implements {fm.IAccumulator}
 * @param {fm.List} list
 */
fm.list.Accumulator = function(list) {};


/**
 * @inheritDoc
 */
fm.list.Accumulator.prototype.get = function() {};


/**
 * @inheritDoc
 */
fm.list.Accumulator.prototype.update = function(data) {};
