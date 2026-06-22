import styles from './EditorDropdown.module.css'
import MemoizedSprite from '../object-graphics/Sprite';
import { TILES } from '@/helpers/tiles';
export default function EditorDropdown({ toShow, level, handleToggle, showEditingMenu }) {
  return toShow && <div>
    {
      showEditingMenu ? (
        <button className={styles.quietButton} style={{
          pointerEvents: 'all'
        }} onClick={() => {
          handleToggle(false)
          level.setEnableEditing(false)
        }}>
          <MemoizedSprite frameCoord={TILES.RESUME_BUTTON} />
        </button>
      )
        : (
          <>
            <button className={styles.quietButton} onClick={() => {
              handleToggle(true)
              level.setEnableEditing(true)
            }} disabled={Boolean(level.deathOutcome)} style={{
              opacity: Boolean(level.deathOutcome) ? 0.2 : 1
            }}>
              <MemoizedSprite frameCoord={TILES.EDIT_BUTTON} />
            </button>
          </>
        )
    }
  </div>


}
