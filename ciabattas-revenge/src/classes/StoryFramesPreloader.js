export class StoryFramesPreloader {
  constructor(inputFrameConfigs = []){
    this.inputFrames = inputFrameConfigs
  }

  async init(onDoneCallback){
    const promises = this.inputFrames.map((frame) => {
      return new Promise((resolve) => {
        const loadedImage = new Image();
        loadedImage.src = frame.img;
        loadedImage.onload = () => {
          resolve({
            ...frame,
            imageInstance: loadedImage
          })
        }
      })
    })

    const loadedImages = await Promise.all(promises);
    onDoneCallback(loadedImages)
  }
}
