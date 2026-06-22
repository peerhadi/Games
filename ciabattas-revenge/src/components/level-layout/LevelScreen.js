import LevelBackgroundTilesLayer from "./LevelBackgroundTilesLayer";
import LevelPlacementsLayer from "./LevelPlacementsLayer";

const LevelScreen = ({ level, cameraTranslate }) => (
  <div style={{ transform: cameraTranslate }}>
    <LevelBackgroundTilesLayer level={level} />
    <LevelPlacementsLayer level={level} />
  </div>
);

export default LevelScreen;
