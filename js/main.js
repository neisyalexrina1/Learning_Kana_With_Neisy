let currentLesson = lesson1;
let currentSection = 'vocabularies';
let isQuizMode = false;

// Pagination settings
let currentPage = 1;
const itemsPerPage = 12;

// DOM elements
const sidebar = document.getElementById("sidebar");
const content = document.getElementById("content");
const backBtnNavbar = document.getElementById("back-btn");

// ----- LESSON BUTTONS -----
const lessonButtons = [
  document.getElementById("lesson1-btn"),
  document.getElementById("lesson2-btn"),
  document.getElementById("lesson3-btn")
];

lessonButtons.forEach((btn, idx)=>{
  btn.onclick = ()=>{
    if(isQuizMode){
      alert("❗Bạn đang ở Quiz Mode — hãy bấm '⬅ Back' để thoát rồi chọn bài khác nhé!");
      return;
    }
    switchLesson(idx+1);
    updateLessonActive(idx);
  };
});

function updateLessonActive(activeIndex){
  lessonButtons.forEach((btn,i)=>{
    btn.classList.toggle("active", i===activeIndex);
  });
}

// ----- SWITCH LESSON -----
function switchLesson(num) {
  if(num === 1) currentLesson = lesson1;
  else if(num === 2) currentLesson = lesson2;
  else currentLesson = lesson3;

  // Reset search value & phân trang
  const searchInputEl = document.getElementById("search-input");
  if (searchInputEl) searchInputEl.value = "";
  currentPage = 1;

  // Chỉ render study khi đang ở Study Mode
  if (!isQuizMode && sidebar.style.display === "block") {
    renderStudy();
  }
}



// ----- SIDEBAR TABS -----
const tabButtons = {
  vocab: document.getElementById("tab-vocab"),
  kanji: document.getElementById("tab-kanji"),
  grammar: document.getElementById("tab-grammar"),
  back: document.getElementById("tab-back")
};

Object.entries(tabButtons).forEach(([key, btn])=>{
  if(key === "back"){
    btn.onclick = renderHome;
  } else {
    btn.onclick = ()=>{
      currentSection = key === "vocab" ? "vocabularies" : key;
      Object.values(tabButtons).forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      currentPage = 1;
      renderStudy();
    };
  }
});


// ----- MODE BUTTONS -----
document.getElementById("study-btn").onclick = startStudyMode;
document.getElementById("quiz-btn").onclick = startQuizMode;
document.getElementById("flashcard-btn").onclick = startFlashcardMode;
backBtnNavbar.onclick = ()=>{isQuizMode=false; renderHome(); backBtnNavbar.style.display='none';};

// ----- RENDER HOME -----
function renderHome() {
  sidebar.style.display = 'none';
  // Ẩn search input khi ra màn hình chính
  const searchContainer = document.getElementById("search-container");
  if(searchContainer) searchContainer.style.display = "none";

  content.innerHTML = `<p>Select a mode to begin your ${currentSection} practice!</p>`;
}


// ----- Study Mode -----

function startStudyMode() {
  isQuizMode = false;
  sidebar.style.display = "block";
  currentPage = 1;

  const searchContainer = document.getElementById("search-container");
  if(searchContainer) {
    searchContainer.style.display = "block"; // show search khi vào study mode
    document.getElementById("search-input").value = ""; // reset value
  }

  renderStudy();
}



function renderStudy() {
  content.innerHTML = "";

  // 1️⃣ Lấy dữ liệu hiện tại
  let data = currentLesson[currentSection] || [];

  // 2️⃣ Lấy giá trị search
  const searchInputEl = document.getElementById("search-input");
  const searchValue = searchInputEl ? searchInputEl.value.trim().toLowerCase() : "";

  // Nếu searchValue là toàn khoảng trắng → không filter
  const isOnlySpaces = /^\s*$/.test(searchValue);
  const filteredData = isOnlySpaces
    ? data
    : data.filter(item =>
        item.romaji.toLowerCase().includes(searchValue) ||
        item.eng.toLowerCase().includes(searchValue)
      );

  // 3️⃣ Nếu không có kết quả
  if (filteredData.length === 0) {
    content.innerHTML = `<p style="margin-top:20px;">No entries found</p>`;
    return;
  }

  // 4️⃣ Phân trang
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const items = filteredData.slice(start, end);

  // 5️⃣ Tạo grid container
  const grid = document.createElement("div");
  grid.className = "study-grid";
  content.appendChild(grid);

  // 6️⃣ Thêm từng card vào grid
  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "study-item";
    div.innerHTML = `
      <div class="jp-word">${item.jp}</div>
      <div class="romaji">${highlightText(item.romaji, searchValue)}</div>
      <div class="eng">${highlightText(item.eng, searchValue)}</div>
    `;
    grid.appendChild(div);
  });

  // 7️⃣ Pagination
  const pagination = document.createElement("div");
  pagination.className = "pagination";
  pagination.innerHTML = `
    <button id="prev-page" ${currentPage === 1 ? "disabled" : ""}>⬅ Prev</button>
    <span>Page ${currentPage} / ${totalPages}</span>
    <button id="next-page" ${currentPage === totalPages ? "disabled" : ""}>Next ➡</button>
  `;
  content.appendChild(pagination);

  // 8️⃣ Bắt sự kiện click cho nút
  const prevBtn = pagination.querySelector("#prev-page");
  const nextBtn = pagination.querySelector("#next-page");

  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderStudy();
    }
  };
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderStudy();
    }
  };

  // 9️⃣ Nút back (nằm chung tab bar)
  const backBtnContainer = document.getElementById("tab-back-container");
  if (backBtnContainer) {
    backBtnContainer.innerHTML = "";
    const backBtn = document.createElement("button");
    backBtn.textContent = "⬅ Back";
    backBtn.className = "tab-back";
    backBtn.onclick = renderHome;
    backBtnContainer.appendChild(backBtn);
  }
}


