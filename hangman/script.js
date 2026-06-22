const letterContainer = document.getElementById("letter-container");
const optionsContainer = document.getElementById("options-container");
const userInputSection = document.getElementById("user-input-section");
const newGameContainer = document.getElementById("new-game-container");
const newGameButton = document.getElementById("new-game-button");
const canvas = document.getElementById("canvas");
const resultText = document.getElementById("result-text");
function getCountries(lang = 'en') {
    const A = 65
    const Z = 90
    const countryName = new Intl.DisplayNames([lang], { type: 'region' });
    const countries = {}
    for (let i = A; i <= Z; ++i) {
        for (let j = A; j <= Z; ++j) {
            let code = String.fromCharCode(i) + String.fromCharCode(j)
            let name = countryName.of(code)
            if (code !== name) {
                countries[code] = name
            }
        }
    }
    return countries
}

let options = {
    fruits: [
        "Apple",
        "Apricot",
        "Avocado",
        "Banana",
        "Blackberry",
        "Blueberry",
        "Cantaloupe",
        "Cherry",
        "Coconut",
        "Cranberry",
        "Date",
        "Dragonfruit",
        "Elderberry",
        "Fig",
        "Grape",
        "Grapefruit",
        "Guava",
        "Honeydew",
        "Jackfruit",
        "Kiwi",
        "Kumquat",
        "Lemon",
        "Lime",
        "Lychee",
        "Mango",
        "Mulberry",
        "Nectarine",
        "Orange",
        "Papaya",
        "Passion fruit",
        "Peach",
        "Pear",
        "Pineapple",
        "Plum",
        "Pomegranate",
        "Quince",
        "Raspberry",
        "Redcurrant",
        "Starfruit",
        "Strawberry",
        "Tangerine",
        "Ugli fruit",
        "Watermelon",
        "Acai berry",
        "Acerola",
        "Appleberry",
        "Blackcurrant",
        "Blood orange",
        "Boysenberry",
        "Carambola",
        "Cherimoya",
        "Cranberry",
        "Currant",
        "Dewberry",
        "Durian",
        "Elderberry",
        "Feijoa",
        "Gooseberry",
        "Huckleberry",
        "Jambul",
        "Key lime",
        "Kumquat",
        "Longan",
        "Loquat",
        "Lychee",
        "Mandarin",
        "Mamey",
        "Marula",
        "Medlar",
        "Mombin",
        "Mulberry",
        "Orange",
        "Papaw",
        "Passion fruit",
        "Pawpaw",
        "Persimmon",
        "Pineapple",
        "Pineberry",
        "Plum",
        "Pomegranate",
        "Pomelo",
        "Quince",
        "Redcurrant",
        "Rhubarb",
        "Sea buckthorn",
        "Soursop",
        "Starfruit",
        "Tamarillo",
        "Ugli fruit",
        "White currant",
        "Yellow plum",
        "Yellow watermelon",
        "Zinfandel grape",
        "Black sapote",
        "Chayote",
        "Cherimoya",
        "Jackfruit",
        "Loquat",
        "Serviceberry",
        "Ugli fruit",
    ],

    animals: [
        "Aardvark",
        "Albatross",
        "Alligator",
        "Alpaca",
        "Ant",
        "Anteater",
        "Antelope",
        "Ape",
        "Armadillo",
        "Donkey",
        "Baboon",
        "Badger",
        "Barracuda",
        "Bat",
        "Bear",
        "Beaver",
        "Bee",
        "Bison",
        "Boar",
        "Buffalo",
        "Butterfly",
        "Camel",
        "Capybara",
        "Caribou",
        "Cassowary",
        "Cat",
        "Caterpillar",
        "Cattle",
        "Chamois",
        "Cheetah",
        "Chicken",
        "Chimpanzee",
        "Chinchilla",
        "Chough",
        "Clam",
        "Cobra",
        "Cockroach",
        "Cod",
        "Cormorant",
        "Coyote",
        "Crab",
        "Crane",
        "Crocodile",
        "Crow",
        "Curlew",
        "Deer",
        "Dinosaur",
        "Dog",
        "Dogfish",
        "Dolphin",
        "Dotterel",
        "Dove",
        "Dragonfly",
        "Duck",
        "Dugong",
        "Dunlin",
        "Eagle",
        "Echidna",
        "Eel",
        "Eland",
        "Elephant",
        "Elk",
        "Emu",
        "Falcon",
        "Ferret",
        "Finch",
        "Fish",
        "Flamingo",
        "Fly",
        "Fox",
        "Frog",
        "Gaur",
        "Gazelle",
        "Gerbil",
        "Giraffe",
        "Gnat",
        "Gnu",
        "Goat",
        "Goldfinch",
        "Goldfish",
        "Goose",
        "Gorilla",
        "Goshawk",
        "Grasshopper",
        "Grouse",
        "Guanaco",
        "Gull",
        "Hamster",
        "Hare",
        "Hawk",
        "Hedgehog",
        "Heron",
        "Herring",
        "Hippopotamus",
        "Hornet",
        "Horse",
        "Human",
        "Hummingbird",
        "Hyena",
        "Ibex",
        "Ibis",
        "Jackal",
        "Jaguar",
        "Jay",
        "Jellyfish",
        "Kangaroo",
        "Kingfisher",
        "Koala",
        "Kookabura",
        "Kouprey",
        "Kudu",
        "Lapwing",
        "Lark",
        "Lemur",
        "Leopard",
        "Lion",
        "Llama",
        "Lobster",
        "Locust",
        "Loris",
        "Louse",
        "Lyrebird",
        "Magpie",
        "Mallard",
        "Manatee",
        "Mandrill",
        "Mantis",
        "Marten",
        "Meerkat",
        "Mink",
        "Mole",
        "Mongoose",
        "Monkey",
        "Moose",
        "Mosquito",
        "Mouse",
        "Mule",
        "Narwhal",
        "Newt",
        "Nightingale",
        "Octopus",
        "Okapi",
        "Opossum",
        "Oryx",
        "Ostrich",
        "Otter",
        "Owl",
        "Oyster",
        "Panther",
        "Parrot",
        "Partridge",
        "Peafowl",
        "Pelican",
        "Penguin",
        "Pheasant",
        "Pig",
        "Pigeon",
        "Pony",
        "Porcupine",
        "Porpoise",
        "Quail",
        "Quelea",
        "Quetzal",
        "Rabbit",
        "Raccoon",
        "Rail",
        "Ram",
        "Rat",
        "Raven",
        "Red deer",
        "Red panda",
        "Reindeer",
        "Rhinoceros",
        "Rook",
        "Salamander",
        "Salmon",
        "Sand Dollar",
        "Sandpiper",
        "Sardine",
        "Scorpion",
        "Seahorse",
        "Seal",
        "Shark",
        "Sheep",
        "Shrew",
        "Skunk",
        "Snail",
        "Snake",
        "Sparrow",
        "Spider",
        "Spoonbill",
        "Squid",
        "Squirrel",
        "Starling",
        "Stingray",
        "Stinkbug",
        "Stork",
        "Swallow",
        "Swan",
        "Tapir",
        "Tarsier",
        "Termite",
        "Tiger",
        "Toad",
        "Trout",
        "Turkey",
        "Turtle",
        "Viper",
        "Vulture",
        "Wallaby",
        "Walrus",
        "Wasp",
        "Weasel",
        "Whale",
        "Wildcat",
        "Wolf",
        "Wolverine",
        "Wombat",
        "Woodcock",
        "Woodpecker",
        "Worm",
        "Wren",
        "Yak",
        "Zebra"
    ],
    countries: [
        "Afghanistan",
        "Albania",
        "Algeria",
        "Andorra",
        "Angola",
        "Antigua and Barbuda", 
        "Argentina",
        "Armenia",
        "Australia",
        "Austria",
        "Azerbaijan",
        "The Bahamas",
        "Bahrain",
        "Bangladesh",
        "Barbados",
        "Belarus",
        "Belgium",
        "Belize",
        "Benin",
        "Bhutan",
        "Bolivia",
        "Bosnia and Herzegovina",
        "Botswana",
        "Brazil",
        "Brunei",
        "Bulgaria",
        "Burkina Faso",
        "Burundi",
        "Cabo Verde",
        "Cambodia",
        "Cameroon",
        "Canada",
        "Central African Republic",
        "Chad",
        "Chile",
        "China",
        "Colombia",
        "Comoros",
        "Congo Democratic Republic of the People",
        "Congo Republic of the People",
        "Costa Rica",
        "Cote d Ivoire",
        "Croatia",
        "Cuba",
        "Cyprus",
        "Czech Republic",
        "Denmark",
        "Djibouti",
        "Dominica",
        "Dominican Republic",
    ]
};

