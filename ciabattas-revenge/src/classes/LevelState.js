
import { LEVEL_THEMES, PLACEMENT_TYPE_CIABATTA, PLACEMENT_TYPE_GOAL, PLACEMENT_TYPE_HERO, PLACEMENT_TYPE_HERO_SPAWN, PLACEMENT_TYPE_SWITCH, PLACEMENT_TYPE_WALL } from "@/helpers/consts";
import { placementFactory } from "./PlacementFactory";
import { GameLoop } from "./gameLoop";
import { DirectionControls } from "./DirectionControls";
import Levels from "@/levels/LevelsMap";
import { Inventory } from "./Inventory";
import { Camera } from "./Camera";
import { Clock } from "./Clock";
import soundsManager from "./Sounds";
import { LevelAnimatedFrames } from "./LevelAnimatedFrames";

export class LevelState {
  constructor(levelId, onEmit) {
    this.id = levelId;
    this.onEmit = onEmit;
    this.isStoryEnded = false;
    this.previousState = null

    this.directionControls = new DirectionControls();
    this.music = Levels[this.id].musicTrack
    this.editModePlacementType = {
      type: PLACEMENT_TYPE_WALL
    }

    if (this.music)
      document.addEventListener('click', soundsManager.playSfx(this.music))
    this.title = Levels[this.id].title;
    this.start();
  }


  start(shouldStart) {
    this.isCompleted = false;
    this.gameCompleted = false;
    this.deathOutcome = null;
    const levelData = (JSON.parse(window.localStorage.getItem('CustomLevels')) || []).find(x => x.id === parseInt(this.id)) ?? Levels[this.id];

    this.updateTheme();
    this.tilesWidth = levelData.tilesWidth;
    this.tilesHeight = levelData.tilesHeight;

    const newPlacements = levelData.placements.map((config) =>
      placementFactory.createPlacement(config, this)
    );

    this.inventory = new Inventory();
    this.animatedFrames = new LevelAnimatedFrames();


    for (let i = newPlacements.length - 1; i >= 0; i--) {
      const config = newPlacements[i];
      if (config.type === PLACEMENT_TYPE_HERO && !(this.id.startsWith("Level") && this.running)) {
        newPlacements.splice(i, 1);
        break;
      }
    }
    for (let i = 0; i < newPlacements.length; i++) {
      const config = newPlacements[i];
      if (config.type === PLACEMENT_TYPE_HERO_SPAWN) {
        config.setDontShow(true);
        newPlacements.push(
          placementFactory.createPlacement(
            {
              type: "HERO",
              x: config.x,
              y: config.y,
            },
            this
          )
        );
      }
    }



    this.placements = newPlacements;
    this.heroRef = this.placements.find((p) => p.type === PLACEMENT_TYPE_HERO);

    this.camera = new Camera(this);
    this.clock = new Clock(90, this);

    this.startGameLoop();
    this.running = shouldStart || !Boolean(Levels[this.id].story);
  }
  startGameLoop() {
    this.gameLoop?.stop();
    this.gameLoop = new GameLoop(() => {
      if (this.running) {
        let newState = this.getState();
        if (!this.previousState || !equals(newState, this.previousState)) {
          this.previousState = newState;
          this.tick();
        }
        this.checkForEnd();
      }
    })
  }
  checkForEnd() {
    if (this.title === 'Floor 5-9') {
      if (!this.placements.find((p) => p.type === PLACEMENT_TYPE_CIABATTA)) {
        this.addPlacement({
          type: PLACEMENT_TYPE_SWITCH,
          x: 4,
          y: 3
        })
      }
    }
  }

  addPlacement(config) {

    if (config.type === 'GOAL' || config.type === 'HERO_SPAWN') {
      const index = this.placements.findIndex((p) => p.type === config.type);
      if (index != -1) {
        this.placements[index].x = config.x;
        this.placements[index].y = config.y;
      } else {
        this.placements.push(placementFactory.createPlacement(config, this))
      }
    } else {
      this.placements.push(placementFactory.createPlacement(config, this))
    }
    return this.placements[this.placements.length - 1]
  }

  deletePlacement(placementToRemove) {
    this.placements = this.placements.filter((p) => {
      return p.id !== placementToRemove.id;
    })
  }
  copyPlacementsToClipboard() {
    const placementsData = this.placements.map((p) => {
      return {
        type: p.type,
        x: p.x,
        y: p.y
      }
    })

    navigator.clipboard.writeText(JSON.stringify(placementsData)).then(
      () => {
      },
      (e) => {

      }
    )
  }

  setEditModePlacementType(newType) {
    this.editModePlacementType = newType
  }

  tick() {
    if (this.directionControls.direction) {
      if (!this.heroRef.dontShow)
        this.heroRef.controllerMoveRequested(this.directionControls.direction)
    }
    this.placements.forEach(placement => {
      if (!placement.dontShow)
        placement.tick();
    })

    this.animatedFrames.tick()

    this.camera.tick();
    if (!this.enableEditing)
      this.clock.tick()
    this.filterPlacements()
    this.onEmit(this.getState());
  }

  isPositionOutOfBounds(x, y) {
    return (
      x === 0 ||
      y === 0 ||
      x >= this.tilesWidth + 1 ||
      y >= this.tilesHeight + 1
    )
  }
  switchAllDoors() {
    this.placements.forEach((placement) => {
      if (placement.toggleIsRaised) {
        placement.toggleIsRaised()
      }
    })
  }

  stealInventory() {
    this.placements.forEach((p) => {
      p.resetHasBeenCollected();
    })
    this.inventory.clear();
  }
  setDeathOutcome(causeOfDeath) {
    this.deathOutcome = causeOfDeath;
    this.gameLoop.stop()
  }

