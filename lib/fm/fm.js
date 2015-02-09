

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
 * @typedef {?}
 */
fm.Input;


/**
 * @typedef {function(!Function, !Function, ?)}
 */
fm.Action;


/**
 * @typedef {function(function(boolean), fm.Cancel, ?)}
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
 * @typedef {function(fm.Input)}
 */
fm.Complete;


/**
 * @typedef {function(string, number=)}
 */
fm.Cancel;


/**
 * @typedef {function(fm.Complete, fm.Cancel, ?)}
 */
fm.RegularAction;


/**
 * @typedef {function(function(string), fm.Cancel, fm.Input)}
 */
fm.StringAction;


/**
 * @typedef {function(function(boolean), fm.Cancel, fm.Input)}
 */
fm.BooleanAction;


/**
 * @typedef {function(function(number), fm.Cancel, fm.Input)}
 */
fm.NumberAction;


/**
 * @typedef {function(function(stream.Chunk), fm.Cancel, fm.Input)}
 */
fm.ChunkAction;


/**
 * @typedef {function(function(!Object), fm.Cancel, fm.Input)}
 */
fm.HashMapAction;


/**
 * @typedef {function(function(fs.FileDescriptor), fm.Cancel, fm.Input)}
 */
fm.FileAction;


/**
 * @typedef {function(function(fm.SymbolValue), fm.Cancel, fm.Input)}
 */
fm.SymbolAction;


/**
 * @typedef {function(function(!fm.NumberAccumulator), fm.Cancel, fm.Input)}
 */
fm.NumberAccumulatorAction;


/**
 * @typedef {string}
 */
fm.SymbolName;


/**
 * @typedef {string|number|boolean|Array|Object|stream.Chunk|null}
 */
fm.SymbolValue;


/**
 * @typedef {!fm.Box.<fm.Type.STRING>}
 */
fm.StringBox;


/**
 * @typedef {!fm.Box.<fm.Type.NUMBER>}
 */
fm.NumberBox;


/**
 * @typedef {!fm.Box.<fm.Type.CHUNK>}
 */
fm.ChunkBox;


/**
 * @typedef {!fm.Box.<fm.Type.FILE>}
 */
fm.FileBox;


/**
 * @typedef {!fm.Box.<fm.Type.HASH_MAP>}
 */
fm.HashMapBox;


/**
 * @type {!Object.<string, fm.SymbolValue>}
 */
fm.__symbols = {};


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
 * @param {fm.SymbolValue} value
 * @param {fm.Type} type
 * @return {boolean}
 */
fm.typeof = function(value, type) {
  switch (type) {
    case fm.Type.STRING:
    case fm.Type.NUMBER:
    case fm.Type.BOOLEAN:
      return typeof value === type;

    case fm.Type.ARRAY:
      return value instanceof Array;

    case fm.Type.CHUNK:
      return value instanceof Buffer || typeof value === 'string';

    case fm.Type.NUMBER_ACCUMULATOR:
      return typeof value === 'number';

    case fm.Type.HASH_MAP:
      return value instanceof Object;
  }

  return false;
};


/**
 * @param {fm.Type} type
 * @return {fm.SymbolValue}
 */
fm.getDefaultValue = function(type) {
  switch (type) {
    case fm.Type.NUMBER:
      return 0;

    case fm.Type.STRING:
      return '';

    case fm.Type.BOOLEAN:
      return false;

    case fm.Type.ARRAY:
      return [];

    case fm.Type.CHUNK:
      return '';

    case fm.Type.HASH_MAP:
      return {};

    case fm.Type.FILE:
      return -1;

    case fm.Type.NUMBER_ACCUMULATOR:
      return new fm.NumberAccumulator(0);
  }

  return null;
};


/**
 * @param {string} name
 * @param {fm.Type} type
 * @param {(fm.Action|fm.SymbolValue)=} opt_initiator
 * @return {fm.SymbolAction}
 */
fm.let = function(name, type, opt_initiator) {
  /**
   * @param {function(fm.SymbolValue)} complete
   * @param {fm.Cancel} cancel
   * @param {fm.Input} input
   */
  function action(complete, cancel, input) {
    if (typeof opt_initiator === 'function') {
      opt_initiator(process, cancel, input);
    } else {
      process(input);
    }

    function process(value) {
      if (fm.typeof(value, type)) {
        createSymbol(value);
      } else {
        cancel('[fm.let] value is not ' + type + ': ' + value);
      }
    }

    function createSymbol(value) {
      if (typeof fm.__symbols[name] === 'undefined') {
        complete(fm.__symbols[name] = value);
      } else {
        cancel('[fm.let] symbol ' + name + ' already exists');
      }
    }
  }

  return action;
};


/**
 * @param {string} name
 * @param {(fm.Action|fm.SymbolValue)=} opt_initiator
 * @return {fm.SymbolAction}
 */
fm.letString = function(name, opt_initiator) {
  return fm.let(name, fm.Type.STRING, opt_initiator);
};


