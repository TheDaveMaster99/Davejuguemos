const enterB = document.getElementById("enter");
const answerB = document.getElementById("answer");
const audioB = document.getElementById("audio");
const resetB = document.getElementById("reset");
const sentenceB = document.getElementById("sentence");
const definitionB = document.getElementById("definition");
const flagB = document.getElementById("flag");

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
let wrongs = [];
let flags = [];



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
    loadData(); 
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
    flagB.addEventListener("click", () => {
        flagB.classList.toggle("yellow");
        if (flags.includes(wordsArray[index].Word)) {
            flags = flags.filter(word => word !== wordsArray[index].Word);
        } else {
            flags.push(wordsArray[index].Word);
        }
        saveData();
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
            if (!wrongs.includes(wordsArray[index].Word)) {
                wrongs.push(wordsArray[index].Word);
            }
        }
        setTimeout(() => {
        speak(wordsArray[index].Word);
        }, 1200);

        if(score[1] > 0){
            scoreDisplay.innerText = score[0] + "/" + score[1] + " = " + (Math.round(((score[0]/score[1])*100))) + "%";
        }
        if(flags.includes(wordsArray[index].Word)) {
            flagB.classList.add("yellow");
        } else {
            flagB.classList.remove("yellow");
        }
        saveData(); 
    }
    function saveData() {
    const data = {
        score: score,                 
        wrongs: wrongs,
        flags: flags
    };
    localStorage.setItem("davejuguemosData", JSON.stringify(data)); 
}
    function loadData() {
    const savedData = localStorage.getItem("davejuguemosData");

    if (savedData) {
        const data = JSON.parse(savedData);

        score = data.score || [0,0];
        wrongs = data.wrongs || [];   
        flags = data.flags || [];     
    } else {
        score = [0,0];
        wrongs = [];
        flags = [];
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