  completeLevel() {
    if (!window.localStorage.getItem("completedLevels")) {
      window.localStorage.setItem("completedLevels", JSON.stringify([]))
    }
    if (!JSON.parse(window.localStorage.getItem("completedLevels")).includes(this.id)) {
      const completedLevels = [...JSON.parse(window.localStorage.getItem("completedLevels")), this.id];
      completedLevels.sort((x, y) => parseInt(x.substring(6, 9)) - parseInt(y.substring(6, 9)));
      window.localStorage.setItem('completedLevels', JSON.stringify(completedLevels))
    }
    this.isCompleted = true;
    if (this.title === 'Floor 5-9') {
      this.running = false;
      this.gameCompleted = true;
    }
    this.gameLoop.stop()
  }

  filterPlacements() {
    this.placements = this.placements.map(p => {
      const isValid = p.x >= 0 && p.x <= this.tilesWidth && p.y >= 0 && p.y <= this.tilesHeight;
      if (!isValid) {
        p.dontShow = true;
      } else {
        if (p.type != PLACEMENT_TYPE_HERO_SPAWN)
          p.dontShow = false;
      }
      return p
    })
  }
  setTilesWidth(value) {
    this.tilesWidth = value;
    this.filterPlacements()
  }

  setTilesHeight(value) {
    this.tilesHeight = value;
    this.filterPlacements()
  }
  stop() {
    this.running = false
    this.onEmit(this.getState())
  }
  setRunning(running) {
    this.running = running
    this.onEmit(this.getState())
  }

  getState() {
    return {
      theme: this.theme,
      gameCompleted: this.gameCompleted,
      stop: this.stop.bind(this),
      running: this.running,
      setRunning: this.setRunning.bind(this),
      tilesWidth: this.tilesWidth,
      tilesHeight: this.tilesHeight,
      setTilesWidth: this.setTilesWidth.bind(this),
      setTilesHeight: this.setTilesHeight.bind(this),
      placements: this.placements,
      deathOutcome: this.deathOutcome,
      isCompleted: this.isCompleted,
      cameraTransformX: this.camera.transformX,
      cameraTransformY: this.camera.transformY,
      secondsRemaining: this.clock.secondsRemaining,
      inventory: this.inventory,
      title: this.title,
      id: this.id,
      music: this.music,
      story: Levels[this.id].story,
      isStoryEnded: this.isStoryEnded,
      closeStory: this.closeStory.bind(this),
      isReady: this.isReady,
      restart: (shouldStart) => {
        this.start(shouldStart)
      },
      enableEditing: Boolean(this.enableEditing),
      setEnableEditing: this.setEnableEditing.bind(this),
      editModePlacementType: this.editModePlacementType,
      addPlacement: this.addPlacement.bind(this),
      deletePlacement: this.deletePlacement.bind(this),
      setEditModePlacementType: this.setEditModePlacementType.bind(this),
      copyPlacementsToClipboard: this.copyPlacementsToClipboard.bind(this),
      setNextTheme: this.setNextTheme.bind(this),
      setTitle: this.setTitle.bind(this),
      clearMap: this.clearMap.bind(this),
      saveLocally: this.saveLocally.bind(this)
    }
  }
  setTitle(title) {
    this.title = title
  }
  setEnableEditing(bool) {
    const index = this.placements.findIndex((p) => p.type === 'HERO_SPAWN');
    this.placements[index].dontShow = !bool;
    this.enableEditing = bool;
  }
  clearMap() {
    this.placements = this.placements.filter(p => p.type === PLACEMENT_TYPE_HERO || p.type === PLACEMENT_TYPE_GOAL || p.type === PLACEMENT_TYPE_HERO_SPAWN);
  }
  setNextTheme() {
    const keys = Object.keys(LEVEL_THEMES)
    const currentIndex = keys.indexOf(this.theme)
    const nextIndex = (currentIndex + 1) % keys.length
    this.theme = keys[nextIndex]
  }
  updateTheme() {
    this.theme = Levels[this.id].theme;
  }

  closeStory() {
    this.running = true;
    this.isStoryEnded = true;
  }
  destroy() {
    this.gameLoop.stop();
    this.directionControls.unbind()
  }
  saveLocally() {
    const customLevels = JSON.parse(window.localStorage.getItem('CustomLevels'));
    const myLevel = customLevels.findIndex((c) => {
      return parseInt(c.id) === parseInt(this.id)
    })
    if (myLevel != -1) {

      customLevels[myLevel].theme = this.theme
      customLevels[myLevel].tilesWidth = this.tilesWidth
      customLevels[myLevel].tilesHeight = this.tilesHeight
      customLevels[myLevel].placements = this.placements.map(p => {
        return {
          type: p.type,
          x: p.x,
          y: p.y,
          initialDirection: p.initialDirection,
          direction: p.direction,
          corner: p.corner
        }
      }).filter(p => p.type != PLACEMENT_TYPE_HERO)
    }

    window.localStorage.setItem('CustomLevels', JSON.stringify(customLevels))

  }
}

function equals(x, y) {
  const typeOfX = typeof x
  const typeOfY = typeof y;

  if (typeOfX != typeOfY) {
    return false
  }

  if (typeOfX === 'function') {
    return true
  }

  if (['number', 'string'].includes(typeOfX)) {
    return x === y;
  }

  if (Array.isArray(x)) {
    return !Boolean(x.some((x, index) => !equals(x, y[index])));
  }
  if (typeOfX === 'object') {
    return !Boolean(Object.entries(x).some(([k, x]) => !equals(x, y[k])))
  }

  return false
}
