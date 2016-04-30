"use strict";

let assert = require('assert');
let testing = require('../../lib/testing.js');

describe('types/varlen.js', function() {
  describe('Set', function() {
    it('basic', function() {
      let module = testing.run(`
        type Stuff : 0..99;
        var set : Set<Stuff>[1..5];
        push(set, 33);
        push(set, 37);
        push(set, 33);
        var b1 : Boolean = contains(set, 33);
        pop(set);
        var b2 : Boolean = empty(set);
      `);
      assert.equal(module.env.getVar('set').toString(),
        '{1: 33}');
      assert.equal(module.env.getVar('b1').toString(),
        'True');
      assert.equal(module.env.getVar('b2').toString(),
        'False');
    });
  });

  describe('OrderedSet', function() {
    it('basic', function() {
      let module = testing.run(`
        type Stuff : 0..99;
        var set : OrderedSet<Stuff>[1..5];
        push(set, 33);
        push(set, 37);
        var b1 : Boolean = contains(set, 33);
        pop(set);
        var b2 : Boolean = empty(set);
      `);
      assert.equal(module.env.getVar('set').toString(),
        '{1: 33}');
      assert.equal(module.env.getVar('b1').toString(),
        'True');
      assert.equal(module.env.getVar('b2').toString(),
        'False');
    });
  });

  describe('MultiSet', function() {
    it('basic', function() {
      let module = testing.run(`
        type Stuff : 0..99;
        var set : MultiSet<Stuff>[1..5];
        push(set, 33);
        push(set, 37);
        push(set, 33);
        var b1 : Boolean = contains(set, 33);
        pop(set);
        var b2 : Boolean = empty(set);
      `);
      assert.equal(module.env.getVar('set').toString(),
        '{1: 33, 2: 33}');
      assert.equal(module.env.getVar('b1').toString(),
        'True');
      assert.equal(module.env.getVar('b2').toString(),
        'False');
    });
  });

  describe('Vector', function() {
    it('basic', function() {
      let module = testing.run(`
        type Stuff : 0..99;
        var set : Vector<Stuff>[1..5];
        push(set, 33);
        push(set, 37);
        push(set, 33);
        var b1 : Boolean = contains(set, 33);
        pop(set);
        var b2 : Boolean = empty(set);
      `);
      assert.equal(module.env.getVar('set').toString(),
        '{1: 33, 2: 37}');
      assert.equal(module.env.getVar('b1').toString(),
        'True');
      assert.equal(module.env.getVar('b2').toString(),
        'False');
    });
  });
});
