/* ==========================================================
   VoiceForge AI
   summarizer.js
   Offline Text Summarizer & Statistics
========================================================== */


(() => {
    "use strict";

/* ----------------------------------------------------------
    DOM Elements
---------------------------------------------------------- */

const summarizeBtn = document.getElementById("summarizeBtn");

const textArea = document.getElementById("textInput");

const wordCount = document.getElementById("wordCount");

const charCount = document.getElementById("charCount");

const readingTime = document.getElementById("readingTime");

/* ----------------------------------------------------------
   Stop Words
---------------------------------------------------------- */

const stopWords = new Set([
"a","an","the","is","am","are","was","were","be","been",
"being","to","of","and","or","for","in","on","with",
"this","that","these","those","at","by","from","as",
"it","its","if","into","about","than","then","so",
"but","not","can","could","would","should","will",
"have","has","had","do","does","did","you","your",
"he","she","they","them","their","we","our","i","me",
"my","his","her"
]);

/* ----------------------------------------------------------
   Statistics
---------------------------------------------------------- */

function updateStatistics() {

    const text = textArea.value.trim();

    const words = text.length
        ? text.split(/\s+/).length
        : 0;

    wordCount.textContent = words;

    charCount.textContent = text.length;

    const minutes = Math.max(
        1,
        Math.ceil(words / 200)
    );

    readingTime.textContent = `${minutes} min`;

}

/* ----------------------------------------------------------
   Clean Sentence
---------------------------------------------------------- */

function tokenize(sentence){

    return sentence
        .toLowerCase()
        .replace(/[^\w\s]/g,"")
        .split(/\s+/)
        .filter(word =>
            word &&
            !stopWords.has(word)
        );

}

/* ----------------------------------------------------------
   Build Frequency Map
---------------------------------------------------------- */

function buildFrequency(sentences){

    const frequency = {};

    sentences.forEach(sentence=>{

        tokenize(sentence).forEach(word=>{

            frequency[word] =
                (frequency[word] || 0) + 1;

        });

    });

    return frequency;

}

/* ----------------------------------------------------------
   Score Sentences
---------------------------------------------------------- */

function scoreSentences(sentences){

    const frequency =
        buildFrequency(sentences);

    return sentences.map(sentence=>{

        let score = 0;

        tokenize(sentence).forEach(word=>{

            score += frequency[word] || 0;

        });

        return {

            sentence,

            score

        };

    });

}

/* ----------------------------------------------------------
   Summarize
---------------------------------------------------------- */

function summarizeText(){

    const text =
        textArea.value.trim();

    if(!text){

        if(window.showToast){

            showToast(
                "Please enter some text.",
                "error"
            );

        }

        return;

    }

    const sentences =
        text.match(/[^.!?]+[.!?]*/g);

    if(!sentences || sentences.length < 2){

        if(window.showToast){

            showToast(
                "Not enough content to summarize.",
                "error"
            );

        }

        return;

    }

    const scored =
        scoreSentences(sentences);

    const summaryLength =
        Math.max(
            2,
            Math.ceil(sentences.length * .3)
        );

    const summary =
        scored
        .sort((a,b)=>b.score-a.score)
        .slice(0,summaryLength)
        .sort((a,b)=>
            sentences.indexOf(a.sentence)
            -
            sentences.indexOf(b.sentence)
        )
        .map(item=>item.sentence.trim())
        .join(" ");

    textArea.value = summary;

    updateStatistics();

    if(window.showToast){

        showToast(
            "Summary generated.",
            "success"
        );

    }

}

/* ----------------------------------------------------------
   Reading Progress
---------------------------------------------------------- */

function readingProgress(){

    const total =
        textArea.value.length;

    const current =
        textArea.selectionEnd;

    if(total===0) return 0;

    return Math.round(
        current/total*100
    );

}

/* ----------------------------------------------------------
   Keyword Extraction
---------------------------------------------------------- */

function extractKeywords(limit=10){

    const text =
        textArea.value;

    const frequency = {};

    tokenize(text).forEach(word=>{

        frequency[word] =
            (frequency[word] || 0)+1;

    });

    return Object.entries(frequency)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,limit)
        .map(item=>item[0]);

}

/* ----------------------------------------------------------
   Public API
---------------------------------------------------------- */

window.summarizer={

    summarize:summarizeText,

    keywords:extractKeywords,

    progress:readingProgress,

    update:updateStatistics

};

/* ----------------------------------------------------------
   Events
---------------------------------------------------------- */

textArea.addEventListener(

    "input",

    updateStatistics

);

summarizeBtn.addEventListener(

    "click",

    summarizeText

);

/* ----------------------------------------------------------
   Initialize
---------------------------------------------------------- */

updateStatistics();

})();