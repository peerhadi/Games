
'use client';
import { useEffect } from 'react';
import { SPRITE_SHEET_SRC } from "./helpers/consts";
import RenderLevel from "./components/level-layout/RenderLevel";
import useStore from './atoms/spriteSheetImageAtom';
import useCustomLevelsStore from './atoms/customLevelsAtom';
import useCurrentIdStore from './atoms/currentLevelidAtom';
import soundsManager from './classes/Sounds';
import Levels from './levels/LevelsMap';
soundsManager.init()

export default function App() {
  return (
    <RenderLevel />
  );
}

