

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
 * @typedef {function(!Function, !Function, ?, !fm.ExecContext=)}
 */
fm.Action;


/**
 * @typedef {function(function(boolean), fm.Cancel, ?, !fm.ExecContext=)}
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
 * @typedef {function(fm.Complete, fm.Cancel, ?, !fm.ExecContext=)}
 */
fm.RegularAction;


/**
 * @typedef {function(function(string), fm.Cancel, fm.Input, !fm.ExecContext=)}
 */
fm.StringAction;


/**
 * @typedef {function(function(boolean), fm.Cancel, fm.Input, !fm.ExecContext=)}
 */
fm.BooleanAction;


/**
 * @typedef {function(function(number), fm.Cancel, fm.Input, !fm.ExecContext=)}
 */
fm.NumberAction;


/**
 * @typedef {function(function(stream.Chunk), fm.Cancel, fm.Input, !fm.ExecContext=)}
 */
fm.ChunkAction;


/**
 * @typedef {function(function(!Object), fm.Cancel, fm.Input, !fm.ExecContext=)}
 */
fm.HashMapAction;


/**
 * @typedef {function(function(fs.FileDescriptor), fm.Cancel, fm.Input, !fm.ExecContext=)}
 */
fm.FileAction;


/**
 * @typedef {function(function(fm.SymbolValue), fm.Cancel, fm.Input, !fm.ExecContext=)}
 */
fm.SymbolAction;


/**
 * @typedef {function(function(!fm.NumberAccumulator), fm.Cancel, fm.Input, !fm.ExecContext=)}
 */
fm.NumberAccumulatorAction;


/**
 * @typedef {string}
 */
fm.SymbolName;


/**
 * @typedef {string|number|boolean|Array|Object|stream.Chunk|fs.FileDescriptor|!fm.ExecContext|null}
 */
fm.SymbolValue;


/**
 * @typedef {!fm.Box.<fm.Type.ARRAY>}
 */
fm.ArrayBox;


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
 * @typedef {fm.SymbolValue|!fm.IBox}
 */
fm.BoxInput;


/**
 * @typedef {string|!fm.StringBox}
 */
fm.StringInput;


/**
 * @typedef {number|!fm.NumberBox}
 */
fm.NumberInput;


/**
 * @typedef {!Object|!fm.Box.<!Object>}
 */
fm.ObjectInput;


/**
 * @typedef {fs.FileDescriptor|!fm.Box.<fm.Type.FILE>}
 */
fm.FileInput;


/**
 * @typedef {stream.Chunk|!fm.Box.<fm.Type.CHUNK>}
 */
fm.ChunkInput;


/**
 * @typedef {!fm.ExecContext|!fm.ExecContextBox}
 */
fm.ExecContextInput;


/**
 * @typedef {fm.Action|!fm.IBox|fm.SymbolValue}
 */
fm.Initiator;


/**
 * @type {number}
 */
fm.__currentId = 0;


/**
 * @type {!Object.<string, !fm.ExecContext>}
 */
fm.__contexts = {};


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
 * @return {number}
 */
