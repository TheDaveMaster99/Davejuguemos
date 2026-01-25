const enterB = document.getElementById("enter");
const answerB = document.getElementById("answer");
const audioB = document.getElementById("audio");
const sentenceB = document.getElementById("sentence");
const definitionB = document.getElementById("definition");
const flagB = document.getElementById("flag");
const beginB = document.getElementById("begin");
const backB = document.getElementById("back");
const modeB = document.getElementById("mode");
const back2B = document.getElementById("back2");
const reviewB = document.getElementById("review");
const dictBackB = document.getElementById("dictBack");

const textInput = document.getElementById("textInput");
const scoreDisplay = document.getElementById("score");

const wholeAnswer = document.querySelector(".answer");
const answerText = document.getElementById("answer-text");

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

let correctBuffer = null;
let wrongBuffer = null;
let audioUnlocked = false;

async function loadSound(url) {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    return await audioCtx.decodeAudioData(arrayBuffer);
}

async function initAudio() {
    correctBuffer = await loadSound("correct.mp3");
    wrongBuffer = await loadSound("wrong.mp3");
}

function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    audioCtx.resume();
}

document.addEventListener("click", unlockAudio, { once: true });
document.addEventListener("keydown", unlockAudio, { once: true });

initAudio();


let ogWordsArray = [];
let wordsArray = [];
let index;
let score =[0,0]
let point = true; 
let wrongs = [];
let flags = [];
let mode;
let screen = ".screen2";



Papa.parse("words.csv", {
  download: true,
  header: true,
  complete: (results) => {
    ogWordsArray = results.data;
    run();
  }
});

