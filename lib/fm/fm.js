


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
 * @typedef {!Array.<fm.Input>}
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
 * @type {!Object.<string, fm.Input>}
 */
fm.__dm = {};


/**
 * @type {!Object.<string, !Function>}
 */
fm.__symbols = {};


/**
 * @type {!Object.<string, fm.Action>}
 */
fm.__procedures = {};


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
  return function(complete, cancel, input) {
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
};


/**
 * @param {fm.Action} condition
 * @param {!Function} handleStopped
 * @return {fm.Action}
 */
fm.check = function(condition, handleStopped) {
  return function(complete, cancel, input) {
    condition(function(result) {
      if (result) {
        complete(input);
      } else {
        handleStopped(input);
      }
    }, cancel, input);
  }
};


/**
 * @param {fm.ConditionAction} condition
 * @param {fm.Action} script
 * @return {fm.Action}
 */
fm.while = function(condition, script) {
  return function(complete, cancel, input) {
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

  return function(complete, cancel, input) {
    fm.acts.wrap(script, incActionNo)(complete, function() {
      fm.acts.foldLimit(reverseScript, actionNo)(cancel, cancel);
    }, input);
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


/**
 * @param {!Function} syncFn
 * @return {fm.Action}
 */
fm.async = function(syncFn) {
  return function(complete, cancel, input) {
    complete(syncFn(input));
  }
};


/**
 * @param {string} key
 * @param {fm.Input} value
 */
fm.set = function(key, value) {
  fm.__dm[key] = value;
};


/**
 * @param {string} key
 * @param {string=} opt_subkey
 * @return {fm.Input}
 */
fm.get = function(key, opt_subkey) {
  if (opt_subkey) {
    if (fm.__dm[key] instanceof Object) {
      return fm.__dm[key][opt_subkey] || null;
    }
  } else {
    return fm.__dm[key] || fm.__symbols[key]() || null;
  }
};


/**
 * @param {string} key
 * @param {string=} opt_subkey
 * @return {fm.Input}
 */
fm.inc = function(key, opt_subkey) {
  if (typeof opt_subkey === 'string') {
    if (fm.__dm[key] instanceof Object &&
        typeof fm.__dm[key][opt_subkey] === 'number') {
      fm.__dm[key][opt_subkey] += 1;
    }
  } else {
    if (typeof fm.__dm[key] === 'number') {
      fm.__dm[key] += 1;
    }
  }
};


/**
 * @param {string} key
 * @param {string=} opt_subkey
 * @return {fm.Input}
 */
fm.dec = function(key, opt_subkey) {
  if (typeof opt_subkey === 'string') {
    if (fm.__dm[key] instanceof Object &&
        typeof fm.__dm[key][opt_subkey] === 'number') {
      fm.__dm[key][opt_subkey] -= 1;
    }
  } else {
    if (typeof fm.__dm[key] === 'number') {
      fm.__dm[key] -= 1;
    }
  }
};


/**
 * @param {string} key
 * @param {fm.Input=} opt_value
 * @return {fm.Action}
 */
fm.assign = function(key, opt_value) {
  /**
   * @param {function(fm.Input)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input=} opt_input
   */
  return function(complete, cancel, opt_input) {
    fm.__dm[key] = opt_value || opt_input;
    complete(opt_input);
  }
};


/**
 * @param {string} key
 * @param {string} subkeyOrType
 * @param {*} type
 */
fm.assert = function(key, subkeyOrType, type) {
  var argsCount = arguments.length;

  return function(complete, cancel, opt_input) {
    function check(isPrimitive, key, type, opt_subkey) {
      var obj = fm.__dm;

      if (opt_subkey) {
        obj = fm.__dm[key];
        key = opt_subkey;
      }

      if (isPrimitive) {
        return typeof obj[key] === type;
      } else {
        return obj[key] instanceof type;
      }
    }

    function getTypeMessage(type) {
      if (typeof type === 'string') {
        return type;
      }

      if (type instanceof Array) {
        return 'Array';
      }

      if (type instanceof Object) {
        return 'Object';
      }

      if (type instanceof RegExp) {
        return 'RegExp';
      }

      if (type instanceof Date) {
        return 'Date';
      }

      return type;
    }

    if (argsCount === 2) {
      if (check(typeof subkeyOrType === 'string', key, subkeyOrType)) {
        complete(opt_input);
      } else {
        cancel('[fm.assert] parameter ' + key + ' must be of type ' +
            getTypeMessage(subkeyOrType));
      }
    } else {
      if (check(false, key, Object)) {
        if (check(typeof type === 'string', key, type, subkeyOrType)) {
          complete(opt_input);
        } else {
          cancel('[fm.assert] parameter ' + key + '[' + subkeyOrType + ']' +
              ' must be of type ' + getTypeMessage(type));
        }
      } else {
        cancel('[fm.assert] parameter ' + key + ' must be of type ' +
            getTypeMessage(Object));
      }
    }
  }
};


/**
 * @param {string} symbol
 * @param {!Function} fn
 */
fm.define = function(symbol, fn) {
  fm.__symbols[symbol] = fn;
};


/**
 * @param {string} name
 * @param {fm.Action} action
 */
fm.proc = function(name, action) {
  fm.__procedures[name] = action;
};


/**
 * @param {string} name
 * @return {fm.Action}
 */
fm.invoke = function(name) {
  /**
   * @param {function(fm.Input=)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input=} opt_args
   */
  function invoke(complete, cancel, opt_args) {
    if (typeof fm.__procedures[name] === 'function') {
      fm.__procedures[name](function() {
        complete(opt_args);
      }, cancel, opt_args);
    } else {
      cancel('[fm.invoke] procedure ' + name + ' is not defined');
    }
  }

  return invoke;
};


module.exports = fm;
