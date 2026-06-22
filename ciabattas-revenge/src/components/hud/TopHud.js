import React from 'react'
import ClockCount from './ClockCount'
import FlourCount from './FlourCount'
import InventoryList from './InventoryList'
import RestartButton from './RestartButton'
import SettingsButton from './SettingsButton'
import styles from './TopHud.module.css'
import FloorButton from './FloorButton'
import useStore from "@/atoms/currentLevelidAtom"
import useCustomLevelsStore from "@/atoms/customLevelsAtom"
import ElevatorHud from './ElevatorHud'
import soundsManager from '@/classes/Sounds';
import EditorDropdown from './EditorDropdown'
import { TILES } from '@/helpers/tiles'
import MemoizedSprite from '../object-graphics/Sprite'
import { THEME_TILES_MAP } from '@/helpers/consts'

export default function TopHud({ onTitle, level }) {
  const [showSettings, setShowSettings] = React.useState(false);
  const [showElevatorHud, setShowElevatorHud] = React.useState(false);
  const [currentId] = useStore((state) => [state.currentLevelId]);
  const [showEditingMenu, setShowEditingMenu] = React.useState(false)
  const [copiedPlacements, setCopiedPlacements] = React.useState(false);
  React.useEffect(() => {
    setShowElevatorHud(false)
  }, [currentId])

  React.useEffect(() => {
    if (currentId.toString().startsWith('Level')) {
      setShowEditingMenu(false)
      level.setEnableEditing(false)
    }
  }, [currentId, level])

  return (
    <div className={styles.topHud}>
      <div className={styles.topHudLeft}>
        <FloorButton onToggle={() => setShowElevatorHud(!showElevatorHud)} title={currentId.toString().startsWith('Level') ? level.title : level.id} />
        <FlourCount level={level} />
        <ClockCount level={level} />
        <InventoryList level={level} />
      </div>
      {showElevatorHud && <ElevatorHud level={level} onTitle={() => {
        onTitle();
        setShowElevatorHud(false);
      }} />}

      {showEditingMenu && !currentId.toString().startsWith('Level') && <DropDownMenu level={level} copiedPlacements={copiedPlacements} setCopiedPlacements={setCopiedPlacements} />}
      <div className={styles.topHudRight} style={{
        pointerEvents: level.enableEditing ? 'none' : 'all'
      }}>
        <EditorDropdown toShow={!currentId.toString().startsWith('Level')} level={level} handleToggle={setShowEditingMenu} showEditingMenu={showEditingMenu} />
        <SettingsButton handleToggle={() => setShowSettings(!showSettings)} />
        <RestartButton level={level} />
      </div>
      {showSettings && (
        <div className={styles.settings}>
          <h2 style={{ margin: 0, fontFamily: "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif", fontWeight: '500', fontSize: '1.6rem' }}>Settings</h2>
          <label style={{ display: 'flex', flexDirection: 'column', width: '160px' }}>
            <span className={styles.labelText}>Music Volume</span>
            <input type="range" max='0.5' step="0.05" defaultValue="0.5" onChange={(e) => soundsManager.changeMusicVolume(e.target.value)} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', width: '160px' }}>
            <span className={styles.labelText}>SFX Volume</span>
            <input type="range" max='0.5' step="0.05" defaultValue="0.5" onChange={(e) => soundsManager.changeSfxVolume(e.target.value)} />
          </label>
        </div>
      )}
    </div>
  )
}

