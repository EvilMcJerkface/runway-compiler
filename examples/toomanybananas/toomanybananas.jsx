"use strict";

let React = require('React');
let ReactDOM = require('ReactDOM');
let jQuery = require('jquery');
let Tooltip = require('Tooltip');
let Util = require('Util');
let fetchRemoteFile = require('fetchRemoteFile');
let Changesets = require('Changesets');
let _ = require('lodash');

let View = function(controller, svg, module) {

let model = module.env;
let tooltip = new Tooltip(jQuery('#tooltip'));

let basename = 'node_modules/runway-compiler/examples/toomanybananas';
return Promise.all([
  fetchRemoteFile(`${basename}/bg.svg`),
  fetchRemoteFile(`${basename}/banana.svg`),
  fetchRemoteFile(`${basename}/happy.svg`),
  fetchRemoteFile(`${basename}/hungry.svg`),
  fetchRemoteFile(`${basename}/note.svg`),
]).then(results => {

let svgs = {
  bg: results[0].getText(),
  banana: results[1].getText(),
  happy: results[2].getText(),
  hungry: results[3].getText(),
  note: results[4].getText(),
};

let bananaCopy = <g
  transform="scale(.2)"
  dangerouslySetInnerHTML={{__html: svgs.banana}}></g>;

let TooManyBananasView = React.createClass({
  getInitialState: function() {
    return {
      changes: [''],
    };
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    return Changesets.affected(nextState.changes,
      ['bananas', 'notePresent', 'roommates']);
  },
  render: function() {
    let bananas = [];
    _.range(model.vars.get('bananas').value).forEach(i => {
      let x = 6 + i * 4;
      let y = 28 + i;
      if (i > 3) {
        x = 6 + (i % 4) * 4;
        y -= 15 * Math.floor(i / 4);
      }
      // TODO: I'd like to do the following, but it doesn't seem to display in
      // Chrome until I force the browser to reparse the SVG node. Not sure if
      // that's a Chrome or a React bug. Avoid dynamic numbers of <use> tags
      // for now.
      /*
      bananas.push(<use
        key={`banana-${i}`}
        x={x} y={y}
        xlinkHref="#banana" />);
      */
      bananas.push(<g
        key={`banana-${i}`}
        transform={`translate(${x}, ${y})`}>
          {bananaCopy}
      </g>);
    });

    let note = [];
    let notePresentVar = model.vars.get('notePresent');
    if (notePresentVar === undefined) {
      // probably running broken.model, which doesn't define the notePresent
      // variable
    } else {
      if (notePresentVar.toString() === 'True') {
        note = <g transform="translate(15 5) scale(.3)"
          key="note"
          dangerouslySetInnerHTML={{__html: svgs.note}}></g>;
      }
    }

    let roommates = [];
    let numGoing = 0;
    let numReturning = 0;
    model.vars.get('roommates').forEach((r, id) => {
      let i = id - 1;
      let key = `roommate-${id}`;
      let happy = false;
      // default to house coordinates
      let x = 30 + i * 10;
      let y = 35 - i * 5;
      r.match({
        Happy: () => {
          happy = true;
        },
        Hungry: h => {
          // defaults work
        },
        GoingToStore: () => {
          x = 75 + numGoing * 12;
          y = 30;
          numGoing += 1;
        },
        ReturningFromStore: rfs => {
          x = 30 - numReturning * 14;
          y = 60;
          _.range(rfs.lookup('carrying').value).forEach(b => {
            let bx = x + b*3;
            let by = y + 10;
            if (b > 3) {
              bx = x + (b-4)*3;
              by = y + 18;
            }
            roommates.push(<g
              key={`banana-carrying-${id}-${b}`}
              transform={`translate(${bx}, ${by}) scale(.8)`}>
                {bananaCopy}
            </g>);
          });
          numReturning += 1;
        },
      })
      roommates.push(<use
        key={key}
        x={x}
        y={y}
        xlinkHref={happy ? '#happy' : '#hungry'}
        className="clickable"
        onClick={() => controller.workspace.tryChangeState(() => {
          console.log(`step ${id}`);
          let context = {};
          model.getRule('step').fire(id, context);
        })} />);
    });

    return <g>
      <defs>
        <g id="happy" transform="scale(.15)"
           dangerouslySetInnerHTML={{__html: svgs.happy}}></g>
        <g id="hungry" transform="scale(.15)"
           dangerouslySetInnerHTML={{__html: svgs.hungry}}></g>
      </defs>
      <g id="bg" dangerouslySetInnerHTML={{__html: svgs.bg}}></g>
      <text x={2} y={40}
        style={{fontSize: 4, fill: 'white'}}
        className="clickable"
        onClick={() => controller.workspace.tryChangeState(() => {
          console.log('spawn banana');
          model.vars.get('bananas').value += 1;
        })}>+</text>
      {note}
      {bananas}
      {roommates}
    </g>;
  },
});

let reactComponent = ReactDOM.render(<TooManyBananasView />, svg);

return {
  update: function(changes) {
    // trigger a render
    reactComponent.setState({changes: changes}, () => {
      tooltip.update();
    });
  }
};

}); // fetch supporting SVG files
}; // View

module.exports = View;