options.countries.forEach((x) => {
    for(let i = 0; i < x.length; i++){
        if(!Array.from('qwertyuiopasdfghjklzxcvbnm')[i]){
            console.log(x)
        }
    }
})
function getUnique(arr) {
    let ans = [];

    for (let i = 0; i < arr.length; i++) {
        if (!ans.includes(arr[i])) {
            ans.push(arr[i])
        }
    }

    return ans;
}

options.fruits = getUnique(options.fruits)
options.countries = getUnique(options.countries)
let winCount = 0;
let count = 0;

let chosenWord = "";

const displayOptions = () => {
    optionsContainer.innerHTML += `<h3>Please Select An Option</h3>`;
    let buttonCon = document.createElement("div");

    for (let value in options) {
        buttonCon.innerHTML += `<button class="options" onclick="generateWord('${value}')">${value}</button>`;
    }

    optionsContainer.appendChild(buttonCon);
};

const blocker = () => {
    let optionsButtons = document.querySelectorAll(".options");
    let letterButtons = document.querySelectorAll(".letters");

    optionsButtons.forEach((button) => {
        button.disabled = true;
    });

    letterButtons.forEach((button) => {
        button.disabled.true;
    });

    newGameContainer.classList.remove("hide");
};

const generateWord = (optionValue) => {
    let optionButtons = document.querySelectorAll(".options");

    optionButtons.forEach((button) => {
        if (button.innerText.toLowerCase() === optionValue) {
            button.classList.add("acitve");
        }

        button.disabled = true;
    });

    letterContainer.classList.remove("hide");
    userInputSection.innerText = "";

    let optionArray = options[optionValue];

    chosenWord = optionArray[Math.floor(Math.random() * optionArray.length)];
    chosenWord = chosenWord.toUpperCase();

    let displayItem = chosenWord.replace(/./g, `<span class="dashes">_</span>`);

    userInputSection.innerHTML = displayItem;
};

