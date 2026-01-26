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
const filterB = document.getElementById("filter");
const filterBackB = document.getElementById("filterBack");
const orderedB = document.getElementById("ordered");
const dictSpeakB = document.getElementById("dictSpeak");
const dictPrevB = document.getElementById("dictPrev");
const dictNextB = document.getElementById("dictNext");
const practiceBackB = document.getElementById("practiceBack");

const debugP = document.getElementById("debug");

const modeOptions = document.getElementById("modeOptions");

const practiceGrid = document.getElementById("practiceGrid");

const orderedStartInput = document.getElementById("orderedStartLetter");
const textInput = document.getElementById("textInput");
const scoreDisplay = document.getElementById("score");

const showMissedB = document.getElementById("showMissed");
const showFlaggedB = document.getElementById("showFlagged");
const reviewList = document.querySelector(".review-list");
const reviewBackB = document.getElementById("reviewBack");

const dictWordEl = document.getElementById("dictWord");
const dictDefinitionEl = document.getElementById("dictDefinition");
const dictSentenceEl = document.getElementById("dictSentence");

const wholeAnswer = document.querySelector(".answer");
const answerText = document.getElementById("answer-text");

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

let correctBuffer = null;
let wrongBuffer = null;
let audioUnlocked = false;

let ogWordsArray = [];
let wordsArray = [];
let index = 0;
let score =[0,0]
let point = true; 
let wrongs = [];
let flags = [];
let mode = "regular";
let screen = ".screen2";
let dictBackToggle = false;
let reviewMode = "missed";
let reviewWords = [];  
let dictIndex = 0;  

Papa.parse("words.csv", {
  download: true,
  header: true,
  complete: (results) => {
    ogWordsArray = results.data;
    run();
  }
});

