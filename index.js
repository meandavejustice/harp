var chroma = require('chroma-js');
var tinygradient = require('tinygradient');
var prevColorStack = [];
var audioCtx = new AudioContext();

var steps = [].slice.call(document.querySelectorAll('li'));
steps.forEach(function(step) {
  step.style.background = step.getAttribute('data-color');
  step.style.opacity = .5;
  step.addEventListener('mouseover', function(el) {
    var freq = 220 * Math.pow(1.059463, steps.indexOf(el.target));
    var col = el.target.getAttribute('data-color');
    if (col) setColor(col);
    playNote(freq);
  });
})

function setColor(col) {
  var prevCol = document.body.style.backgroundColor;
  if (prevCol) {
    prevColorStack.push(col);
    if (prevColorStack.length > 2) {
      if (prevColorStack.length > 3) prevColorStack.shift();
      var gradient = tinygradient([
        {color: prevColorStack[0], pos: 0},
        {color: prevColorStack[1], pos: 0.8},
        {color: prevColorStack[2], pos: 1}
      ]);

      document.body.style.background = gradient.css('radial', 'farthest-corner ellipse at top left');
    } else {
      var scale = chroma.scale([prevCol, col]);
      document.body.style.backgroundColor = scale(0.5).hex();
    }
  } else {
    document.body.style.backgroundColor = chroma(col).brighten().hex();
  }
}

function playNote(freq) {
  var osc  = audioCtx.createOscillator();
  var gain = audioCtx.createGain();
  gain.gain.value = 1;
  osc.type = 'triangle';
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  setInterval(function() {
    fade(gain, osc);
  }, 200);
}

function fade(gain, osc) {
  var val = gain.gain.value;
  if (val > 0) {
    gain.gain.value = val - .05;
  } else {
    gain.disconnect(audioCtx.destination);
    osc.stop(0);
    osc.disconnect(gain);
  }
}