const searchInput = document.getElementById("search-input");
searchInput.addEventListener("input", () => {
  currentPage = 1; // reset trang khi search
  renderStudy();
});

function highlightText(text, query) {
  if (!query) return text; // nếu không search thì giữ nguyên
  const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  return text.replace(regex, `<span class="highlight">$1</span>`);
}



// 🎹 Sự kiện bàn phím: qua lại phân trang
document.addEventListener("keydown", (e) => {
  // Chỉ hoạt động khi đang ở Study Mode
  if (!isQuizMode && sidebar.style.display === "block") {
    const data = currentLesson[currentSection] || [];
    const totalPages = Math.ceil(data.length / itemsPerPage);

    if (e.key === "ArrowRight" && currentPage < totalPages) {
      currentPage++;
      renderStudy();
    } else if (e.key === "ArrowLeft" && currentPage > 1) {
      currentPage--;
      renderStudy();
    }
  }
});


// ----- QUIZ MODE -----
function startQuizMode() {
  isQuizMode = true;
  sidebar.style.display='none';
  backBtnNavbar.style.display='inline-block';

  // Ẩn search khi vào Quiz
  const searchContainer = document.getElementById("search-container");
  if(searchContainer) searchContainer.style.display = "none";


  const data = [...(currentLesson['vocabularies'] || [])].sort(()=>Math.random()-0.5);
  let currentIndex = 0;

  renderQuizItem(data[currentIndex]);

  function renderQuizItem(item) {
    content.innerHTML = `
      <div class="quiz-box">
        <div class="quiz-word">${item.jp}</div>
        <div class="quiz-input-group">
          <input type="text" id="quiz-answer" placeholder="Enter English meaning">
          <button id="check-btn">Check</button>
        </div>
        <p id="quiz-result"></p>
      </div>
    `;

    const inputEl = document.getElementById("quiz-answer");
    const resultEl = document.getElementById("quiz-result");
    const checkBtn = document.getElementById("check-btn");

    inputEl.addEventListener("keydown", (e)=>{
      if(e.key === "Enter") checkBtn.click();
    });

    checkBtn.onclick = ()=>{
      const ans = inputEl.value.trim().toLowerCase();
      const correctAnswers = item.eng
        .toLowerCase()
        .split("/")
        .map(a => a.trim()); // tách nhiều nghĩa & chuẩn hóa

      if (correctAnswers.includes(ans)) {
        resultEl.textContent = "✅ Correct!";
        resultEl.style.color = "green";
        setTimeout(nextItem, 800);
      } else {
        resultEl.textContent = `❌ Correct answer: ${item.eng}`;
        resultEl.style.color = "red";
        setTimeout(nextItem, 1500);
      }
    };

  }

  function nextItem(){
    currentIndex++;
    if(currentIndex < data.length) renderQuizItem(data[currentIndex]);
    else {
      content.innerHTML = `
        <div class="quiz-finished">
          <p>🎉 Quiz finished!</p>
          <button id="retry-btn">🔁 Retry Quiz</button>
        </div>
      `;
      document.getElementById("retry-btn").onclick = startQuizMode;
    }
  }
}




