'use strict';

let assert = require('assert');
let environment = require('../lib/environment.js');
let Environment = environment.Environment;
let GlobalEnvironment = environment.GlobalEnvironment;
let Input = require('../lib/input.js');
let compiler = require('../lib/compiler.js');
let fs = require('fs');

let inline = (text) => new Input('unit test', text);
let readFile = (filename) => fs.readFileSync(filename).toString();
let loadPrelude = () => compiler.loadPrelude(readFile('lib/prelude.model'));

describe('compiler.js', function() {

  describe('alias', function() {
    it('missing', function() {
      let code = inline(`
        type FailBoat: WhatIsThis;
      `);
      let env = new Environment();
      assert.throws(() => {
        compiler.load(code, env);
      });
    });

    it('basic', function() {
      let code = inline(`
        type Boolean: either { False, True };
        type Truthful: Boolean;
      `);
      let env = new Environment();
      compiler.load(code, env);
      let value = env.getType('Truthful').makeDefaultValue();
      assert.equal(value.toString(), 'False');
    });
  });

  describe('loadPrelude', function() {
    it('prelude loads', function() {
      let prelude = loadPrelude().env;
      let booleanType = prelude.getType('Boolean');
      let booleanValue = booleanType.makeDefaultValue();
      assert.equal(booleanValue, 'False');
    });
  }); // loadPrelude

  describe('params', function() {
    it('basic', function() {
      let code = inline('param ELEVATORS: 1..1024 = 6;');
      let env = new Environment();
      let module = compiler.load(code, env);
      let context = {};
      module.ast.execute(context);
      assert.equal(env.getVar('ELEVATORS').toString(), '6');
    });
  });

  describe('variable declarations', function() {
    it('basic', function() {
      let code = inline(`
        var foo: 0..10 = 8;
        var bar: 11..20;
      `);
      let env = new Environment();
      let module = compiler.load(code, env);
      let context = {};
      module.ast.execute(context);
      assert.equal(env.getVar('foo').toString(), '8');
      assert.equal(env.getVar('bar').toString(), '11');
    });

    it('array', function() {
      let code = inline(`
        var bitvector: Array<Boolean>[11..13];
      `);
      let env = new Environment(loadPrelude().env);
      compiler.load(code, env);
      assert.equal(env.getVar('bitvector').toString(),
        '[11: False, 12: False, 13: False]');
    });

  });


  describe('code evaluation', function() {
    it('basic', function() {
      let prelude = loadPrelude();
      let env = new GlobalEnvironment(prelude.env);
      let code = inline(`
        var x : Boolean;
        var y : 1..3;
        rule foo {
          x = True;
          y = 2;
        }
      `);
      let module = compiler.load(code, env);
      let context = {};
      module.ast.execute(context);
      env.getRule('foo').fire(context);
      assert.equal(env.getVar('x').toString(), 'True');
      assert.equal(env.getVar('y'), '2');
    });

    it('+=', function() {
      let prelude = loadPrelude();
      let env = new GlobalEnvironment(prelude.env);
      let code = inline(`
        var y : 1..3;
        y += 1;
      `);
      let module = compiler.load(code, env);
      let context = {};
      module.ast.execute(context);
      assert.equal(env.getVar('y'), '2');
    });
  });
});
