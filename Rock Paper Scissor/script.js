const gameContainer = document.querySelector(".container");
const userResult = document.querySelector(".user_result img");
const cpuResult = document.querySelector(".cpu_result img");
const result = document.querySelector(".result");
const optionImages = document.querySelectorAll(".option_image");
const stars = document.querySelectorAll(".stars i");
const ratingBox = document.querySelector(".rating-box");
const submitButton = document.querySelector("button");
let times = 0;

ratingBox.style.display = "none";

submitButton.addEventListener("click", () => {
    ratingBox.style.display = "none";
})
stars.forEach((star,index1) => {
    star.addEventListener("click", () => {
	stars.forEach((star,index2) => {
            index1 >= index2 ? star.classList.add("active") : star.classList.remove("active");
	})
    })
})

optionImages.forEach((image, index) => {
    image.addEventListener("click", (e) => {
        image.classList.add("active");

        userResult.src = "images/rock.png";
        cpuResult.src = "images/rock.png";

        result.textContent = "Wait...";
        optionImages.forEach((image2, index2) => {
            index !== index2 && image2.classList.remove("active");
        });

        gameContainer.classList.add("start");

        let time = setTimeout(() => {
            gameContainer.classList.remove("start");

            let imageSrc = e.target.querySelector("img").src;

            userResult.src = imageSrc;

            let randomNumber = Math.floor(Math.random() * 3);
            let cpuImages = [
                "images/rock.png",
                "images/paper.png",
                "images/scissors.png",
            ];

            cpuResult.src = cpuImages[randomNumber];

            let cpuValue = ["R", "P", "S"][randomNumber];
            let userValue = ["R", "P", "S"][index];

            let outcomes = {
                RR: "Draw",
                RP: "Cpu",
                RS: "User",
                PR: "User",
                PP: "Draw",
                PS: "Cpu",
                SR: "Cpu",
                SP: "User",
                SS: "Draw",
            };

            let outComeValue = outcomes[userValue + cpuValue];
            
            times++;
            
            setTimeout(() => {
                if(times === 10){
                    ratingBox.style.display = "block";
                }
            }, 1000);
            
            result.textContent =
                userValue === cpuValue
                    ? `Match ${outComeValue}`
                    : `${outComeValue} wins!`;
        }, 2500);
    });
});
