

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
 * @typedef {number|string|boolean|Array|Object|Date|RegExp|null}
 */
fm.Atom;


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
 * @typedef {Array.<fm.Atom>}
 */
fm.List;


/**
 * @typedef {fm.Atom|fm.Action}
 */
fm.DataSource;


/**
 * @type {!Object.<fm.Type, fm.ITypeProvider>}
 */
fm.__typeProviders = {};


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
  /**
   * @param {function(fm.Input)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input} input
   */
  function runScript(complete, cancel, input) {
    fm.acts.fold(script)(completeScript, cancelScript, input);

    function completeScript(result) {
      complete(result);
    }

    function cancelScript(message, opt_code) {
      cancel(message, opt_code);
    }
  }

  return runScript;
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


/**
 * @param {fm.ConditionAction} condition
 * @return {fm.ConditionAction|function(function(boolean),
 * function(string, number=), fm.Input)}
 */
fm.not = function(condition) {
  /**
   * @param {function(boolean)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input} input
   */
  function not(complete, cancel, input) {
    condition(function(result) {
      if (result) {
        complete(false);
      } else {
        complete(true);
      }
    }, cancel, input);
  }

  return not;
};


/**
 * @param {fm.Action} action
 * @return {fm.Action}
 */
fm.notwait = function(action) {
  /**
   * @param {function(fm.Input)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input} input
   */
  function notwait(complete, cancel, input) {
    action(fm.nop, console.error, input);
    complete(input);
  }

  return notwait;
};


/**
 * @param {fm.Atom} value
 * @param {fm.Type} type
 * @retrn {boolean}
 */
fm.typeof = function(value, type) {
  switch (type) {
    case fm.Type.NUMBER:
    case fm.Type.STRING:
    case fm.Type.BOOLEAN:
      return typeof value == type;

    case fm.Type.LIST:
      return value instanceof Array;

    case fm.Type.OBJECT:
      return value instanceof Object;

    case fm.Type.DATE:
      return value instanceof Date;

    case fm.Type.REGEXP:
      return value instanceof RegExp;

    case fm.Type.NULL:
      return value === null;

    case fm.Type.ANY:
      return true;
  }

  return false;
};


/**
 * @param {fm.Type} type
 * @param {!Array.<fm.Atom>} array
 * @return {boolean}
 */
fm.arrayOf = function(type, array) {

};


/**
 * @param {fm.Atom} value
 */
fm.getType = function(value) {
  if (typeof value === 'string') {
    return fm.Type.STRING;
  }

  if (typeof value === 'number') {
    return fm.Type.NUMBER;
  }

  if (typeof value === 'boolean') {
    return fm.Type.BOOLEAN;
  }

  if (value instanceof Date) {
    return fm.Type.DATE;
  }

  if (value instanceof RegExp) {
    return fm.Type.REGEXP;
  }

  if (value instanceof Array) {
    return fm.Type.LIST;
  }

  if (value instanceof Object) {
    return fm.Type.OBJECT;
  }

  if (value === null) {
    return fm.Type.NULL;
  }

  return fm.Type.ANY;
};


/**
 * @param {fm.Type} type
 * @param {fm.ITypeProvider} provider
 */
fm.registerTypeProvider = function(type, provider) {
  if (fm.__typeProviders[type] === null) {
    fm.__typeProviders[type] = provider;
  }
};


/**
 * @param {fm.Type} type
 * @return {fm.ITypeProvider}
 */
fm.getTypeProvider = function(type) {
  return fm.__typeProviders[type] || null;
};


/**
 * @param {fm.DataSource} dataSource
 * @param {fm.Type} type
 * @return {fm.Action|function(function(fm.Atom), function(string, number=), fm.Input)}
 */
fm.retrieve = function(dataSource, type) {
  /**
   * @param {function(fm.Atom)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input} input
   */
  function doRetrieve(complete, cancel, input) {
    if (typeof dataSource === 'function') {
      dataSource(function(atom) {
        if (fm.typeof(atom, type)) {
          complete(atom);
        } else {
          cancel('[fm.retrieve] atom ' + atom + ' must be of type: ' + type);
        }
      }, cancel, input);
    } else {
      if (fm.typeof(dataSource, type)) {
        complete(dataSource);
      } else {
        cancel('[fm.retrieve] atom ' + dataSource + ' must be of type: ' + type);
      }
    }
  }

  return doRetrieve;
};


/**
 * @param {fm.DataSource} source
 * @return {fm.Action|function(function(fm.Atom), function(string, number=), fm.Input)}
 */
fm.STRING = function(source) {
  /**
   * @param {function(fm.Atom)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input} input
   */
  function newString(complete, cancel, input) {
    fm.retrieve(source, fm.Type.STRING)(complete, cancel, input);
  }

  return newString;
};


/**
 * @param {fm.DataSource} source
 * @return {fm.Action}
 */
fm.NUMBER = function(source) {
  function newNumber(complete, cancel, input) {
    fm.retrieve(source, fm.Type.NUMBER)(complete, cancel, input);
  }

  return newNumber;
};


/**
 * @param {fm.Type} type
 * @param {fm.DataSource} source
 * @return {fm.Action}
 */
fm.LIST = function(type, source) {
  function newList(complete, cancel, input) {
    fm.retrieve(source, fm.Type.LIST)(complete, cancel, input);
  }

  return newList;
};


/**
 * @param {fm.DataSource} source
 * @return {fm.Action}
 */
fm.LIST_STRING = function(source) {
  return fm.LIST(fm.Type.STRING, source);
};


/**
 * @param {function(fm.Atom)} complete
 * @param {function(string, number=)} cancel
 * @param {fm.List} list
 */
fm.fold = function(complete, cancel, list) {
  if (list instanceof Array && list.length > 0) {
    var type = fm.getType(list[0]);
    var typeProvider = fm.getTypeProvider(type);

    if (typeProvider !== null) {
      complete(typeProvider.fold(list));
    } else {
      cancel('[fm.fold] unknown type: ', type);
    }
  }
};


fm.registerTypeProvider(fm.Type.LIST, new fm.ListProvider());
