import { useKeyPress } from "@/hooks/useKeyPress";
import MemoizedSprite from "../object-graphics/Sprite";
import { TILES } from "@/helpers/tiles";
import { VERSION } from "@/helpers/consts";
import TitleSvg from "../object-graphics/TitleSvg";
import PressEnterSvg from "../object-graphics/PressEnterSvg";
import styles from './TitleLayout.module.css'

export default function TitleScreen({ onEnter }) {
  useKeyPress('Enter', () => {
    onEnter();
  })

  return (
    <div className={styles.container}>
      <span className={styles.version}>{VERSION}</span>
      <div className={styles.containerInner}>
        <TitleSvg />
        <MemoizedSprite frameCoord={TILES.CIABATTA1} size={48} />
        <div className={styles.pressEnterContainer}>
          <button className={styles.button}
            onClick={() => {
              onEnter();
            }}>
            <PressEnterSvg />
          </button>
        </div>
      </div>
      <p className={styles.credits}>By Drew Conley and Glenn LaBarre</p>
      <span className={styles.version}>{VERSION}</span>
    </div>
  )
}
