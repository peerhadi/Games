import TitleHowToPlay from "../title/TitleHowToPlay";
import TitleScreen from "../title/TitleScreen";

const TitleScreenWrapper = ({ titleScreenNumber, setTitleScreenNumber, setFrames }) => (
  <>
    <div
      style={{
        display: titleScreenNumber < 1 ? 'block' : 'none',
        width: '100vw',
        height: '100vh',
        position: 'absolute',
        zIndex: 1000,
      }}
    >
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

    <div
      style={{
        display: titleScreenNumber === 2 ? 'block' : 'none',
        width: '100vw',
        height: '100vh',
        position: 'absolute',
        zIndex: 800,
      }}
    >
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
);

export default TitleScreenWrapper;