function run() {
    initialLoading();
    
    //Event listeners
    enterB.addEventListener("click", () => {
        submit(textInput.value.trim());
    });
    answerB.addEventListener("click", () => {
        showAnswer(wordsArray[index].Word);
    });
    filterB.addEventListener("click", () => {
        setScreen(".screen-filter");
    });
    audioB.addEventListener("click", () => {
        speak(wordsArray[index].Word);
    });
    practiceBackB.addEventListener("click", () => {
        setScreen(".screen2");
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
        if (mode === "practice") {
            startPractice();
        } else {
            setScreen(".screen1");
            speak(wordsArray[index].Word);
        }
    });
    backB.addEventListener("click", () => {
        setScreen(".screen2");
    });
    back2B.addEventListener("click", () => {
        setScreen(".screen2");
        if (mode === "ordered") {
            orderedStartInput.value = orderedStartInput.value.toUpperCase();
            index = -1;
            for (let i = 0; i < wordsArray.length; i++) {
                if (wordsArray[i].Word.toUpperCase().startsWith(orderedStartInput.value)) {
                    index = i;
                    break;
                }
            }

            if (index > -1) {
                saveOrderedLetters();
            } else {
                orderedStartInput.value = "";
                index = 0;
            }
        }
    });
     dictBackB.addEventListener("click", () => {
        if (dictBackToggle) {
            setScreen(".screen-review");
        } else {
            setScreen(".screen-practice");
        }   
    });
    filterBackB.addEventListener("click", () => {
        setScreen(".screen2");
        filterWords();
    });
    modeB.addEventListener("click", () => {
        setScreen(".screen-mode");
    });
    document.querySelectorAll(".mode-card").forEach(card => {
        card.addEventListener("click", () => {
            mode = card.dataset.mode;

            document.querySelectorAll(".mode-card").forEach(c =>
                c.classList.remove("active")
                );

            card.classList.add("active");

            saveMode();
            if (mode === "ordered") {
                modeOptions.classList.remove("hidden");
            } else {
                modeOptions.classList.add("hidden");
            }
            if (mode === "regular") {
                random();
            } else if (mode === "ordered") {
              loadOrderedIndex();
            }

        });
    });
    reviewB.addEventListener("click", () => {
        loadReviewMode();
        renderReview();
        setScreen(".screen-review");
    });

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
     reviewBackB.addEventListener("click", () => {
   
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
    dictSpeakB.addEventListener("click", () => {
       const text = dictWordEl.textContent;
        speak(text);
    });

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
    textInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            submit(textInput.value.trim());   
        }
    });
    //Screen 1 functions

    function random () {
        if (mode === "regular") {
            index = Math.floor(Math.random() * wordsArray.length);
        } else if (mode === "ordered") {
            index++;
            if (index >= wordsArray.length) {
                index = 0; 
            }
        }
        debugP.innerText = "Index: " + index + " | Word: " + wordsArray[index].Word + "| Mode: " + mode;
        saveOrderedIndex();
        hideAnswer();
    }


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


    //Dict Functions

    function openDictFromReview(idx) {
        dictIndex = idx;
        reviewWords = reviewMode === "missed" ? wrongs : flags;
        showDictWord();
        setScreen(".screen-dictionary");
    }

    function showDictWord() {
        const wordObj = ogWordsArray.find(w => w.Word === reviewWords[dictIndex]);
        if(!wordObj) return;

        dictWordEl.textContent = wordObj.Word;
        dictDefinitionEl.textContent = wordObj.Definition;
        dictSentenceEl.textContent = wordObj.Sentence;

        dictPrevB.disabled = dictIndex === 0;
        dictNextB.disabled = dictIndex === reviewWords.length - 1;

        dictPrevB.style.background = dictPrevB.disabled ? "#d1d5db" : "linear-gradient(135deg, #6366f1, #4f46e5)";
        dictNextB.style.background = dictNextB.disabled ? "#d1d5db" : "linear-gradient(135deg, #6366f1, #4f46e5)";
    }

    //Review functions

    function renderReview() {
        reviewList.innerHTML = "";
        reviewWords = reviewMode === "missed" ? wrongs : flags;

    
        const addDiv = document.createElement("div");
        addDiv.classList.add("review-item");

        addDiv.innerHTML = `
            <input type="text" placeholder="Add a word…" class="review-add-input"/>
            <button class="add-btn">+</button>
        `;

        const input = addDiv.querySelector("input");
        const addBtn = addDiv.querySelector(".add-btn");

        function addWord() {
            const raw = input.value.trim();
            if (!raw) return;

            const found = getWordFromOG(raw);
            if (!found) {
                input.classList.add("invalid");
                return;
            }

            const list = reviewMode === "missed" ? wrongs : flags;
            if (list.includes(found.Word)) return;

            list.unshift(found.Word);
            input.value = "";
            input.classList.remove("invalid");

            saveData();
            renderReview();
        }

        addBtn.addEventListener("click", addWord);
        input.addEventListener("keydown", e => {
            if (e.key === "Enter") addWord();
        });

        reviewList.appendChild(addDiv);

 
        if (reviewWords.length === 0) {
            const p = document.createElement("p");
            p.textContent = "No words here!";
            p.style.color = "#64748b";
            p.style.textAlign = "center";
            reviewList.appendChild(p);
            return;
        }

    
        reviewWords.forEach((word, idx) => {
            const div = document.createElement("div");
            div.classList.add("review-item");

            div.innerHTML = `
                <span class="review-word">${word}</span>
                <button data-word="${word}">−</button>
            `;
            const btn = div.querySelector("button");
            btn.addEventListener("click", e => {
                e.stopPropagation();
                btn.classList.toggle("removed");
            });

            div.querySelector(".review-word").addEventListener("click", () => {
                openDictFromReview(idx);
            });

            reviewList.appendChild(div);
        });

    }
    function getWordFromOG(word) {
        return ogWordsArray.find(
            w => w.Word.toLowerCase() === word.toLowerCase()
        );
    }

    //Practice functions
    
    function getRandomWords(count) {
        const shuffled = [...wordsArray].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count).map(w => w.Word);
    }

    function startPractice() {
        reviewWords = getRandomWords(Math.min(9, wordsArray.length)); 
        dictIndex = 0;

        practiceGrid.innerHTML = "";
        let indexer = 0;
        reviewWords.forEach((word, idx) => {
            indexer++;
            const div = document.createElement("div");
            div.classList.add("practice-word");
            div.textContent = indexer + ": " + word;

            div.addEventListener("click", () => {
                dictIndex = idx;
                showDictWord();
                setScreen(".screen-dictionary");
            });
            practiceGrid.appendChild(div);
        });

        setScreen(".screen-practice");
    }
    
    //Word filtering
    function filterWords() {
    
        wordsArray = structuredClone(ogWordsArray);

    
        const hyphenChecked = document.getElementById("filterHyphen").checked;
        const spaceChecked = document.getElementById("filterSpace").checked;
        const capsChecked = document.getElementById("filterCaps").checked;
        const ableChecked = document.getElementById("filterAble").checked;
        const starredChecked = document.getElementById("filterStarred").checked;
        const missedChecked = document.getElementById("filterMissed").checked;

   
        wordsArray = wordsArray.filter(wordObj => {
     
            if (!hyphenChecked && !spaceChecked && !capsChecked && !ableChecked && !starredChecked && !missedChecked) {
                return true;
            }

    
            return (
                (hyphenChecked && wordObj.Word.includes('-')) ||
                (spaceChecked && wordObj.Word.includes(' ')) ||
                (capsChecked && /[A-Z]/.test(wordObj.Word)) ||
                (ableChecked && /(able|ible)$/i.test(wordObj.Word)) ||
                (starredChecked && flags.includes(wordObj.Word)) ||
                (missedChecked && wrongs.includes(wordObj.Word))
            );
        });
        if (wordsArray.length === 0) {
            wordsArray = structuredClone(ogWordsArray);
        }
        if (index >= wordsArray.length) {
            random();
        }
        hideAnswer();
    } 

    //Sound effects

   function speak(text) {
        speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = 'en-US'; 
        speech.pitch = 1; 
        speech.rate = 0.75; 
        speechSynthesis.speak(speech);
        };
    
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

    // Data saving/loading

    function initialLoading() {
        initAudio();
        loadMode();
        wordsArray = structuredClone(ogWordsArray);
        loadOrderedLetters();
        loadData();
        loadScreen();
        updateScore();
        loadCheckboxes();
        filterWords();
        if (mode === "regular") {
            random();
        } else if (mode === "ordered") {
            loadOrderedIndex();
        }
    
    }
    function loadCheckboxes() {
        const boxes = document.querySelectorAll('.filter-options input[type="checkbox"]');

        boxes.forEach(checkbox => {
            const saved = localStorage.getItem(checkbox.id);
            if (saved !== null) checkbox.checked = saved === 'true';
            checkbox.addEventListener('change', () => {
                localStorage.setItem(checkbox.id, checkbox.checked);
                filterWords();
            });
        });
    }

    function saveOrderedLetters() {
        localStorage.setItem("orderedStartLetter", orderedStartInput.value);
    }
    function loadOrderedLetters() {
         const orderedStartLetter = localStorage.getItem("orderedStartLetter");
        if (orderedStartLetter) {
            orderedStartInput.value = orderedStartLetter;
    }

    }
    function saveMode() {
        localStorage.setItem("davejuguemosMode", mode);
    }
    function loadMode() {
        const savedMode = localStorage.getItem("davejuguemosMode");
        if (savedMode) {
            mode = savedMode;
            document
            .querySelector(`.mode-card[data-mode="${savedMode}"]`)
            ?.classList.add("active");
            if (mode === "ordered") {
                modeOptions.classList.remove("hidden"); 
            }
        }
    }
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
    function saveOrderedIndex() {
        if (mode !== "ordered") return;
        localStorage.setItem("orderedIndex", index);
    }
    function loadOrderedIndex() {
        if (mode !== "ordered") return;
        const saved = localStorage.getItem("orderedIndex");
        if (saved === null) return;

        const parsed = Number(saved);

        if (!Number.isInteger(parsed)) return;

    
        index = Math.max(0, Math.min(parsed, wordsArray.length - 1));
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
        if (screen === ".screen-review" || screen === ".screen-dictionary" || screen === ".screen-practice") {
            screen = ".screen2";
        }
        setScreen(screen);
    }

    //Misc functions
      function setScreen(screen1) {
        document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
        document.querySelector(screen1).classList.remove("hidden");
        screen = screen1;
        saveScreen();
        if (screen1 === ".screen-review") {
            dictBackToggle = true;
        } else if (screen1 === ".screen-practice") {
            dictBackToggle = false;
        }

    }
}

