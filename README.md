# runway-compiler

This project is a work in progress. It's fairly buggy and quirky but can
provide some value already. The docs aren't very good yet.

Setup
-----

First make sure you have `node` and `npm` (node package manager) installed.
On OS X, if you have homebrew, you can run:

    brew install node

Then run `make setup` to get started.

Also, `model.vim` is a vim syntax file you can use. Copy it into
`~/.vim/syntax/` and set your filetype to `model` in `~/.vimrc`:

    autocmd BufRead,BufNewFile *.model set filetype=model

REPL
----

    $ node main.js 
    > 3 * 4
    12
    > type Pair : record { first: 0..9, second: 10..99 };
    > var p : Pair;
    > p
    Pair { first: 0, second: 10 }
    > p.first = 20
    ModelingBoundsError: Cannot assign value of 20 to range undefined: 0..9;
    > p.first = 3
    > p
    Pair { first: 3, second: 10 }
    > type Maybe : either { Nothing, Something { it: 3..5 } }
    > var m : Maybe
    > m
    Nothing
    > m = Something { it: 4 }
    > m
    Something { it: 4 }
    > match m { Something as s => { print s.it; }, Nothing => { print False; } }
    4
    > m = Nothing
    > match m { Something as s => { print s.it; }, Nothing => { print False; } }
    False
    > 


### Running Example in REPL

See [examples/toomanybananas/toomanybananas.model](examples/toomanybananas/toomanybananas.model)
code to make sense of this.

    $ node main.js examples/toomanybananas/toomanybananas.model 
    bananas = 0
    notePresent = False
    roommates = [1: Happy, 2: Happy, 3: Happy, 4: Happy, 5: Happy]
    
    Executing step
    bananas = 0
    notePresent = False
    roommates = [1: Hungry, 2: Happy, 3: Happy, 4: Happy, 5: Happy]
    
    > .fire step 3
    bananas = 0
    notePresent = False
    roommates = [1: Hungry, 2: Happy, 3: Hungry, 4: Happy, 5: Happy]
    
    > .fire step 3
    bananas = 0
    notePresent = True
    roommates = [1: Hungry, 2: Happy, 3: GoingToStore, 4: Happy, 5: Happy]
    
    > bananas = 7
    > .fire step 3
    bananas = 7
    notePresent = True
    roommates = [1: Hungry, 2: Happy, 3: ReturningFromStore { carrying: 3 }, 4: Happy, 5: Happy]
    
    > .fire step 3
    bananas = 10
    notePresent = False
    roommates = [1: Hungry, 2: Happy, 3: Hungry, 4: Happy, 5: Happy]
    
    > 

Note that invariants are not automatically checked.

Writing a Model
---------------

Coming soon. The most important thing to note is that most things are
pass-by-value (copy semantics), but for loops are by reference.

Internals
---------

### Interpreter

The lexer+parser ([parser.js](parser.js)) is written using the
[Parsimmon](https://github.com/jneen/parsimmon) library. It outputs a really
big basically JSON parse tree like what you find in
[output-tokenring.json](output-tokenring.json). Every object in the
parse tree has a "kind" field specifying its type and a "source" field
specifying where it comes from in the input file (for error messages).

After parsing completes, the entire structure is converting into an AST
(abstract syntax tree). There's mostly a one-to-one mapping between a node in
the parse tree and a node in the AST, but the AST is actual JavaScript objects.
There are two kinds of nodes in the AST: [statements](statements/) and
[expressions](expressions/). These refer to [types](types/) and values (value
classes are defined next to the corresponding type).

After the AST is set up, `typecheck()` is called on it, which is invoked
through the entire tree (children before parents). Then `execute()` calls the
top-level initialization statements, if any.

### Tests

Run `make test`.

Unit tests use the [Mocha](https://mochajs.org/) library.  To add a new test
file for a module named *foo*, name it `foo-test.js` and run `git add
foo-test.js`. It will then be invoked on subsequent `make test` runs.

The parser is tested by feeding it a couple of files
([input.model](input.model) and [tokenring.model](tokenring.model)) and
automatically checking their parser output (against [output.json](output.json)
and [output-tokenring.json](output-tokenring.json)). Eventually we'll want more
targeted tests for the parser, but this has worked pretty well so far at
making sure there aren't any regressions.