function run() {
    wordsArray = structuredClone(ogWordsArray);
    random();
    loadData();
    loadScreen();
    updateScore();
    enterB.addEventListener("click", () => {
        submit(textInput.value.trim());
    });
    answerB.addEventListener("click", () => {
        showAnswer(wordsArray[index].Word);
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

    beginB.addEventListener("click", () => {
        setScreen(".screen1");
        speak(wordsArray[index].Word);
    });
    backB.addEventListener("click", () => {
        setScreen(".screen2");
    });
    back2B.addEventListener("click", () => {
        setScreen(".screen2");
    });
    dictBackB.addEventListener("click", () => {
    setScreen(".screen-review"); 
});

    modeB.addEventListener("click", () => {
        setScreen(".screen-mode");
    });
    reviewB.addEventListener("click", () => {
        setScreen(".screen-review");
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
            playCorrect();
        } else {
            point = false;
            playWrong();
            textInput.value = answer;
            if (!wrongs.includes(wordsArray[index].Word)) {
                wrongs.push(wordsArray[index].Word);
            }
        }

        setTimeout(() => speak(wordsArray[index].Word), 1200);

       updateScore();
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
    function updateScore() {
        if(score[1] > 0) {
            scoreDisplay.innerText = score[0] + "/" + score[1] + " = " + (Math.round(((score[0]/score[1])*100))) + "%";
        }
    }
    function showAnswer(answer) {
        answerText.textContent = answer;   
        wholeAnswer.classList.remove("hidden"); 
    }

    function hideAnswer() {
        wholeAnswer.classList.add("hidden"); 
    }

    function playCorrect() {
        if (!correctBuffer) return;
            const src = audioCtx.createBufferSource();
            src.buffer = correctBuffer;
            src.connect(audioCtx.destination);
            src.start();
    }

    function playWrong() {
        if (!wrongBuffer) return;
            const src = audioCtx.createBufferSource();
            src.buffer = wrongBuffer;
            src.connect(audioCtx.destination);
        src.start();
    }

    document.querySelectorAll(".mode-card").forEach(card => {
        card.addEventListener("click", () => {
            mode = card.dataset.mode;

            document.querySelectorAll(".mode-card").forEach(c =>
                c.classList.remove("active")
                );

            card.classList.add("active");

            localStorage.setItem("davejuguemosMode", mode);
        });
    });


    const savedMode = localStorage.getItem("davejuguemosMode");
    if (savedMode) {
        mode = savedMode;
        document
        .querySelector(`.mode-card[data-mode="${savedMode}"]`)
        ?.classList.add("active");
    }

    function saveScreen() {
        const data2 = {
            screen: screen
        };                
        localStorage.setItem("data", JSON.stringify(data2)); 
    }
    function loadScreen() {
        const savedData2 = localStorage.getItem("data");

        if (savedData2) {
            const data2 = JSON.parse(savedData2);

            screen = data2.screen || ".screen2";
        } else {
            screen = ".screen2";
        } 
        if (screen === ".screen-review" || screen === ".screen-dictionary") {
            screen = ".screen2";
        }
        setScreen(screen);
    }

  function setScreen(screen1) {
        document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
        document.querySelector(screen1).classList.remove("hidden");
        screen = screen1;
        saveScreen();
    }
    const showMissedB = document.getElementById("showMissed");
const showFlaggedB = document.getElementById("showFlagged");
const reviewList = document.querySelector(".review-list");
const reviewBackB = document.getElementById("reviewBack");

let reviewMode = "missed"; // default

function saveReviewMode() {
    const data3 = {
        reviewMode: reviewMode
    };                
    localStorage.setItem("reviewData", JSON.stringify(data3)); 
}
function loadReviewMode() {
    const savedData3 = localStorage.getItem("reviewData");

    if (savedData3) {
        const data3 = JSON.parse(savedData3);

        reviewMode = data3.reviewMode || "missed";
        if(reviewMode === "flagged") {
            showFlaggedB.classList.add("active");
            showMissedB.classList.remove("active");
        } else {
            showMissedB.classList.add("active");
            showFlaggedB.classList.remove("active");
        }
    } else {
        reviewMode = "missed";
    }
}
// Open the review screen
reviewB.addEventListener("click", () => {
    loadReviewMode();
    renderReview();
    setScreen(".screen-review");
});

// Toggle between missed and flagged
showMissedB.addEventListener("click", () => {
    reviewMode = "missed";
    showMissedB.classList.add("active");
    showFlaggedB.classList.remove("active");
    saveReviewMode();
    renderReview();
});

showFlaggedB.addEventListener("click", () => {
    reviewMode = "flagged";
    showFlaggedB.classList.add("active");
    showMissedB.classList.remove("active");
    saveReviewMode();
    renderReview();
});

// Back button
reviewBackB.addEventListener("click", () => {
    // Remove words marked for deletion
    reviewList.querySelectorAll(".review-item button.removed").forEach(btn => {
        const word = btn.dataset.word;
        if(reviewMode === "missed") {
            wrongs = wrongs.filter(w => w !== word);
        } else {
            flags = flags.filter(w => w !== word);
        }
    });
    saveData();
    setScreen(".screen2");
});


// Dictionary screen elements
const dictWordEl = document.getElementById("dictWord");
const dictDefinitionEl = document.getElementById("dictDefinition");
const dictSentenceEl = document.getElementById("dictSentence");
const dictSpeakB = document.getElementById("dictSpeak");
const dictPrevB = document.getElementById("dictPrev");
const dictNextB = document.getElementById("dictNext");

let reviewWords = [];  // current review list (missed or flagged)
let dictIndex = 0;     // index in reviewWords

// Click on a word in review list to open dictionary
function openDictFromReview(idx) {
    dictIndex = idx;
    reviewWords = reviewMode === "missed" ? wrongs : flags;
    showDictWord();
    setScreen(".screen-dictionary");
}

// Update dictionary screen
function showDictWord() {
    const wordObj = wordsArray.find(w => w.Word === reviewWords[dictIndex]);
    if(!wordObj) return;

    dictWordEl.textContent = wordObj.Word;
    dictDefinitionEl.textContent = wordObj.Definition;
    dictSentenceEl.textContent = wordObj.Sentence;

    // Enable/disable nav buttons
    dictPrevB.disabled = dictIndex === 0;
    dictNextB.disabled = dictIndex === reviewWords.length - 1;

    dictPrevB.style.background = dictPrevB.disabled ? "#d1d5db" : "linear-gradient(135deg, #6366f1, #4f46e5)";
    dictNextB.style.background = dictNextB.disabled ? "#d1d5db" : "linear-gradient(135deg, #6366f1, #4f46e5)";
}

// Speak word or definition
dictSpeakB.addEventListener("click", () => {
    const text = dictWordEl.textContent;
    speak(text);
});

// Navigate up/down
dictPrevB.addEventListener("click", () => {
    if(dictIndex > 0) {
        dictIndex--;
        showDictWord();
    }
});
dictNextB.addEventListener("click", () => {
    if(dictIndex < reviewWords.length - 1) {
        dictIndex++;
        showDictWord();
    }
});

// Add click event to review items after rendering
function renderReview() {
    reviewList.innerHTML = "";
    reviewWords = reviewMode === "missed" ? wrongs : flags;

    if(reviewWords.length === 0) {
        reviewList.innerHTML = "<p style='color:#64748b;text-align:center'>No words here!</p>";
        return;
    }

    reviewWords.forEach((word, idx) => {
        const div = document.createElement("div");
        div.classList.add("review-item");

        div.innerHTML = `
            <span class="review-word">${word}</span>
            <button data-word="${word}">−</button>
        `;

        // Minus button
        const btn = div.querySelector("button");
        btn.addEventListener("click", (e) => {
            e.stopPropagation(); // prevent triggering word click
            btn.classList.toggle("removed");
        });

        // Word click -> open dictionary
        div.querySelector(".review-word").addEventListener("click", () => {
            openDictFromReview(idx);
        });

        reviewList.appendChild(div);
    });
}

}