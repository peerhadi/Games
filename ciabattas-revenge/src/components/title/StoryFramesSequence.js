import { useEffect, useRef, useState } from "react";
import PixelSentence from "../pixel-text/PixelSentence";
import styles from './StoryFramesSequence.module.css'
import { StoryFramesPreloader } from "@/classes/StoryFramesPreloader";

export default function StoryFramesSequence({ startShowing, onEnter, storyFrames }) {
  const [isReady, setIsReady] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const loadedImageFramesRef = useRef(null);

  useEffect(() => {
    const startPreloading = async () => {
      const preloader = new StoryFramesPreloader(storyFrames);
      await preloader.init((loadedImageFrames) => {
        loadedImageFramesRef.current = loadedImageFrames;
        setIsReady(true);
      })
    }
    startPreloading();
  }, [storyFrames])
  useEffect(() => {
    if (isReady && startShowing) {
      setIsStarted(true)
      setPromptIndex(0)
    }
  }, [isReady, startShowing])

  const order = loadedImageFramesRef.current;
  if (!isReady || !isStarted) {
    return;
  }

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer} key={order[promptIndex].prompt}>
        <img
          className={styles.storyImage}
          src={order[promptIndex].img}
          alt={"Story"} />
        <div className={styles.textContainer}>
          <PixelSentence
            centeredText={true}
            textString={order[promptIndex].prompt}
            onDone={() => {
              if (startShowing) {
                if (promptIndex === order.length - 1) {
                  onEnter();
                  return;
                }
                setPromptIndex(promptIndex + 1)
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
