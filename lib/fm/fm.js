

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
 * @typedef {*}
 */
fm.Atom;


/**
 * @typedef {!Array.<fm.Atom>}
 */
fm.List;


/**
 * @typedef {function(fm.Atom)}
 */
fm.Complete;


/**
 * @typedef {function(string, number=)}
 */
fm.Cancel;


/**
 * @typedef {function(fm.Atom, fm.Complete, fm.Cancel)}
 */
fm.Action;


/**
 * @typedef {function(fm.Atom, function(boolean), fm.Cancel)}
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
fm.if = function(condition, trueBranch, opt_falseBranch) {
  return function(atom, complete, cancel) {
    var context = this;

    condition(atom, function(result) {
      if (result) {
        trueBranch.call(context, atom, complete, cancel);
      } else {
        if (typeof opt_falseBranch === 'function') {
          opt_falseBranch.call(context, atom, complete, cancel);
        } else {
          complete(atom);
        }
      }
    }, cancel);
  }
};


/**
 * @param {fm.Action} condition
 * @param {!Function} handleStopped
 * @return {fm.Action}
 */
fm.check = function(condition, handleStopped) {
  return function(atom, complete, cancel) {
    condition.call(this, atom, function(result) {
      if (result) {
        complete(atom);
      } else {
        handleStopped(atom);
      }
    }, cancel);
  }
};


/**
 * @param {fm.ConditionAction} condition
 * @param {fm.Action} script
 * @return {fm.Action}
 */
fm.while = function(condition, script) {
  return function(atom, complete, cancel) {
    var context = this;

    function loop(localAtom, localComplete, localCancel) {
      fm.acts.fold([
        fm.check(condition, localComplete),
        script
      ]).call(context, localAtom, function(localAtom) {
        loop.call(context, localAtom, localComplete, localCancel);
      }, localCancel);
    }

    loop.call(this, atom, complete, cancel);
  }
};


/**
 * @param {fm.Script} script
 * @param {fm.Script} reverseScript
 * @return {fm.Action}
 */
fm.transact = function(script, reverseScript) {
  var actionNo = 0;

  function incActionNo(_, complete, cancel) {
    actionNo += 1;
    complete();
  }

  return function(atom, complete, cancel) {
    var context = this;

    fm.acts.wrap(script, incActionNo).call(this, atom, complete, function() {
      fm.acts.fold(reverseScript, actionNo).call(context, atom, cancel, cancel);
    });
  }
};


/**
 * @param {fm.Script} script
 * @return {fm.Action}
 */
fm.script = function(script) {
  return fm.acts.fold(script);
};


/**
 * @param {fm.Action} action
 * @return {fm.Action}
 */
fm.map = function(action) {
  return fm.list.fold(action, []);
};


/**
 * @param {fm.Action} action
 * @return {fm.Action}
 */
fm.each = function(action) {
  return fm.list.walk(action);
};


/**
 * @param {function(fm.Input, fm.Input)} fn
 * @param {fm.Input} base
 * @return {fm.Action}
 */
fm.reduce = function(fn, base) {
  return fm.list.fold(fn, base);
};


/**
 * @param {fm.ConditionAction} condition
 * @return {fm.Action}
 */
fm.filter = function(condition) {
  return fm.list.filter(condition);
};


/**
 * @param {fm.Input} base
 * @return {fm.IAccumulator}
 */
fm.createAccumulator = function(base) {
  if (typeof base === 'number' ||
      typeof base === 'string' ||
      typeof base === 'boolean' ||
      base instanceof Date ||
      base instanceof RegExp) {

    return new fm.AtomAccumulator(base);
  }

  if (base instanceof Array) {
    return new fm.ListAccumulator(base);
  }
};


module.exports = fm;
