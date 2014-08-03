0


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
 * @namespace
 */
fm.log = {};


/**
 * @namespace
 */
fm.message = {};


/**
 * @typedef {*}
 */
fm.Input;


/**
 * @typedef {function(!Function, !Function, fm.Input)}
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
 * @typedef {Array.<fm.Input>}
 */
fm.List;


/**
 *
 */
fm.nop = function() {};


/**
 * @param {function(fm.Input)} complete
 * @param {function(string, number=)} cancel
 * @param {fm.Input} input
 */
fm.noact = function(complete, cancel, input) {
  complete(input);
};


/**
 * @param {function(fm.Input)} complete
 * @param {function(string, number=)} cancel
 * @param {fm.Input} input
 */
fm.true = function(complete, cancel, input) {
  complete(input === true);
};


/**
 * @param {function(fm.Input)} complete
 * @param {function(string, number=)} cancel
 * @param {fm.Input} input
 */
fm.false = function(complete, cancel, input) {
  complete(input === false);
};


/**
 * @param {fm.ConditionAction} condition
 * @param {fm.Action} trueBranch
 * @param {fm.Action=} opt_falseBranch
 * @return {fm.Action}
 */
fm.if = function(condition, trueBranch, opt_falseBranch) {
  /**
   * @param {function(fm.Input)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input} input
   */
  function cond(complete, cancel, input) {
    condition(function(result) {
      if (result) {
        trueBranch(complete, cancel, input);
      } else {
        if (typeof opt_falseBranch === 'function') {
          opt_falseBranch(complete, cancel, input);
        } else {
          complete(input);
        }
      }
    }, cancel, input);
  }

  return cond;
};


/**
 * @param {...fm.ConditionAction} var_args
 * @return {fm.ConditionAction|function(function(boolean),
 * function(string, number=), fm.Action)}
 */
fm.or = function(var_args) {
  var conditions = Array.prototype.slice.call(arguments);

  /**
   * @param {function(boolean)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Action} input
   */
  function or(complete, cancel, input) {
    function process(index) {
      if (typeof conditions[index] === 'function') {
        conditions[index](function(result) {
          if (result) {
            complete(true);
          } else {
            process(++index);
          }
        }, cancel, input);
      } else {
        complete(false);
      }
    }

    process(0);
  }

  return or;
};


/**
 * @param {...fm.ConditionAction} var_args
 * @return {fm.ConditionAction|function(function(boolean),
 * function(string, number=), fm.Action)}
 */
fm.and = function(var_args) {
  var conditions = Array.prototype.slice.call(arguments);

  /**
   * @param {function(boolean)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Action} input
   */
  function and(complete, cancel, input) {
    var passed = 0;

    function process(index) {
      if (typeof conditions[index] === 'function') {
        conditions[index](function(result) {
          if (!result) {
            complete(false);
          } else {
            passed += 1;
            process(++index);
          }
        }, cancel, input);
      } else {
        complete(passed === conditions.length);
      }
    }

    process(0);
  }

  return and;
};


/**
 * @param {fm.Action} condition
 * @param {!Function} handleStopped
 * @return {fm.Action}
 */
fm.check = function(condition, handleStopped) {
  /**
   * @param {function(fm.Input)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input} input
   */
  function check(complete, cancel, input) {
    condition(function(result) {
      if (result) {
        complete(input);
      } else {
        handleStopped(input);
      }
    }, cancel, input);
  }

  return check;
};


/**
 * @param {fm.ConditionAction} condition
 * @param {fm.Action} script
 * @return {fm.Action}
 */
fm.while = function(condition, script) {
  /**
   * @param {function(fm.Input)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input} input
   */
  function statement(complete, cancel, input) {
    function loop(localComplete, localCancel, localInput) {
      fm.acts.fold([
        fm.check(condition, localComplete),
        script
      ])(function(localInput) {
        loop(localComplete, localCancel, localInput);
      }, localCancel, localInput);
    }

    loop(complete, cancel, input);
  }

  return statement;
};


/**
 * @param {fm.Script} script
 * @param {fm.Script} reverseScript
 * @return {fm.Action}
 */
fm.transact = function(script, reverseScript) {
  var actionNo = 0;

  function incActionNo(complete, cancel) {
    actionNo += 1;
    complete();
  }

  /**
   * @param {function(fm.Input)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input} input
   */
  function transact(complete, cancel, input) {
    fm.acts.wrap(script, incActionNo)(complete, function() {
      fm.acts.foldLimit(reverseScript, actionNo)(cancel, cancel, null);
    }, input);
  }

  return transact;
};


/**
 * @param {fm.Script} script
 * @return {fm.Action}
 */
fm.script = function(script) {
  return fm.acts.fold(script);
};


/**
 * @param {function(fm.Input, function(fm.Input), function(string, number=))} fn
 * @return {fm.Action}
 */
fm.map = function(fn) {
  return fm.list.fold(fn, []);
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
 * @param {!Function} syncFn
 * @return {fm.Action}
 */
fm.async = function(syncFn) {
  return function(complete, cancel, input) {
    syncFn(input);
    complete(input);
  }
};


/**
 * @param {fm.Input} base
 * @return {fm.IAccumulator}
 */
fm.createAccumulator = function(base) {
  if (base instanceof Array) {
    return new fm.list.Accumulator(base);
  }

  return new fm.Accumulator(base);
};


if (module && module.exports) {
  module.exports = fm;
}
