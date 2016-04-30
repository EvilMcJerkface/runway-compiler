"use strict";

let Environment = require('../environment.js').Environment;
let Statement = require('./statement.js');
let makeStatement = require('./factory.js');
let errors = require('../errors.js');

class Rule extends Statement {
  constructor(parsed, env) {
    super(parsed, env);
    this.external = this.parsed.subkind === 'external';
    this.inner = makeStatement.make(this.parsed.code, this.env);
    this.env.assignRule(this.parsed.id.value, this);
  }

  typecheck() {
    this.inner.typecheck();
  }

  execute() {
    // do nothing
  }

  fire(context) {
    try {
      this.inner.execute(context);
    } catch ( e ) {
      if (e instanceof errors.Return) {
        return;
      } else {
        throw e;
      }
    }
  }

  toString(indent) {
    return `${indent}rule ${this.parsed.id.value} {
${this.inner.toString(indent + '  ')}
}`;
  }
}

module.exports = Rule;