function DropDownMenu({ level, copiedPlacements, setCopiedPlacements }) {
  const [objectCategory, setObjectCategory] = React.useState('Tiles');

  const setCustomLevels = useCustomLevelsStore((image) => image.setCustomLevels);
  return (
    <div className={styles.dropDownMenu}>
      <div>
        <span className={styles.labelText}>LEVEL TITLE</span>
        <input type='text' className={styles.styledInput + ' ' + styles.title} defaultValue={level.title} onChange={(e) => level.setTitle(e.target.value)} />
      </div>
      <div>
        <span className={styles.labelText}>OBJECT CATEGORY</span>
        <select value={objectCategory} onChange={(e) => setObjectCategory(e.target.value)} className={styles.styledInput}>
          <option>Tiles</option>
          <option>Basics</option>
          <option>Pickups</option>
          <option>Enemies</option>
        </select>
      </div>
      <RenderPossibleObjects theme={level.theme} objectCategory={objectCategory} level={level} />
      <div>
        <div className={styles.buttonContainer} onClick={() => {
          level.setNextTheme()
          level.saveLocally()
          setCustomLevels(window.localStorage.getItem('customLevels'))
        }}>
          <button>Change Theme</button>
        </div>

        <div className={styles.buttonContainer} onClick={() => {
          level.clearMap()
          level.saveLocally()
          setCustomLevels(window.localStorage.getItem('customLevels'))
        }}>
          <button>Clear Map</button>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '1rem'
        }}>
          <div>
            <div className={styles.changeValue}>
              <button className={styles.changeButton} onClick={() => {
                level.setTilesWidth(level.tilesWidth - 1)
                level.saveLocally();
                setCustomLevels(window.localStorage.getItem('customLevels'))
              }}>-</button>
              <span className={styles.changeValueSpan}>Width: {level.tilesWidth}</span>
              <button className={styles.changeButton} onClick={() => {
                level.setTilesWidth(level.tilesWidth + 1)
                level.saveLocally();
                setCustomLevels(window.localStorage.getItem('customLevels'))
              }}>+</button>
            </div>
          </div>
          <div>
            <div className={styles.changeValue}>
              <button className={styles.changeButton} onClick={() => {
                level.setTilesHeight(level.tilesHeight - 1)
                level.saveLocally();
                setCustomLevels(window.localStorage.getItem('customLevels'))
              }}>-</button>
              <span className={styles.changeValueSpan}>Height: {level.tilesHeight}</span>
              <button className={styles.changeButton} onClick={() => {
                level.setTilesHeight(level.tilesHeight + 1)
                level.saveLocally();
                setCustomLevels(window.localStorage.getItem('customLevels'))
              }}>+</button>
            </div>
          </div>
        </div>
        {!copiedPlacements ? <div className={styles.buttonContainer} onClick={() => {
          setCopiedPlacements(true)
        }}>
          <button>Get JSON</button>
        </div> : (
          <div style={{
            color: "#3fff3f",
            fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
            padding: '10px 0'
          }}>
            JSON copied to Clipboard!
          </div>
        )}
      </div>
    </div >
  )
}
export const editTilesMap = {
  Basics: [
    { type: "HERO_SPAWN" },
    { type: "GOAL" }
  ],
  Tiles: [
    { type: "WALL" },
    { type: "CONVEYOR", direction: "UP" },
    { type: "CONVEYOR", direction: "LEFT" },
    { type: "CONVEYOR", direction: "DOWN" },
    { type: "CONVEYOR", direction: "RIGHT" },
    { type: "WATER" },
    { type: "ICE" },
    { type: "ICE", corner: "TOP_LEFT" },
    { type: "ICE", corner: "TOP_RIGHT" },
    { type: "ICE", corner: "BOTTOM_LEFT" },
    { type: "ICE", corner: "BOTTOM_RIGHT" },
    { type: "FIRE" },
    { type: "THIEF" },
    { type: "TELEPORT" },
    { type: "LOCK", color: 'BLUE' },
    { type: "LOCK", color: 'GREEN' },
    { type: "SWITCH" },
    { type: "SWITCH_DOOR", isRaised: true },
    { type: "SWITCH_DOOR", isRaised: false }
  ],
  Pickups: [
    { type: "FLOUR" },
    { type: "ICE_PICKUP" },
    { type: "FIRE_PICKUP" },
    { type: "WATER_PICKUP" },
    { type: "CLOWN_DEFENSE_PICKUP" },
    { type: "KEY", color: 'BLUE' },
    { type: "KEY", color: 'GREEN' }
  ],
  Enemies: [
    { type: "GROUND_ENEMY", initialDirection: "UP" },
    { type: "GROUND_ENEMY", initialDirection: "DOWN" },
    { type: "GROUND_ENEMY", initialDirection: "LEFT" },
    { type: "GROUND_ENEMY", initialDirection: "RIGHT" },
    { type: "FLYING_ENEMY", initialDirection: "UP" },
    { type: "FLYING_ENEMY", initialDirection: "DOWN" },
    { type: "FLYING_ENEMY", initialDirection: "LEFT" },
    { type: "FLYING_ENEMY", initialDirection: "RIGHT" },
    { type: "ROAMING_ENEMY" },
    { type: "CIABATTA" }
  ]
};