const initializer = () => {
    winCount = 0;
    count = 0;

    userInputSection.innerHTML = "";
    optionsContainer.innerHTML = "";
    letterContainer.classList.add("hide");
    newGameContainer.classList.add("hide");
    letterContainer.innerHTML = "";

    for (let i = 65; i < 91; i++) {
        let button = document.createElement("button");
        button.classList.add("letters");

        button.innerText = String.fromCharCode(i);

        button.addEventListener("click", () => {
            let charArray = chosenWord.split("");
            let dashes = document.getElementsByClassName("dashes");

            if (charArray.includes(button.innerText)) {
                charArray.forEach((chara, index) => {
                    if (chara === button.innerText) {
                        dashes[index].innerText = chara;

                        winCount += 1;

                        if (winCount === charArray.filter(x => x != ' ').length) {
                            resultText.innerHTML = `<h2 class='win-msg'>You Win!</h1>
                                                <p>The word was<span> ${chosenWord}</span></p>`;

                            blocker();
                        }
                    }
                });
            } else {
                count += 1;

                drawMan(count);

                if (count == 6) {
                    resultText.innerHTML = `<h2 class='lose-msg'>You Lose!</h2>
                                            <p> The word was <span>${chosenWord}</span></p>`;

                    blocker();
                }
            }

            button.disabled = true;
        });

        letterContainer.append(button);
    }

    displayOptions();

    let { initialDrawing } = canvasCreator();

    initialDrawing();
};

const canvasCreator = () => {
    let context = canvas.getContext("2d");

    context.beginPath();
    context.strokeStyle = "#000";
    context.lineWidth = 2;

    const drawLine = (fromX, fromY, toX, toY) => {
        context.moveTo(fromX, fromY);
        context.lineTo(toX, toY);
        context.stroke();
    };

    const head = () => {
        context.beginPath();
        context.arc(170, 30, 10, 0, Math.PI * 2, true);
        context.stroke();
    };

    const body = () => {
        drawLine(170, 40, 170, 80);
    };

    const leftArm = () => {
        drawLine(190, 50, 170, 70);
    };

    const rightArm = () => {
        drawLine(150, 50, 170, 70);
    };

    const leftLeg = () => {
        drawLine(170, 80, 190, 110);
    };

    const rightLeg = () => {
        drawLine(170, 80, 150, 110);
    };

    const initialDrawing = () => {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        drawLine(110, 130, 230, 130);

        drawLine(10, 10, 10, 10, 131);

        drawLine(210, 10, 120, 10);

        drawLine(210, 10, 210, 20);
    };

    return { initialDrawing, head, body, leftArm, rightArm, leftLeg, rightLeg };
};

const drawMan = (count) => {
    let { head, body, leftArm, rightArm, leftLeg, rightLeg } = canvasCreator();

    switch (count) {
        case 1:
            head();
            break;
        case 2:
            body();
            break;
        case 3:
            leftArm();
            break;
        case 4:
            rightArm();
            break;
        case 5:
            leftLeg();
            break;
        case 6:
            rightLeg();
            break;
        default:
            break;
    }
};

newGameButton.addEventListener("click", initializer);
window.onload = initializer;
