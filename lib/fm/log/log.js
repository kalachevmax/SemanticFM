

/**
 * @param {string} text
 * @return {fm.Action}
 */
fm.log.message = function(text) {
  /**
   * @param {function(fm.Input)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input} input
   */
  function log(complete, cancel, input) {
    console.log(text);
    complete(input);
  }

  return log;
};


/**
 * @param {string} text
 * @return {fm.Action}
 */
fm.log.input = function(text) {
  /**
   * @param {function(fm.Input)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input} input
   */
  function log(complete, cancel, input) {
    console.log('[fm.log]', text, input);
    complete(input);
  }

  return log;
};


/**
 * @param {string} name
 * @return {fm.Action}
 */
fm.log.symbol = function(name) {
	/**
	 * @param {function(fm.Input)} complete
	 * @param {function(string, number=)} cancel
	 * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
	 */
	function log(complete, cancel, input, opt_context) {
		if (opt_context) {
			var value = opt_context.getSymbol(name);

			if (value !== null) {
				if (value instanceof fm.NumberAccumulator) {
					value = value.get();
				}

				console.log('[fm.log.symbol] ' + name + ':', value);
				complete(input);
			} else {
				cancel('[fm.log.symbol] symbol ' + name + ' is undefined');
			}
		} else {
			cancel('[fm.log.symbol] context is undefined');
		}
	}

	return log;
};


/**
 * @param {string=} opt_name
 * @return {fm.Action}
 */
fm.log.context = function(opt_name) {
	/**
	 * @param {function(fm.Input)} complete
	 * @param {function(string, number=)} cancel
	 * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
	 */
	function log(complete, cancel, input, opt_context) {
		if (opt_name !== undefined) {
			var context = fm.getContext(opt_name);

			if (context !== null) {
				dump(context);
			} else {
				cancel('[fm.log.context] context "' + opt_name + '" is undefined');
			}
		} else {
			if (opt_context !== undefined) {
				dump(opt_context);
			} else {
				cancel('[fm.log.context] current context is undefined');
			}
		}

		function dump(context) {
			console.log('[fm.log.context]' + (opt_name ? ' ' + opt_name : ''));

			context.forEachSymbol(function(name, value) {
				console.log(name, ':', value);
			});
		}

		complete(input);
	}

	return log;
};