function RenderPossibleObjects({ level, theme, objectCategory }) {
  const [editModePlacementType, setEditModePlacementType] = React.useState(
    { type: "WALL" },
  );

  React.useEffect(() => {
    setEditModePlacementType(level.editModePlacementType)
  }, [level.editModePlacementType])

  const map = {
    Basics: [
      TILES.HERO_SPAWN,
      TILES.GOAL_ENABLED,
    ],
    Tiles: [
      THEME_TILES_MAP[theme].WALL,
      TILES.CONVEYOR_UP,
      TILES.CONVEYOR_LEFT,
      TILES.CONVEYOR_DOWN,
      TILES.CONVEYOR_RIGHT,
      TILES.WATER1,
      TILES.ICE,
      TILES.ICE_TOP_LEFT,
      TILES.ICE_TOP_RIGHT,
      TILES.ICE_BOTTOM_LEFT,
      TILES.ICE_BOTTOM_RIGHT,
      TILES.FIRE2,
      TILES.THIEF,
      TILES.TELEPORT1,
      TILES.BLUE_LOCK,
      TILES.GREEN_LOCK,
      TILES.PURPLE_BUTTON,
      TILES.PURPLE_DOOR_SOLID,
      TILES.PURPLE_DOOR_OUTLINE
    ],
    Pickups: [
      TILES.FLOUR,
      TILES.ICE_PICKUP,
      TILES.FIRE_PICKUP,
      TILES.WATER_PICKUP,
      TILES.CLOWN_DEFENSE_PICKUP,
      TILES.BLUE_KEY,
      TILES.GREEN_KEY
    ],
    Enemies: [
      TILES.ENEMY_UP_SPAWN,
      TILES.ENEMY_DOWN_SPAWN,
      TILES.ENEMY_LEFT_SPAWN,
      TILES.ENEMY_RIGHT_SPAWN,
      TILES.ENEMY_FLYING_UP_SPAWN,
      TILES.ENEMY_FLYING_DOWN_SPAWN,
      TILES.ENEMY_FLYING_LEFT_SPAWN,
      TILES.ENEMY_FLYING_RIGHT_SPAWN,
      TILES.ENEMY_ROAMING_SPAWN,
      TILES.CIABATTA_SPAWN,
    ],
  };


  return (
    <div className={styles.categoryGrid}>
      {map[objectCategory].map((tile, i) => {
        let className = styles.sprite + ' ';
        if (editModePlacementType.type === editTilesMap[objectCategory][i].type) {
          if (editModePlacementType.direction) {
            if (editModePlacementType.direction === editTilesMap[objectCategory][i].direction)
              className += styles.selected
          } else if (editModePlacementType.initialDirection) {
            if (editModePlacementType.initialDirection === editTilesMap[objectCategory][i].initialDirection)
              className += styles.selected
          } else if (editModePlacementType.type === 'ICE') {
            if (editTilesMap[objectCategory][i].corner && editModePlacementType.corner) {
              if (editModePlacementType.corner === editTilesMap[objectCategory][i].corner)
                className += styles.selected
            } else {
              if (editTilesMap[objectCategory][i].corner === editModePlacementType.corner)
                className += styles.selected
            }
          } else if (editModePlacementType.type === 'SWITCH_DOOR') {
            if (editTilesMap[objectCategory][i].isRaised === editModePlacementType.isRaised) {
              className += styles.selected
            }
          } else if (editModePlacementType.color) {
            if (editModePlacementType.color === editTilesMap[objectCategory][i].color)
              className += styles.selected
          } else {
            className += styles.selected
          }
        }
        return (
          <button key={i} className={className} onClick={() => {
            level.setEditModePlacementType(editTilesMap[objectCategory][i])
            setEditModePlacementType(editTilesMap[objectCategory][i]);
          }}>
            <MemoizedSprite frameCoord={tile} />
          </button>
        )
      })}
    </div>
  )
}
