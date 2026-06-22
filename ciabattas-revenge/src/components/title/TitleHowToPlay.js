import { useKeyPress } from "@/hooks/useKeyPress";
import PressEnterSvg from "../object-graphics/PressEnterSvg";
import UseArrowsToMoveSvg from "../object-graphics/UseArrowKeysToMove";
import styles from './TitleLayout.module.css'

export default function TitleHowToPlay({ onEnter }) {
  useKeyPress("Enter", () => {
    onEnter();
  })

  return (
    <div className={styles.container}>
      <div className={styles.containerInner}>
        <UseArrowsToMoveSvg />
        <div className={styles.pressEnterContainer}>
          <button
            className={styles.button}
            onClick={() => {
              onEnter();
            }}>
            <PressEnterSvg />
          </button>
        </div>
      </div>
    </div>
  )
}
