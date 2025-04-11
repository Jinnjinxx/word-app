const form = document.getElementById("wordForm");
const wordList = document.getElementById("wordList");
const toggleBtn = document.getElementById("toggleFormBtn");
const modal = document.getElementById("modal");
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const darkToggle = document.getElementById("darkModeToggle");
const sortToggle = document.getElementById("sortToggle");
const favoriteToggle = document.getElementById("favoriteToggle");
const searchInput = document.getElementById("searchInput");
const countDisplay = document.getElementById("countDisplay");

let editIndex = null;
let sortByAlphabet = false;
let sortByCount = false;
let searchKeyword = "";

toggleBtn.addEventListener("click", () => {
  editIndex = null;
  form.reset();
  modalTitle.textContent = "단어 추가";
  modal.classList.toggle("hidden");
});

modalOverlay.addEventListener("click", () => {
  modal.classList.add("hidden");
});

darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
});

sortToggle.addEventListener("click", () => {
  sortByAlphabet = !sortByAlphabet;
  sortByCount = false;
  loadWords();
});

favoriteToggle.addEventListener("click", () => {
  sortByCount = !sortByCount;
  sortByAlphabet = false;
  loadWords();
});

searchInput.addEventListener("input", (e) => {
  searchKeyword = e.target.value.trim().toLowerCase();
  loadWords();
});

window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }
  loadWords();
});

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const newWord = {
    word: document.getElementById("word").value,
    eng: document.getElementById("eng").value,
    kor: document.getElementById("kor").value,
    example: document.getElementById("example").value,
    count: 0,
    checked: false
  };

  const words = JSON.parse(localStorage.getItem("words") || "[]");

  if (editIndex !== null) {
    newWord.count = words[editIndex].count || 0;
    newWord.checked = words[editIndex].checked || false;
    words[editIndex] = newWord;
    editIndex = null;
  } else {
    words.push(newWord);
  }

  localStorage.setItem("words", JSON.stringify(words));
  form.reset();
  modalTitle.textContent = "단어 추가";
  modal.classList.add("hidden");
  loadWords();
});

function loadWords() {
  const words = JSON.parse(localStorage.getItem("words") || "[]");
  wordList.innerHTML = "";

  const total = words.length;
  const checked = words.filter(w => w.checked).length;
  countDisplay.textContent = `✅ ${checked} / ${total}`;

  let filtered = words.map((word, idx) => ({ ...word, originalIndex: idx }));

  if (searchKeyword) {
    filtered = filtered.filter(item =>
      item.word.toLowerCase().includes(searchKeyword)
    );
  }

  filtered.sort((a, b) => {
    if (a.checked !== b.checked) return a.checked - b.checked;
    if (sortByCount) return (b.count || 0) - (a.count || 0);
    if (sortByAlphabet) return a.word.localeCompare(b.word, 'en', { sensitivity: 'base' });
    return b.originalIndex - a.originalIndex;
  });

  filtered.forEach(({ originalIndex, ...word }) => {
    createCard(word, originalIndex);
  });
}

function createCard(data, index) {
  const card = document.createElement("div");
  card.className = "card" + (data.checked ? " checked" : "");

  const countDisplay = data.count > 0 ? `<span class="count-text">${data.count}</span>` : '';

  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <input type="checkbox" onchange="toggleHideContent(this, ${index})" ${data.checked ? 'checked' : ''}/>
        <h2 class="title">${data.word}</h2>
      </div>
      <div>
        <button onclick="editWord(${index})" class="edit-button">✏️</button>
        <button onclick="deleteWord(${index})" class="delete-button">❌</button>
      </div>
    </div>

    <div class="card-body ${data.checked ? 'hidden' : ''}">
      <div class="meaning-box" onclick="toggleMeaning(this)">
        <span class="text-box hidden">${escapeText(data.eng)}</span>
      </div>

      <div class="meaning-box" onclick="toggleMeaning(this)">
        <span class="text-box hidden">${escapeText(data.kor)}</span>
      </div>

      <div class="example">
        <div class="example-header">
          <div class="bubble-toggle" onclick="toggleExample(this)">💬 Example</div>
          <div class="count-controls">
            <button onclick="decrementCount(${index})" class="count-button">−</button>
            ${countDisplay}
            <button onclick="incrementCount(${index})" class="count-button">+</button>
          </div>
        </div>
        <div class="example-content">${formatExampleText(data.example)}</div>
      </div>
    </div>
  `;

  wordList.appendChild(card);
}

function toggleMeaning(box) {
  const span = box.querySelector("span");
  span.classList.toggle("hidden");
}

function toggleExample(el) {
  const content = el.parentElement.nextElementSibling;
  content.classList.toggle("open");
}

function toggleHideContent(checkbox, index) {
  const words = JSON.parse(localStorage.getItem("words") || "[]");
  words[index].checked = checkbox.checked;
  localStorage.setItem("words", JSON.stringify(words));
  const card = checkbox.closest(".card");
  const body = card.querySelector(".card-body");
  card.classList.toggle("checked", checkbox.checked);
  body.classList.toggle("hidden", checkbox.checked);
}

function incrementCount(index) {
  const words = JSON.parse(localStorage.getItem("words") || "[]");
  words[index].count = (words[index].count || 0) + 1;
  localStorage.setItem("words", JSON.stringify(words));
  loadWords();
}

function decrementCount(index) {
  const words = JSON.parse(localStorage.getItem("words") || "[]");
  words[index].count = Math.max((words[index].count || 0) - 1, 0);
  localStorage.setItem("words", JSON.stringify(words));
  loadWords();
}

function escapeText(text) {
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatExampleText(text) {
  const lines = text.split("\n").map(line => line.trim()).filter(line => line !== "");
  return lines.length === 0
    ? ""
    : `<ul class="example-list">` + lines.map(line => `<li>${escapeText(line)}</li>`).join("") + `</ul>`;
}

function deleteWord(index) {
  const words = JSON.parse(localStorage.getItem("words") || "[]");
  words.splice(index, 1);
  localStorage.setItem("words", JSON.stringify(words));
  loadWords();
}

function editWord(index) {
  const words = JSON.parse(localStorage.getItem("words") || "[]");
  const word = words[index];

  document.getElementById("word").value = word.word;
  document.getElementById("eng").value = word.eng;
  document.getElementById("kor").value = word.kor;
  document.getElementById("example").value = word.example;

  editIndex = index;
  modalTitle.textContent = "단어 수정";
  modal.classList.remove("hidden");
}

