const prompt1 =
  "A YOUNG PUFF NAMED CIABATTA BEGINS WORK AS AN INTERN AT GLOBAL BREAD TECHNOLOGY, A COMPANY ON THE GRID.";
const prompt2 =
  "CIABATTA WAS THE HARDEST WORKER EVERY DAY, YEAR AFTER YEAR, BUT WAS ALWAYS PASSED UP FOR PROMOTIONS BY MIDDLE MANAGEMENT.";
const prompt3 = "ONE DAY, AFTER PERFORMANCE REVIEWS, CIABATTA HAD HAD ENOUGH.";
const prompt3b = "ONE DAY, AFTER PERFORMANCE REVIEWS, CIABATTA HAD HAD ENOUGH."; // Change frame here?

const prompt4 =
  "CIABATTA OVERTHREW THE C-LEVELS AT THE TOP OF BREAD TOWER AND CLAIMED OWNERSHIP OF THE COMPANY.";

const prompt5 =
  "CIABATTA DISPATCHED HIS NETWORK OF MINIONS TO MANAGE THE DAY-TO-DAY.";

const prompt6 =
  "YOU, AS A NEW INTERN, MUST REASON WITH CIABATTA AT THE TOP OF THE TOWER.";

export const beginningFrames = [
  { prompt: prompt1, img: "./intro-story-frames/01.png" },
  { prompt: prompt2, img: "./intro-story-frames/02.png" },
  { prompt: prompt3, img: "./intro-story-frames/03.png" },
  { prompt: prompt3b, img: "./intro-story-frames/03b.png" },
  { prompt: prompt4, img: "./intro-story-frames/04.png" },
  { prompt: prompt5, img: "./intro-story-frames/05.png" },
  { prompt: prompt6, img: "./intro-story-frames/06.png" },
];

const endingPrompt1 =
  "CIABATTA, STUNNED IN DISAPPOINTMENT, GRUMBLES ABOUT STARTING HIS OWN COMPANY.";

const endingPrompt2 = "WITH A FLASH OF LIGHT, CIABATTA FLEES BREAD TOWER.";

const endingPrompt3 =
  "HE SWEARS HE WILL RETURN, PERHAPS WITH AN ACQUISITION OFFER.";

const endingPrompt4 =
  "UNTIL THEN, BREAD TOWER RESTS EASY. THANK YOU FOR YOUR SERVICE.";

export const endingFrames = [
  {
    prompt: endingPrompt1,
    img: "./outro-story-frames/out01.png",
  },
  { prompt: endingPrompt2, img: "./outro-story-frames/out02.png" },
  { prompt: endingPrompt3, img: "./outro-story-frames/out03.png" },
  { prompt: endingPrompt4, img: "./outro-story-frames/out04.png" },
];