/**
 * @param {string} name
 * @param {(fm.Action|fm.SymbolValue)=} opt_initiator
 * @return {fm.SymbolAction}
 */
fm.letNumber = function(name, opt_initiator) {
  return fm.let(name, fm.Type.NUMBER, opt_initiator);
};


/**
 * @param {string} name
 * @param {(fm.Action|fm.SymbolValue)=} opt_initiator
 * @return {fm.SymbolAction}
 */
fm.letChunk = function(name, opt_initiator) {
  return fm.let(name, fm.Type.CHUNK, opt_initiator);
};


/**
 * @param {string} name
 * @param {(fm.Action|fm.SymbolValue)=} opt_initiator
 * @return {fm.SymbolAction}
 */
fm.letHashMap = function(name, opt_initiator) {
  return fm.let(name, fm.Type.HASH_MAP, opt_initiator);
};


/**
 * @param {string} name
 * @param {(fm.Action|fm.SymbolValue)=} opt_initiator
 * @return {fm.FileAction}
 */
fm.letFile = function(name, opt_initiator) {
  return fm.let(name, fm.Type.FILE, opt_initiator);
};


/**
 * @param {string} name
 * @param {(fm.Action|fm.SymbolValue)=} opt_initiator
 * @return {fm.SymbolAction}
 */
fm.letNumberAccumulator = function(name, opt_initiator) {
  return fm.let(name, fm.Type.NUMBER_ACCUMULATOR, opt_initiator);
};


/**
 * @param {fm.SymbolName} name
 * @return {fm.SymbolAction}
 */
fm.get = function(name) {
  /**
   * @param {function(fm.SymbolValue)} complete
   * @param {fm.Cancel} cancel
   * @param {fm.Input} input
   */
  function action(complete, cancel, input) {
    var symbol = fm.getSymbol(name);

    if (symbol !== null) {
      complete(symbol);
    } else {
      cancel('[fm.get] undefined symbol ' + name);
    }
  }

  return action;
};


/**
 * @param {string} name
 * @return {fm.RegularAction}
 */
fm.rem = function(name) {
  /**
   * @param {fm.Complete} complete
   * @param {fm.Cancel} cancel
   * @param {fm.Input} input
   */
  function action(complete, cancel, input) {
    if (fm.removeSymbol(name)) {
      complete(input);
    } else {
      cancel('[fm.rem] undefined symbol ' + name);
    }
  }

  return action;
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
 * @param {fm.UserType} type
 * @param {fm.ITypeProvider} provider
 */
fm.registerType = function(type, provider) {
  if (fm.__typeProviders[type] === null) {
    fm.__typeProviders[type] = provider;
  }
};


/**
 * @param {fm.UserType} type
 * @return {fm.ITypeProvider}
 */
fm.getTypeProvider = function(type) {
  return fm.__typeProviders[type] || null;
};


/**
 * @param {fm.DataSource} dataSource
 * @param {fm.UserType} type
 * @return {fm.Action|function(function(fm.Atom), function(string, number=), fm.Input)}
 */
fm.retrieve = function(dataSource, type) {
  /**
   * @param {function(fm.UserTypeValue)} complete
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
   * @param {function(fm.AtomValue)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input} input
   */
  function newString(complete, cancel, input) {
    fm.retrieve(source, fm.Atom.STRING)(complete, cancel, input);
  }

  return newString;
};


/**
 * @param {fm.DataSource} source
 * @return {fm.Action}
 */
fm.NUMBER = function(source) {
  function newNumber(complete, cancel, input) {
    fm.retrieve(source, fm.Atom.NUMBER)(complete, cancel, input);
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
  return fm.LIST(fm.Atom.STRING, source);
};


/**
 * @param {function(fm.Type)} complete
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


/**
 * @param {string} name
 * @param {(fm.Action|fm.SymbolValue)=} opt_initiator
 * @return {fm.RegularAction}
 */
fm.update = function(name, opt_initiator) {
  /**
   * @param {fm.Complete} complete
   * @param {fm.Cancel} cancel
   * @param {fm.Input} input
   */
  function update(complete, cancel, input) {
    if (typeof fm.__symbols[name] !== 'undefined') {
      if (typeof fm.__symbols[name][fm.OperationType.UPDATE] === 'function') {
        if (typeof opt_initiator !== 'undefined') {
          if (typeof opt_initiator === 'function') {
            opt_initiator(process, cancel, input);
          } else {
            process(opt_initiator);
          }
        } else {
          process();
        }
      } else {
        cancel('[fm.update] symbol ' + name + ' is not implements operation ' + fm.OperationType.UPDATE);
      }
    } else {
      cancel('[fm.update] symbol ' + name + ' is undefined');
    }

    /**
     * @param {fm.SymbolValue=} opt_value
     */
    function process(opt_value) {
      fm.__symbols[name][fm.OperationType.UPDATE](opt_value);
      complete(input);
    }
  }

  return update;
};


fm.registerType('List', new fm.ListProvider());
