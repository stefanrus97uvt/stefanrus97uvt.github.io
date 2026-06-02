// Question bank: array of objects with question, accepted answers, and explanation
const questions = [
  {
    question: "What does HTML stand for?",
    answers: ["hypertext markup language"],
    explanation: "HTML = HyperText Markup Language – the standard language for web pages."
  },
  {
    question: "Which CSS property changes the text colour of an element?",
    answers: ["color", "colour"],
    explanation: "The 'color' property sets the foreground (text) colour in CSS."
  },
  {
    question: "What keyword is used in JavaScript to declare a variable that cannot be reassigned?",
    answers: ["const"],
    explanation: "'const' declares a block-scoped constant – it cannot be reassigned after declaration."
  },
  {
    question: "What does CSS stand for?",
    answers: ["cascading style sheets"],
    explanation: "CSS = Cascading Style Sheets – used to style and layout HTML pages."
  },
  {
    question: "Which HTML tag is used to include an external JavaScript file?",
    answers: ["script", "<script>"],
    explanation: "The <script src='file.js'></script> tag links an external JS file."
  },
  {
    question: "What does the 'alt' attribute on an <img> tag provide?",
    answers: ["alternative text", "alt text", "accessibility text", "text alternative"],
    explanation: "'alt' provides alternative text for screen readers and when the image fails to load."
  },
  {
    question: "In CSS, which layout model uses 'display: flex'?",
    answers: ["flexbox", "flex"],
    explanation: "Flexbox (Flexible Box Layout) is a one-dimensional layout model in CSS."
  }
];

// State
let currentIndex = 0;
let score = 0;
let finished = false;

// DOM references
const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const scoreBar = document.getElementById("score-bar");

// Add a message bubble to the chat box
function addMessage(text, type) {
  const msg = document.createElement("div");
  msg.className = "msg " + type;
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Update the score bar
function updateScoreBar() {
  scoreBar.textContent = "Score: " + score + " / " + questions.length;
}

// Ask the current question
function askQuestion() {
  if (currentIndex < questions.length) {
    addMessage("Q" + (currentIndex + 1) + ": " + questions[currentIndex].question, "msg-bot");
  }
}

// Check the user's answer
function checkAnswer(userAnswer) {
  const q = questions[currentIndex];
  const normalised = userAnswer.trim().toLowerCase();
  const correct = q.answers.some(a => a.toLowerCase() === normalised);

  addMessage(userAnswer, "msg-user");

  if (correct) {
    score++;
    addMessage("Correct! " + q.explanation, "msg-correct");
  } else {
    addMessage("Not quite. " + q.explanation, "msg-wrong");
  }

  updateScoreBar();
  currentIndex++;

  if (currentIndex < questions.length) {
    setTimeout(askQuestion, 400);
  } else {
    finished = true;
    setTimeout(function () {
      addMessage(
        "Quiz finished! Final score: " + score + " / " + questions.length + ". " +
        (score === questions.length ? "Perfect score!" : "Keep practising!"),
        "msg-bot"
      );
      userInput.disabled = true;
      chatForm.querySelector("button").disabled = true;
    }, 400);
  }
}

// Form submit event
chatForm.addEventListener("submit", function (e) {
  e.preventDefault();
  if (finished) return;

  const answer = userInput.value.trim();
  if (!answer) return;

  userInput.value = "";
  checkAnswer(answer);
});

// Start the chatbot
addMessage("Hello! I'm your IT quiz bot. I'll ask you " + questions.length + " questions. Type your answer and press Send.", "msg-bot");
setTimeout(askQuestion, 600);
updateScoreBar();