fm.nextId = function() {
	return fm.__currentId++;
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
 * @param {?} trueAction
 * @param {?=} opt_falseAction
 * @return {fm.Action}
 */
fm.if = function(condition, trueAction, opt_falseAction) {
  /**
   * @param {function(?)} complete
   * @param {function(string, number=)} cancel
   * @param {?} input
	 * @param {!fm.ExecContext=} opt_context
   */
  function cond(complete, cancel, input, opt_context) {
    condition(function(result) {
      if (result) {
        trueAction(complete, cancel, input, opt_context);
      } else {
        if (typeof opt_falseAction === 'function') {
          opt_falseAction(complete, cancel, input, opt_context);
        } else {
          complete(input);
        }
      }
    }, cancel, input, opt_context);
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
	 * @param {!fm.ExecContext=} opt_context
   */
  function check(complete, cancel, input, opt_context) {
    condition(function(result) {
      if (result) {
        complete(input);
      } else {
        handleStopped(input);
      }
    }, cancel, input, opt_context);
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
	 * @param {!fm.ExecContext=} opt_context
   */
  function statement(complete, cancel, input, opt_context) {
    function loop(localComplete, localCancel, localInput) {
      fm.acts.fold([
        fm.check(condition, localComplete),
        script
      ])(function(localInput) {
        loop(localComplete, localCancel, localInput);
      }, localCancel, localInput, opt_context);
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
	 * @param {!Function} complete
	 * @param {fm.Cancel} cancel
	 * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
	 */
	function action(complete, cancel, input, opt_context) {
		var context = new fm.ExecContext(true);

		if (opt_context && opt_context.isMergeable()) {
			context.mergeWith(opt_context);
		}

		fm.acts.fold(script)(function(result) {
			context.destroy();
			complete(result);
		}, cancel, input, context);
	}

	return action;
};


/**
 * @param {fm.Script} script
 * @return {fm.Action}
 */
fm.parallel = function(script) {
	return fm.acts.fork(script);
};


/**
 * @param {string} name
 * @param {fm.Script} populateScript
 * @return {fm.RegularAction}
 */
fm.context = function(name, populateScript) {
	/**
	 * @param {fm.Complete} complete
	 * @param {fm.Cancel} cancel
	 * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
	 */
	function action(complete, cancel, input, opt_context) {
		if (fm.__contexts[name] === undefined) {
			fm.__contexts[name] = new fm.ExecContext(true);

      if (opt_context !== undefined) {
        fm.__contexts[name].mergeWith(opt_context);
      }

			fm.acts.fold(populateScript)(function() {
				complete(input);
			}, cancel, input, fm.__contexts[name]);
		} else {
			cancel('[fm.letContext] context "' + name + '" already exists');
		}
	}

	return action;
};


/**
 * @param {string} name
 * @return {fm.RegularAction}
 */
fm.removeContext = function(name) {
	/**
	 * @param {fm.Complete} complete
	 * @param {fm.Cancel} cancel
	 * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
	 */
	function action(complete, cancel, input, opt_context) {
		if (fm.__contexts[name] !== undefined) {
			delete fm.__contexts[name];
			complete(input);
		} else {
			cancel('[fm.removeContext] context "' + name + '" is undefined');
		}
	}

	return action;
};


/**
 * @param {?} action
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
 * @param {*} value
 * @return {fm.Action|function(function(*), fm.Cancel, fm.Input)}
 */
fm.complete = function(value) {
  /**
   * @param {function(*)} localComplete
   * @param {fm.Cancel} localCancel
   * @param {fm.Input} input
   */
  function action(localComplete, localCancel, input) {
    localComplete(value);
  }

  return action;
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
 * @param {?} conditionAction
 * @return {fm.ConditionAction|function(function(boolean), fm.Cancel, fm.Input)}
 */
fm.not = function(conditionAction) {
  /**
   * @param {function(boolean)} complete
   * @param {fm.Cancel} cancel
   * @param {fm.Input} input
   */
  function not(complete, cancel, input) {
    conditionAction(function(result) {
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
 */
fm.notEmpty = function(action) {
  /**
   * @param {function(boolean)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Action} input
	 * @param {!fm.ExecContext=} opt_context
   */
  function notEmpty(complete, cancel, input, opt_context) {
    action(function(result) {
      if (typeof result === 'string' && result !== '' ||
          typeof result === 'object' && result !== null) {
        complete(true);
      } else {
        complete(false);
      }
    }, cancel, input, opt_context);
  }

  return notEmpty;
};


/**
 * @param {fm.Action} action
 * @return {fm.BooleanAction}
 */
fm.notNull = function(action) {
  /**
   * @param {function(boolean)} complete
   * @param {fm.Cancel} cancel
   * @param {fm.Input} input
   */
  function notNull(complete, cancel, input) {
    action(function(result) {
      if (result !== null) {
        complete(true);
      } else {
        complete(false);
      }
    }, cancel, input);
  }

  return notNull;
};


/**
 * @param {fm.Action} action
 */
fm.isTrue = function(action) {
  /**
   * @param {function(boolean)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Action} input
   */
  function isTrue(complete, cancel, input) {
    action(function(result) {
      if (typeof result === 'boolean' && result === true) {
        complete(true);
      } else {
        complete(false);
      }
    }, cancel, input);
  }

  return isTrue;
};


/**
 * @param {fm.Action} action
 */
fm.isFalse = function(action) {
  /**
   * @param {function(boolean)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Action} input
   */
  function isFalse(complete, cancel, input) {
    action(function(result) {
      if (typeof result === 'boolean' && result === false) {
        complete(true);
      } else {
        complete(false);
      }
    }, cancel, input);
  }

  return isFalse;
};


/**
 * @param {fm.Type} type
 * @param {fm.Action} action
 * @return {fm.BooleanAction}
 */
fm.is = function(type, action) {
  /**
   * @param {function(boolean)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Action} input
   */
  function is(complete, cancel, input) {
    action(function(result) {
      if (fm.typeof(result, type)) {
        complete(true);
      } else {
				complete(false);
      }
    }, cancel, input);
  }

  return is;
};


/**
 * @param {fm.Action} action
 * @return {fm.BooleanAction}
 */
fm.isArray = function(action) {
  return fm.is(fm.Type.ARRAY, action);
};


/**
 * @param {fm.Action} action
 */
fm.notEmptyString = function(action) {
  /**
   * @param {function(boolean)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Action} input
   */
  function notEmptyString(complete, cancel, input) {
    action(function(result) {
      if (typeof result === 'string' && result !== '') {
        complete(true);
      } else {
        complete(false);
      }
    }, cancel, input);
  }

  return notEmptyString;
};


/**
 * @param {function(boolean)} complete
 * @param {fm.Cancel} cancel
 * @param {fm.Input} input
 */
fm.inputNotNull = function(complete, cancel, input) {
  if (input !== null) {
    complete(true);
  } else {
    complete(false);
  }
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
 * @param {fm.Action} action
 * @param {fm.Input=} opt_actionInput
 * @return {fm.RegularAction}
 */
fm.apply = function(action, opt_actionInput) {
  /**
   * @param {fm.Complete} complete
   * @param {fm.Cancel} cancel
   * @param {fm.Input} input
   */
  function apply(complete, cancel, input) {
    action(complete, cancel, opt_actionInput || null);
  }

  return apply;
};


/**
 * @param {fm.Action} action
 * @param {fm.Input=} opt_actionInput
 * @return {fm.RegularAction}
 */
fm.pass = function(action, opt_actionInput) {
  /**
   * @param {fm.Complete} complete
   * @param {fm.Cancel} cancel
   * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
   */
  function pass(complete, cancel, input, opt_context) {
    action(function() {
      complete(input);
    }, cancel, opt_actionInput || null, opt_context);
  }

  return pass;
};


/**
 * @param {fm.Input} value
 * @return {fm.RegularAction}
 */
fm.use = function(value) {
  /**
   * @param {fm.Complete} complete
   * @param {fm.Cancel} cancel
   * @param {fm.Input} input
   */
  function use(complete, cancel, input) {
    complete(value);
  }

  return use;
};


/**
 * @param {fm.Action} action
 * @param {string} message
 * @param {fm.Input=} opt_input
 */
fm.logInvoke = function(action, message, opt_input) {
  action(function() {
    console.log(message);
  }, console.error, opt_input || null);
};


/**
 * @param {string} key
 * @return {fm.Action|function(function(*), fm.Cancel, !Object)}
 */
fm.extractFromObject = function(key) {
  /**
   * @param {function(*)} complete
   * @param {fm.Cancel} cancel
   * @param {!Object} object
   */
  function extractFromObject(complete, cancel, object) {
    if (object instanceof Object) {
      complete(object[key]);
    } else {
      cancel('[fm.extractFromObject] ' + object + ' is not object');
    }
  }

  return extractFromObject;
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

    case fm.Type.FILE:
      return typeof value === 'number';
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
 * @param {fm.Initiator=} opt_initiator
 * @return {fm.SymbolAction}
 */
fm.let = function(name, type, opt_initiator) {
  /**
   * @param {function(fm.SymbolValue)} complete
   * @param {fm.Cancel} cancel
   * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
   */
  function action(complete, cancel, input, opt_context) {
		if (typeof opt_initiator !== 'undefined') {
      if (typeof opt_initiator === 'function') {
        opt_initiator(process, cancel, input, opt_context);
      } else {
        process(fm.unbox(opt_initiator, opt_context));
      }
    } else {
      process(input);
    }

    function process(value) {
			if (fm.typeof(value, type)) {
        createSymbol(value);
      } else {
        cancel('[fm.let] ' + name + ': value is not ' + type + ' (' + JSON.stringify(value) + ')');
      }
    }

    function createSymbol(value) {
			if (opt_context !== undefined) {
				if (!opt_context.hasSymbol(name)) {
					complete(opt_context.addSymbol(name, type, value));
				} else {
					complete(opt_context.updateSymbol(name, value));
				}
			} else {
				cancel('[fm.let] ' + name + ': context is undefined');
			}
    }
  }

  return action;
};


/**
 * @param {string} name
 * @param {fm.Type} type
 * @param {!Function=} opt_initiator
 * @return {fm.SymbolAction}
 */
fm.set = function(name, type, opt_initiator) {
  /**
   * @param {function(fm.SymbolValue)} complete
   * @param {fm.Cancel} cancel
   * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
   */
  function action(complete, cancel, input, opt_context) {
    if (typeof opt_initiator === 'function') {
      process(opt_initiator());
    } else {
      process(input);
    }

    function process(value) {
      if (fm.typeof(value, type)) {
        createSymbol(value);
      } else {
        cancel('[fm.set] value is not ' + type + ': ' + value);
      }
    }

    function createSymbol(value) {
			if (opt_context !== undefined) {
				if (!opt_context.hasSymbol(name)) {
					complete(opt_context.addSymbol(name, type, value));
				} else {
					cancel('[fm.set] symbol ' + name + ' already exists');
				}
			} else {
				cancel('[fm.set] ' + name + ': context is undefined');
			}
		}
  }

  return action;
};


/**
 * @param {string} name
 * @param {fm.Initiator=} opt_initiator
 * @return {fm.SymbolAction}
 */
fm.letString = function(name, opt_initiator) {
  return fm.let(name, fm.Type.STRING, opt_initiator);
};


/**
 * @param {string} name
 * @param {fm.Initiator=} opt_initiator
 * @return {fm.SymbolAction}
 */
fm.letNumber = function(name, opt_initiator) {
  return fm.let(name, fm.Type.NUMBER, opt_initiator);
};


/**
 * @param {string} name
 * @param {fm.Initiator=} opt_initiator
 * @return {fm.FileAction}
 */
fm.letArray = function(name, opt_initiator) {
	return fm.let(name, fm.Type.ARRAY, opt_initiator);
};


/**
 * @param {string} name
 * @param {fm.Initiator=} opt_initiator
 * @return {fm.SymbolAction}
 */
fm.letChunk = function(name, opt_initiator) {
  return fm.let(name, fm.Type.CHUNK, opt_initiator);
};


/**
 * @param {string} name
 * @param {fm.Initiator=} opt_initiator
 * @return {fm.SymbolAction}
 */
fm.letHashMap = function(name, opt_initiator) {
  return fm.let(name, fm.Type.HASH_MAP, opt_initiator);
};


/**
 * @param {string} name
 * @param {fm.Initiator=} opt_initiator
 * @return {fm.FileAction}
 */
fm.letFile = function(name, opt_initiator) {
  return fm.let(name, fm.Type.FILE, opt_initiator);
};


/**
 * @param {string} name
 * @param {fm.Initiator=} opt_initiator
 * @return {fm.SymbolAction}
 */
fm.letNumberAccumulator = function(name, opt_initiator) {
  return fm.let(name, fm.Type.NUMBER_ACCUMULATOR, opt_initiator);
};


/**
 * @param {string} name
 * @param {!Function=} opt_initiator
 * @return {fm.SymbolAction}
 */
fm.setString = function(name, opt_initiator) {
  return fm.set(name, fm.Type.STRING, opt_initiator);
};


/**
 * @param {string} name
 * @param {!Function=} opt_initiator
 * @return {fm.SymbolAction}
 */
fm.setNumber = function(name, opt_initiator) {
  return fm.set(name, fm.Type.NUMBER, opt_initiator);
};


/**
 * @param {string} name
 * @param {!Function=} opt_initiator
 * @return {fm.SymbolAction}
 */
fm.setChunk = function(name, opt_initiator) {
  return fm.set(name, fm.Type.CHUNK, opt_initiator);
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
	 * @param {!fm.ExecContext=} opt_context
   */
  function action(complete, cancel, input, opt_context) {
		if (opt_context !== undefined) {
			var symbol = opt_context.getSymbol(name);

			if (symbol !== null) {
				complete(symbol);
			} else {
				cancel('[fm.get] undefined symbol ' + name);
			}
		} else {
			cancel('[fm.get] ' + name + ': context is undefined');
		}
  }

  return action;
};


/**
 * @param {string|fm.SymbolValue} nameOrValue
 * @return {!fm.Box}
 */
fm.box = function(nameOrValue) {
  return new fm.Box(nameOrValue);
};


/**
 * @param {string|number|!Array.<fm.IBox>} nameOrValueOrBoxes
 * @param {fm.BoxOperation=} opt_operation
 * @return {!fm.NumberBox}
 */
fm.number = function(nameOrValueOrBoxes, opt_operation) {
  return new fm.NumberBox(nameOrValueOrBoxes, opt_operation);
};


/**
 * @param {string|!Array.<fm.IBox>} nameOrValueOrBoxes
 * @param {fm.BoxOperation=} opt_operation
 * @return {!fm.StringBox}
 */
fm.string = function(nameOrValueOrBoxes, opt_operation) {
  return new fm.StringBox(nameOrValueOrBoxes, opt_operation);
};


/**
 * @param {string} name
 * @return {!fm.ExecContextBox}
 */
fm.execContext = function(name) {
	return new fm.ExecContextBox(name);
};


/**
 * @param {!Array.<!fm.StringBox>} boxes
 * @return {!fm.StringBox}
 */
fm.concatBox = function(boxes) {
  return new fm.StringBox(boxes, fm.BoxOperation.CONCAT);
};


/**
 * @param {!Array.<fm.NumberBox>} boxes
 * @return {!fm.NumberBox}
 */
fm.sumBox = function(boxes) {
  return new fm.NumberBox(boxes, fm.BoxOperation.SUM);
};


/**
 * @param {!fm.StringBox|!fm.ArrayBox} box
 * @return {!fm.NumberBox}
 */
fm.len = function(box) {
  return new fm.NumberBox([box], fm.BoxOperation.LENGTH);
};


/**
 * @param {fm.BoxInput} valueOrBox
 * @param {!fm.ExecContext=} opt_context
 * @return {fm.SymbolValue}
 */
fm.unbox = function(valueOrBox, opt_context) {
  return (valueOrBox instanceof fm.Box ||
		valueOrBox instanceof fm.NumberBox ||
		valueOrBox instanceof fm.StringBox) ? valueOrBox.get(opt_context) : valueOrBox;
};


/**
 * @param {fm.NumberInput} valueOrBox
 * @param {!fm.ExecContext=} opt_context
 * @return {number}
 */
fm.unboxNumber = function(valueOrBox, opt_context) {
	return valueOrBox instanceof fm.NumberBox ? valueOrBox.get(opt_context) : valueOrBox;
};


/**
 * @param {fm.StringInput} valueOrBox
 * @param {!fm.ExecContext=} opt_context
 * @return {string}
 */
fm.unboxString = function(valueOrBox, opt_context) {
	return valueOrBox instanceof fm.StringBox ? valueOrBox.get(opt_context) : valueOrBox;
};


/**
 * @param {fm.ObjectInput} valueOrBox
 * @param {!fm.ExecContext=} opt_context
 * @return {!Object}
 */
fm.unboxObject = function(valueOrBox, opt_context) {
	return valueOrBox instanceof fm.Box ? valueOrBox.get(opt_context) : valueOrBox;
};


/**
 * @param {fm.ChunkInput} valueOrBox
 * @param {!fm.ExecContext=} opt_context
 * @return {stream.Chunk}
 */
fm.unboxChunk = function(valueOrBox, opt_context) {
	return valueOrBox instanceof fm.Box ? valueOrBox.get(opt_context) : valueOrBox;
};


/**
 * @param {!Array.<fm.BoxInput>} array
 * @param {!fm.ExecContext=} opt_context
 * @return {!Array.<*>}
 */
fm.unboxArray = function(array, opt_context) {
  var result = [];

  var i = 0,
      l = array.length;

  while (i < l) {
    result.push(fm.unbox(array[i], opt_context));
    i += 1;
  }

  return result;
};


/**
 * @param {string} hashMapName
 * @param {string} contextName
 * @param {fm.Action} keyAction
 * @return {fm.StringAction}
 */
fm.addKey = function(hashMapName, contextName, keyAction) {
  /**
   * @param {function(string)} complete
   * @param {fm.Cancel} cancel
   * @param {fm.SymbolValue} value
	 * @param {!fm.ExecContext=} opt_context
   */
  function addKey(complete, cancel, value, opt_context) {
    keyAction(function(key) {
			var context = fm.getContext(contextName);

			if (context !== null) {
				if (context.hasSymbol(hashMapName)) {
					context.getSymbol(hashMapName)[key] = value;
					complete(key);
				} else {
					cancel('[fm.addKey] HashMap ' + hashMapName + 'does not exists');
				}
			} else {
				cancel('[fm.getValue] ' + hashMapName + ': context "' + contextName + '" is undefined');
			}
    }, cancel, value, opt_context);
  }

  return addKey;
};


/**
 * @param {string} hashMapName
 * @return {fm.SymbolAction}
 */
fm.getValue = function(hashMapName) {
  /**
   * @param {function(fm.SymbolValue)} complete
   * @param {fm.Cancel} cancel
   * @param {string} key
	 * @param {!fm.ExecContext=} opt_context
	 */
  function action(complete, cancel, key, opt_context) {
		if (opt_context !== undefined) {
			if (opt_context.hasSymbol(hashMapName)) {
				complete(opt_context.getSymbol(hashMapName)[key]);
			} else {
				cancel('[fm.getValue] HashMap "' + hashMapName + '" does not exists');
			}
		} else {
			cancel('[fm.getValue] ' + hashMapName + ': context is undefined');
		}
  }

  return action;
};


/**
 * @param {fm.ObjectInput} hashMapInput
 * @param {fm.StringInput} keyInput
 * @param {fm.BoxInput} valueInput
 * @return {fm.HashMapAction}
 */
fm.updateHashMap = function(hashMapInput, keyInput, valueInput) {
	/**
	 * @param {function(!Object)} complete
	 * @param {fm.Cancel} cancel
	 * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
	 */
	function action(complete, cancel, input, opt_context) {
		var hashMap = fm.unboxObject(hashMapInput, opt_context);
		hashMap[fm.unboxString(keyInput, opt_context)] = fm.unbox(valueInput, opt_context);
		complete(hashMap);
	}

	return action;
};


/**
 * @param {*} data
 * @return {boolean}
 */
fm.isChunk = function(data) {
  return data instanceof Buffer || typeof data === 'string';
};


/**
 * @param {string} name
 * @param {(fm.Action|fm.BoxInput)=} opt_initiator
 * @return {fm.RegularAction}
 */
fm.update = function(name, opt_initiator) {
  /**
   * @param {fm.Complete} complete
   * @param {fm.Cancel} cancel
   * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
	 */
  function update(complete, cancel, input, opt_context) {
		if (opt_context !== undefined) {
			if (opt_context.hasSymbol(name)) {
				if (opt_context.isSymbolImplements(name, fm.OperationType.UPDATE)) {
					if (typeof opt_initiator !== 'undefined') {
						if (typeof opt_initiator === 'function') {
							opt_initiator(process, cancel, input, opt_context);
						} else {
							process(fm.unbox(opt_initiator, opt_context));
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
		} else {
			cancel('[fm.update] ' + name + ': context is undefined');
		}

    /**
     * @param {fm.SymbolValue=} opt_value
     */
    function process(opt_value) {
			opt_context.getSymbol(name)[fm.OperationType.UPDATE](opt_value);
      complete(input);
    }
  }

  return update;
};


/**
 * @param {string} name
 * @param {string} contextName
 * @param {fm.Action|fm.BoxInput} initiator
 * @return {fm.RegularAction}
 */
fm.updateSymbol = function(name, contextName, initiator) {
	/**
	 * @param {fm.Complete} complete
	 * @param {fm.Cancel} cancel
	 * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
	 */
	function action(complete, cancel, input, opt_context) {
		var context = fm.getContext(contextName);

		if (context !== null) {
			if (context.hasSymbol(name)) {
				if (typeof initiator === 'function') {
					initiator(process, cancel, input, opt_context);
				} else {
					process(fm.unbox(initiator, opt_context));
				}
			} else {
				cancel('[fm.updateSymbol] symbol "' + name + '" is undefined on context "' + contextName + '"');
			}
		} else {
			cancel('[fm.updateSymbol] context "' + contextName + '" is undefined');
		}

		function process(value) {
			if (context.isSymbolImplements(name, fm.OperationType.UPDATE)) {
				context.getSymbol(name)[fm.OperationType.UPDATE](value);
			} else {
				context.updateSymbol(name, value);
			}

			complete(input);
		}
	}

	return action;
};


/**
 * @param {string} name
 * @param {string} contextName
 * @return {fm.RegularAction}
 */
fm.incrSymbol = function(name, contextName) {
	/**
	 * @param {fm.Complete} complete
	 * @param {fm.Cancel} cancel
	 * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
	 */
	function action(complete, cancel, input, opt_context) {
		var context = fm.getContext(contextName);

		if (context !== null) {
			if (context.hasSymbol(name)) {
				process(1);
			} else {
				cancel('[fm.updateSymbol] symbol "' + name + '" is undefined on context "' + contextName + '"');
			}
		} else {
			cancel('[fm.updateSymbol] context "' + contextName + '" is undefined');
		}

		function process(value) {
			context.getSymbol(name)[fm.OperationType.UPDATE](value);
			complete(input);
		}
	}

	return action;
};


/**
 * @param {fm.BoxInput} box1
 * @param {fm.BoxInput} box2
 * @return {fm.ConditionAction}
 */
fm.lt = function(box1, box2) {
  /**
   * @param {function(boolean)} complete
   * @param {fm.Cancel} cancel
   * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
   */
  function action(complete, cancel, input, opt_context) {
    complete(fm.unbox(box1, opt_context) < fm.unbox(box2, opt_context));
  }

  return action;
};


/**
 * @param {fm.BoxInput} box1
 * @param {fm.BoxInput} box2
 * @return {fm.ConditionAction}
 */
fm.lte = function(box1, box2) {
	/**
	 * @param {function(boolean)} complete
	 * @param {fm.Cancel} cancel
	 * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
	 */
	function action(complete, cancel, input, opt_context) {
		complete(fm.unbox(box1, opt_context) <= fm.unbox(box2, opt_context));
	}

	return action;
};


/**
 * @param {fm.BoxInput} box1
 * @param {fm.BoxInput} box2
 * @return {fm.ConditionAction}
 */
fm.gt = function(box1, box2) {
	/**
	 * @param {function(boolean)} complete
	 * @param {fm.Cancel} cancel
	 * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
	 */
	function action(complete, cancel, input, opt_context) {
		complete(fm.unbox(box1, opt_context) > fm.unbox(box2, opt_context));
	}

	return action;
};


/**
 * @param {fm.BoxInput} box1
 * @param {fm.BoxInput} box2
 * @return {fm.ConditionAction}
 */
fm.gte = function(box1, box2) {
	/**
	 * @param {function(boolean)} complete
	 * @param {fm.Cancel} cancel
	 * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
	 */
	function action(complete, cancel, input, opt_context) {
		complete(fm.unbox(box1, opt_context) >= fm.unbox(box2, opt_context));
	}

	return action;
};


/**
 * @param {fm.BoxInput} box1
 * @param {fm.BoxInput} box2
 * @return {fm.ConditionAction}
 */
fm.eq = function(box1, box2) {
	/**
	 * @param {function(boolean)} complete
	 * @param {fm.Cancel} cancel
	 * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
	 */
	function action(complete, cancel, input, opt_context) {
		complete(fm.unbox(box1, opt_context) == fm.unbox(box2, opt_context));
	}

	return action;
};


/**
 * @param {fm.BoxInput} box1
 * @param {fm.BoxInput} box2
 * @return {fm.ConditionAction}
 */
fm.notEq = function(box1, box2) {
	/**
	 * @param {function(boolean)} complete
	 * @param {fm.Cancel} cancel
	 * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
	 */
	function action(complete, cancel, input, opt_context) {
		complete(fm.unbox(box1, opt_context) !== fm.unbox(box2, opt_context));
	}

	return action;
};


/**
 * @param {!Function} func
 * @param {!Array} args
 * @param {(!fm.ExecContext|!Function)=} opt_contextOrCallback
 * @param {!Function=} opt_callback
 */
fm.do = function(func, args, opt_contextOrCallback, opt_callback) {
	var resultArgs = [];
	var context = undefined;
	var callback = null;

	if (opt_contextOrCallback !== undefined) {
		if (typeof opt_contextOrCallback === 'function') {
			callback = opt_contextOrCallback;
		} else {
			context = opt_contextOrCallback;

			if (opt_callback !== undefined) {
				callback = opt_callback;
			}
		}
	}

	for (var i = 0, l = args.length; i < l; i += 1) {
		resultArgs.push(fm.unbox(args[i], context));
	}

	if (callback !== null) {
		resultArgs.push(callback);
	}

	console.log('fm.do:', resultArgs);

	func.apply(this, resultArgs);
};


/**
 * @param {!Function} decoratedAction
 * @param {!Array} args
 * @param {fm.Complete} complete
 * @param {fm.Cancel} cancel
 * @param {fm.Input} input
 * @param {!fm.ExecContext=} opt_context
 */
fm.act = function(decoratedAction, args, complete, cancel, input, opt_context) {
	var resultArgs = [];

	for (var i = 0, l = args.length; i < l; i += 1) {
		resultArgs.push(fm.unbox(args[i], opt_context));
	}

	var action = decoratedAction.apply(this, resultArgs);
	action(complete, cancel, input, opt_context);
};


/**
 * @param {fm.BoxInput} boxInput
 * @return {fm.SymbolAction}
 */
fm.return = function(boxInput) {
	/**
	 * @param {function(fm.SymbolValue)} complete
	 * @param {fm.Cancel} cancel
	 * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
	 */
	function action(complete, cancel, input, opt_context) {
		complete(fm.unbox(boxInput, opt_context));
	}

	return action;
};


/**
 * @param {string} name
 * @return {fm.ExecContext}
 */
fm.getContext = function(name) {
	return fm.__contexts[name] || null;
};


/**
 * @param {fm.Action} action
 * @param {string} contextName
 * @return {fm.Action}
 */
fm.bind = function(action, contextName) {
	/**
	 * @param {fm.Action} complete
	 * @param {fm.Cancel} cancel
	 * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
	 */
	function bind(complete, cancel, input, opt_context) {
		var context = fm.getContext(contextName);

		if (context !== null) {
			action(complete, cancel, input, context);
		} else {
			cancel('[fm.bind] context "' + contextName + '" does not exists');
		}
	}

	return bind;
};


/**
 * @param {fm.Action} action
 * @return {fm.Action}
 */
fm.bindCurrent = function(action) {
	/**
	 * @param {fm.Action} complete
	 * @param {fm.Cancel} cancel
	 * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
	 */
	function bind(complete, cancel, input, opt_context) {
		action(complete, cancel, input, opt_context);
	}

	return bind;
};


/**
 * @param {string} name
 * @param {!fm.ExecContext=} opt_context
 * @return {fm.SymbolValue}
 */
fm.getSymbol = function(name, opt_context) {
	if (opt_context !== undefined) {
		return opt_context.getSymbol(name);
	}

	return fm.__contexts[name] || null;
};


/**
 * @param {string=} opt_key
 * @return {fm.SymbolAction}
 */
fm.input = function(opt_key) {
	/**
	 * @param {function(fm.SymbolValue)} complete
	 * @param {fm.Cancel} cancel
	 * @param {fm.Input} input
	 * @param {fm.ExecContext=} opt_context
	 */
	function action(complete, cancel, input, opt_context) {
		if (opt_key !== undefined) {
			complete(input[opt_key]);
		} else {
			complete(input);
		}
	}

	return action;
};


/**
 * @param {string} name
 * @return {fm.SymbolAction}
 */
fm.inputMethod = function(name) {
	/**
	 * @param {function(fm.SymbolValue)} complete
	 * @param {fm.Cancel} cancel
	 * @param {fm.Input} input
	 * @param {fm.ExecContext=} opt_context
	 */
	function action(complete, cancel, input, opt_context) {
		if (typeof input[name] === 'function') {
			complete(input[name]());
		} else {
			cancel('[fm.inputMethod] unknown method "' + name + '"');
		}
	}

	return action;
};


/**
 * @param {function(fm.Input)} body
 */
fm.action = function(body) {
	/**
	 * @param {function(fm.Input)} complete
	 * @param {fm.Cancel} cancel
	 * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
	 */
	function action(complete, cancel, input, opt_context) {
		var result = body(input);
		if (result === undefined) {
			complete(input);
		} else {
			complete(result);
		}
	}

	return action;
};


/**
 * @param {function(*)} complete
 * @param {fm.Cancel} cancel
 * @param {!Array} arr
 */
fm.getFirst = function(complete, cancel, arr) {
	if (arr.length > 0) {
		complete(arr[0]);
	} else {
		cancel('[fm.getFirst] array is empty');
	}
};
