

/**
 * @typedef {*}
 */
just.fm.Atom;


/**
 * @typedef {!Array.<just.fm.Atom>}
 */
just.fm.List;


/**
 * @typedef {function(just.fm.Atom)}
 */
just.fm.Complete;


/**
 * @typedef {function(string, number=)}
 */
just.fm.Cancel;


/**
 * @typedef {function(just.fm.Atom, just.fm.Complete, just.fm.Cancel)}
 */
just.fm.Action;


/**
 * @typedef {!Array.<just.fm.Action>}
 */
just.fm.Script;


/**
 * @param {just.fm.Action} action
 * @param {just.fm.Action} trueBranch
 * @param {just.fm.Action=} opt_falseBranch
 * @return {just.fm.Action}
 */
just.fm.if = function(action, trueBranch, opt_falseBranch) {
  return function(atom, complete, cancel) {
    var context = this;

    action(atom, function(result) {
      if (result) {
        trueBranch.call(context, atom, complete, cancel);
      } else {
        if (typeof opt_falseBranch === 'function') {
          opt_falseBranch.call(context, atom, complete, cancel);
        } else {
          complete(atom);
        }
      }
    }, just.utils.nop);
  }
};


/**
 * @param {just.fm.Action} condition
 * @param {just.fm.Action} handleStopped
 * @return {just.fm.Action}
 */
just.fm.check = function(condition, handleStopped) {
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
 * @param {just.fm.Action} condition
 * @param {just.fm.Action} script
 * @return {just.fm.Action}
 */
just.fm.while = function(condition, script) {
  return function(atom, complete, cancel) {
    var context = this;

    function loop(localAtom, localComplete, localCancel) {
      just.fm.script.fold([
        just.fm.check(condition, localComplete),
        script
      ]).call(context, localAtom, function(localAtom) {
        loop.call(context, localAtom, localComplete, localCancel);
      }, localCancel);
    }

    loop.call(this, atom, complete, cancel);
  }
};


/**
 * @param {just.fm.Script} script
 * @param {just.fm.Script} reverseScript
 * @return {just.fm.Action}
 */
just.fm.transact = function(script, reverseScript) {
  var context = this;
  var actionNo = 0;

  function incActionNo(_, complete, cancel) {
    actionNo += 1;
    complete();
  }

  return function(atom, complete, cancel) {
    just.fm.script.wrap(script, incActionNo).call(this, atom, complete, function() {
      just.fm.script.fold(reverseScript, actionNo).call(context, atom, cancel, cancel);
    });
  }
};


/**
 * @param {just.fm.Script} script
 * @return {just.fm.Action}
 */
just.fm.script = function(script) {
  return just.fm.script.fold(script);
};


/**
 * @param {just.fm.List} list
 * @return {just.fm.Action}
 */
just.fm.map = function(list) {
  return just.fm.list.fold(list);
};
