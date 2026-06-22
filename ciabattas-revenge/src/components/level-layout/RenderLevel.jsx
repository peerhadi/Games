
import styles from './RenderLevel.module.css';
import { SPRITE_SHEET_SRC, THEME_BACKGROUNDS } from '@/helpers/consts';
import LevelBackgroundTilesLayer from './LevelBackgroundTilesLayer';
import LevelPlacementsLayer from './LevelPlacementsLayer';
import React, { useEffect, useMemo, useState } from 'react';
import { LevelState } from '@/classes/LevelState';
import LevelCompleteMessage from '../hud/LevelCompleteMessage';
import useStore from '@/atoms/currentLevelidAtom';
import useSpriteSheetStore from '@/atoms/spriteSheetImageAtom';
import useCustomLevelsStore from '@/atoms/customLevelsAtom';
import DeathMessage from '../hud/DeathMessage';
import TopHud from '../hud/TopHud';
import ScreenWipe from './ScreenWipe';
import InGameTextbox from '../pixel-text/inGameTextbox';
import TitleScreen from '../title/TitleScreen';
import StoryFramesSequence from '../title/StoryFramesSequence';
import { beginningFrames, endingFrames } from '@/story/storyPrompts';
import TitleHowToPlay from '../title/TitleHowToPlay';
import Levels from '@/levels/LevelsMap';

const fetchAndSetSpriteSheet = (setSpriteSheetImage) => {
  const image = new Image();
  image.src = SPRITE_SHEET_SRC;
  image.onload = () => setSpriteSheetImage(image);
};

const initializeLocalStorage = (setCurrentId, setCustomLevels) => {
  if (window) {
    const completedLevels = window.localStorage.getItem('completedLevels');
    const customLevel = window.localStorage.getItem('CustomLevels');
    const currentLevelId = window.localStorage.getItem('currentLevelId');

    if (!completedLevels) window.localStorage.setItem('completedLevels', JSON.stringify([]));
    if (!customLevel) window.localStorage.setItem('CustomLevels', JSON.stringify([]));

    const customLevels = JSON.parse(window.localStorage.getItem('CustomLevels'));
    customLevels.forEach((customLevel) => {
      Levels[customLevel.id] = customLevel;
    });

    if (!Levels[currentLevelId]) {
      setCurrentId('Level1');
      window.localStorage.setItem('currentLevelId', 'Level1');
    }

    setCustomLevels(customLevels);
  }
};

const updateLevelFromStorage = (setCurrentLevelId, currentLevelId) => {
  if (window && currentLevelId !== window.localStorage.getItem('currentLevelId')) {
    setCurrentLevelId(window.localStorage.getItem('currentLevelId'));
  }
};

export default function RenderLevel() {
  const { spriteSheetImage, setSpriteSheetImage } = useSpriteSheetStore();
  const [titleScreenNumber, setTitleScreenNumber] = useState(null);
  const [showFrames, setShowFrames] = useState(false);
  const [level, setLevel] = useState(null);
  const [running, setRunning] = useState(null);
  const [frames, setFrames] = useState(beginningFrames);
  const [isAnimatingOut, setIsAnimatingOut] = useState(true);

  const [currentLevelId, setCurrentLevelId] = useStore((state) => [state.currentLevelId, state.setCurrentLevelId]);
  const setCustomLevels = useCustomLevelsStore((state) => state.setCustomLevels);

  useEffect(() => {
    fetchAndSetSpriteSheet(setSpriteSheetImage);
    initializeLocalStorage(setCurrentLevelId, setCustomLevels);
  }, [setSpriteSheetImage, setCurrentLevelId, setCustomLevels]);

  useEffect(() => {
    updateLevelFromStorage(setCurrentLevelId, currentLevelId);
  }, [currentLevelId, setCurrentLevelId]);

  useEffect(() => {
    if (window) {
      const levelState = new LevelState(currentLevelId, (newState) => {
        setLevel(newState);
      });

      setLevel(levelState.getState());
      return () => {
        levelState.destroy();
      };
    }
  }, [currentLevelId]);

  useEffect(() => {
    if (level) {
      setRunning(level?.running);
      if (level.gameCompleted) {
        setFrames(endingFrames);
        setTimeout(() => {
          setShowFrames(true);
        }, 2000);
      }
    }
  }, [level?.running, level?.gameCompleted]);

  const showTitle = useMemo(() => Number.isInteger(titleScreenNumber), [titleScreenNumber]);
  const cameraTranslate = useMemo(() => `translate3d(${level?.cameraTransformX}, ${level?.cameraTransformY}, 0)`, [level?.cameraTransformX, level?.cameraTransformY]);

  if (!spriteSheetImage || !level) return null;

  return (
    <div className={styles.fullScreenContainer} style={{ background: THEME_BACKGROUNDS[level.theme] }}>
      <div className={styles.gameScreen}>
        {!showTitle && (
          <div style={{ transform: cameraTranslate }}>
            <LevelBackgroundTilesLayer level={level} />
            <LevelPlacementsLayer level={level} />
          </div>
        )}
        {level.isCompleted && <LevelCompleteMessage level={level} />}
        {level.deathOutcome && <DeathMessage level={level} />}
      </div>

      {showTitle && (
        <>
          <div style={{ display: titleScreenNumber < 1 ? 'block' : 'none', width: '100vw', height: '100vh', position: 'absolute', zIndex: 1000 }}>
            <TitleScreen
              onEnter={() => {
                if (titleScreenNumber === 0) {
                  setFrames(beginningFrames);
                  setTimeout(() => {
                    setTitleScreenNumber(1);
                  }, 0);
                }
              }}
            />
          </div>

          <div style={{ display: titleScreenNumber === 2 ? 'block' : 'none', width: '100vw', height: '100vh', position: 'absolute', zIndex: 800 }}>
            <TitleHowToPlay
              onEnter={() => {
                if (titleScreenNumber === 2) {
                  try {
                    if (currentLevelId === 'Level45') {
                      window.localStorage.setItem('currentLevelId', 'Level1');
                      setCurrentLevelId('Level1');
                    }
                  } catch (e) {
                    console.log(e);
                  }
                  setTimeout(() => {
                    setTitleScreenNumber(null);
                  }, 0);
                }
              }}
            />
          </div>
        </>
      )}

      {(showFrames || showTitle) && (
        <div style={{ display: titleScreenNumber < 2 || showFrames ? 'block' : 'none', width: '100vw', height: '100vh', position: 'absolute', zIndex: 900 }}>
          <StoryFramesSequence
            startShowing={titleScreenNumber === 1 || showFrames}
            storyFrames={frames}
            onEnter={() => {
              if (showFrames) {
                setShowFrames(false);
                setFrames(beginningFrames);
                setTitleScreenNumber(0);
              } else if (titleScreenNumber === 1) {
                setTitleScreenNumber(2);
              }
            }}
          />
        </div>
      )}

      {!showTitle && !running && level.story && !level.isStoryEnded && (
        <InGameTextbox level={level} isAnimatingOut={isAnimatingOut} setIsAnimatingOut={setIsAnimatingOut} />
      )}

      {!showTitle && level.isCompleted && <ScreenWipe onDone={() => { }} level={level} />}
      {!showTitle && <TopHud level={level} onTitle={() => setTitleScreenNumber(0)} />}
    </div>
  );
}

