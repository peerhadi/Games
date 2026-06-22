import './style.css';
import './globals';
import { loader } from './assets';
import Level1 from './scenes/level1';

const game = new ex.Engine({
  canvasElementId: 'game',
  displayMode: ex.DisplayMode.FitScreen,
  resolution: {
    width: 320,
    height: 197,
  },
  antialiasing: false,
})

game.add('level1', new Level1());

game.start(loader).then(() => {
  game.goToScene('level1');
})

ex.Physics.checkForFastBodies = true;
ex.Physics.useRealisticPhysics();

// @ts-ignore

window.showDebug = game.showDebug.bind(game);

window.addEventListener('blur', () => {
  game.stop();
})

window.addEventListener('focus', () => {
  game.start();
})