// ----- FLASHCARD MODE (với phím Space + ← →) -----
function startFlashcardMode() {
  isQuizMode = true;
  sidebar.style.display = 'none';
  backBtnNavbar.style.display = 'inline-block';

  // Ẩn search
  const searchContainer = document.getElementById("search-container");
  if (searchContainer) searchContainer.style.display = "none";

  // Lấy dữ liệu vocab
  const data = [...(currentLesson['vocabularies'] || [])].sort(() => Math.random() - 0.5);
  let currentIndex = 0;
  let isFlipped = false;

  renderFlashcard(data[currentIndex]);

  // Gắn sự kiện bàn phím
  document.onkeydown = (e) => {
    if (e.code === "Space") {
      e.preventDefault(); // tránh cuộn trang
      flipCard();
    } else if (e.code === "ArrowRight") {
      nextCard();
    } else if (e.code === "ArrowLeft") {
      prevCard();
    }
  };

  // Hiển thị flashcard
  function renderFlashcard(item) {
    content.innerHTML = `
      <div class="flashcard-box">
        <div class="flashcard ${isFlipped ? 'flipped' : ''}" id="flashcard">
          <div class="front">${item.jp}</div>
          <div class="back">${item.eng}</div>
        </div>
        <div class="flashcard-controls">
          <button id="prev-card" ${currentIndex === 0 ? 'disabled' : ''}>⬅ Prev</button>
          <button id="next-card" ${currentIndex === data.length - 1 ? 'disabled' : ''}>Next ➡</button>
        </div>
        <p style="margin-top:8px;">Card ${currentIndex + 1} / ${data.length}</p>
        <p style="font-size: 0.9em; color: #666; margin-top:4px;">(Space = Flip, ← → = Prev / Next)</p>
      </div>
    `;

    const card = document.getElementById("flashcard");
    const nextBtn = document.getElementById("next-card");
    const prevBtn = document.getElementById("prev-card");

    card.onclick = flipCard;
    nextBtn.onclick = nextCard;
    prevBtn.onclick = prevCard;
  }

  // Hàm flip card
  function flipCard() {
    const card = document.getElementById("flashcard");
    if (card) {
      isFlipped = !isFlipped;
      card.classList.toggle("flipped");
    }
  }

  // Hàm chuyển qua lại
  function nextCard() {
    if (currentIndex < data.length - 1) {
      currentIndex++;
      isFlipped = false;
      renderFlashcard(data[currentIndex]);
    }
  }

  function prevCard() {
    if (currentIndex > 0) {
      currentIndex--;
      isFlipped = false;
      renderFlashcard(data[currentIndex]);
    }
  }

  // Xoá event khi thoát
  backBtnNavbar.onclick = () => {
    document.onkeydown = null;         // xoá listener phím
    isQuizMode = false;
    backBtnNavbar.style.display = 'none'; // ẩn nút back
    renderHome();                       // quay về màn chính
  };

}

// ----- ESC = BẤM BACK -----
document.addEventListener("keydown", (e) => {
  if (e.code === "Escape") {
    const backBtns = document.querySelectorAll("#back-btn");
    backBtns.forEach(btn => {
      if (btn.style.display !== "none") {
        btn.click();
      }
    });
  }
});




// ----- AUTO START -----
window.onload = ()=>{
  updateLessonActive(0);
  renderHome();
  // Random sẵn 1 bài nhưng không phát cho đến khi bật
  bgm = new Audio(getRandomMusic());
  bgm.loop = false;
};



// ----- 🌸 Sakura Animation -----
const canvas = document.getElementById("sakura-canvas");
const ctx = canvas.getContext("2d");
let petals = [];

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

for(let i=0;i<50;i++){
  petals.push({
    x: Math.random()*window.innerWidth,
    y: Math.random()*window.innerHeight,
    size: Math.random()*6+2,
    speedY: Math.random()*1+0.5,
    speedX: Math.random()*0.5 - 0.25,
    angle: Math.random()*2*Math.PI
  });
}

function drawPetal(p){
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  ctx.fillStyle = "rgba(255,182,193,0.8)";
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.ellipse(0,0,p.size,p.size/2,0,0,2*Math.PI);
  ctx.fill();
  ctx.restore();
}

function animateSakura(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let p of petals){
    p.y += p.speedY;
    p.x += p.speedX;
    p.angle += 0.01;
    if(p.y>canvas.height+10){
      p.y = -10;
      p.x = Math.random()*canvas.width;
    }
    drawPetal(p);
  }
  requestAnimationFrame(animateSakura);
}
animateSakura();


// ----- 🎧 Random Music Toggle -----
const musicBtn = document.getElementById("music-btn");
let musicPlaying = false;
let bgm = null;

let musicStarted = false;

document.addEventListener('click', () => {
  if(!musicStarted){
    playRandomMusic();
    musicBtn.textContent = "🔈"; // icon đúng khi nhạc đang bật
    musicPlaying = true;
    musicStarted = true;
  }
}, { once: true }); // chỉ trigger 1 lần

// Hàm phát ngẫu nhiên
function playRandomMusic() {
  const src = getRandomMusic();
  if (bgm) bgm.pause();
  bgm = new Audio(src);
  bgm.loop = false; // không lặp để random bài khác sau
  bgm.volume = 0.5;

  bgm.onended = ()=>{ // Khi hết bài, chọn bài khác
    playRandomMusic();
  };

  bgm.play().catch(err => console.log("Autoplay blocked:", err));
}

musicBtn.onclick = ()=>{
  if(!musicPlaying){
    playRandomMusic();
    musicBtn.textContent = "🔈";
  } else {
    if(bgm) bgm.pause();
    musicBtn.textContent = "🔊";
  }
  musicPlaying = !musicPlaying;
};


