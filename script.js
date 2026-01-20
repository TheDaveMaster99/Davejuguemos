
const enterB = document.getElementById("enter");
const answerB = document.getElementById("answer");
const audioB = document.getElementById("audio");
const resetB = document.getElementById("reset");
const sentenceB = document.getElementById("sentence");
const definitionB = document.getElementById("definition");

const textInput = document.getElementById("textInput");
const scoreDisplay = document.getElementById("score");

const wholeAnswer = document.querySelector(".answer");
const answerText = document.getElementById("answer-text");

const correctSound = new Audio("correct.mp3");
const wrongSound = new Audio("wrong.mp3");
correctSound.preload = "auto";
wrongSound.preload = "auto";

let wordsArray = [];
let index;
let score =[0,0]
let point = true; 

Papa.parse("words.csv", {
  download: true,
  header: true,
  complete: (results) => {
    wordsArray = results.data;
    run();
  }
});

function run() {
    random();
    speak(wordsArray[index].Word);

    enterB.addEventListener("click", () => {
        submit(textInput.value.trim());
    });
    answerB.addEventListener("click", () => {
        showAnswer(wordsArray[index].Word);
    });
    resetB.addEventListener("click", () => {
        score = [0,0];
        scoreDisplay.innerText = "0/0 = 0%";
    });
    audioB.addEventListener("click", () => {
        speak(wordsArray[index].Word);
    });
     definitionB.addEventListener("click", () => {
        speak(wordsArray[index].Definition);
    });
     sentenceB.addEventListener("click", () => {
        speak(wordsArray[index].Sentence);
    });
    textInput.addEventListener("input", () => {
    const value = textInput.value;
    if (value.endsWith("   ") || value.endsWith(".  ")) {
        submit(value.slice(0, value.length-3).trim());  
    }
    });

    function random () {
        index = Math.floor(Math.random() * wordsArray.length);
    }
    function speak(text) {
        speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = 'en-US'; 
        speech.pitch = 1; 
        speech.rate = 0.75; 
        speechSynthesis.speak(speech);
        };
    function submit(answer) { 
        if (answer === wordsArray[index].Word) {
            if (point) {
                score[0]++;
            }
            point = true;
            score[1]++;
            textInput.value = "";
            random();
            hideAnswer();
            correctSound.play();
        } else {
            point = false;
            wrongSound.play();
            textInput.value = answer;
        }
        setTimeout(() => {
        speak(wordsArray[index].Word);
        }, 1200);

        if(score[1] > 0){
            scoreDisplay.innerText = score[0] + "/" + score[1] + " = " + (Math.round(((score[0]/score[1])*100).toFixed(2))) + "%";
        } 
    }
}
function showAnswer(answer) {
  answerText.textContent = answer;   
  wholeAnswer.classList.remove("hidden"); 
}

function hideAnswer() {
  wholeAnswer.classList.add("hidden"); 
}
