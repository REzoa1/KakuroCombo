// ------------------------------------------------------------
// 1. ГЕНЕРАЦИЯ ВСЕХ КОМБИНАЦИЙ
// ------------------------------------------------------------
const combinationsCache = new Map();

function buildAllCombinations() {
  for (let len = 2; len <= 9; len++) {
    const backtrack = (start, current) => {
      if (current.length === len) {
        const sum = current.reduce((a, b) => a + b, 0);
        const key = `${len}:${sum}`;
        if (!combinationsCache.has(key)) combinationsCache.set(key, []);
        combinationsCache.get(key).push([...current]);
        return;
      }
      for (let i = start; i <= 9; i++) {
        current.push(i);
        backtrack(i + 1, current);
        current.pop();
      }
    };
    backtrack(1, []);
  }
  for (let i = 1; i <= 9; i++) {
    combinationsCache.set(`1:${i}`, [[i]]);
  }
}
buildAllCombinations();

function getCombos(sum, cells) {
  if (cells < 2 || cells > 9) return [];
  const minPossible = (cells * (cells + 1)) / 2;
  const maxPossible = (cells * (19 - cells)) / 2;
  if (sum < minPossible || sum > maxPossible) return [];
  const key = `${cells}:${sum}`;
  const list = combinationsCache.get(key) || [];
  return list.map((arr) => [...arr]);
}

function filterByContains(combos, requiredDigits) {
  if (requiredDigits.length === 0) return combos;
  return combos.filter((combo) => {
    return requiredDigits.every((digit) => combo.includes(digit));
  });
}

// ------------------------------------------------------------
// 2. УПРАВЛЕНИЕ ФИЛЬТРОМ
// ------------------------------------------------------------
let selectedDigits = [];

function updateDigitsUI() {
  document.querySelectorAll(".digit-btn").forEach((btn) => {
    const digit = parseInt(btn.dataset.digit, 10);
    if (selectedDigits.includes(digit)) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function initDigitButtons() {
  const buttons = document.querySelectorAll(".digit-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const digit = parseInt(btn.dataset.digit, 10);
      if (selectedDigits.includes(digit)) {
        selectedDigits = selectedDigits.filter((d) => d !== digit);
      } else {
        selectedDigits.push(digit);
        selectedDigits.sort((a, b) => a - b);
      }
      updateDigitsUI();
      renderCombinations();
    });
  });
}

// ------------------------------------------------------------
// 3. ВЫДЕЛЕНИЕ КОМБИНАЦИЙ ПРИ КЛИКЕ
// ------------------------------------------------------------
function initComboSelection() {
  // делегирование событий (работает даже после перерисовки)
  const comboListDiv = document.getElementById("comboList");
  comboListDiv.addEventListener("click", (e) => {
    // ищем ближайший элемент с классом combo
    const comboElement = e.target.closest(".combo");
    if (comboElement) {
      // переключаем класс selected
      comboElement.classList.toggle("selected");
    }
  });
}

// ------------------------------------------------------------
// 4. UI
// ------------------------------------------------------------
const sumInput = document.getElementById("sumInput");
const cellsInput = document.getElementById("cellsInput");
const comboListDiv = document.getElementById("comboList");
const rangeInfoDiv = document.getElementById("rangeInfo");

function showRangeHint(cells) {
  if (cells >= 2 && cells <= 9) {
    const minSum = (cells * (cells + 1)) / 2;
    const maxSum = (cells * (19 - cells)) / 2;
    let hint = `📐 допустимый диапазон: ${minSum} … ${maxSum}`;
    if (selectedDigits.length > 0) {
      hint += `  ·  фильтр: {${selectedDigits.join(", ")}}`;
    }
    rangeInfoDiv.innerHTML = hint;
  } else if (cells !== null && !isNaN(cells)) {
    rangeInfoDiv.innerHTML = `🔢 количество клеток от 2 до 9`;
  } else {
    rangeInfoDiv.innerHTML = `🔢 введите количество клеток (2–9)`;
  }
}

function renderCombinations() {
  let sumRaw = sumInput.value.trim();
  let cellsRaw = cellsInput.value.trim();

  if (sumRaw === "" || cellsRaw === "") {
    comboListDiv.innerHTML = `<div class="empty-message">✖ введите сумму и количество клеток</div>`;
    let cells = parseInt(cellsRaw, 10);
    if (!isNaN(cells)) showRangeHint(cells);
    else rangeInfoDiv.innerHTML = `🔢 количество клеток от 2 до 9`;
    return;
  }

  let sum = parseInt(sumRaw, 10);
  let cells = parseInt(cellsRaw, 10);

  if (isNaN(sum) || isNaN(cells)) {
    comboListDiv.innerHTML = `<div class="empty-message">✖ введите корректные числа</div>`;
    return;
  }

  let isValid = true;
  let errorMsg = "";

  if (sum < 3 || sum > 45) {
    isValid = false;
    errorMsg = `сумма должна быть от 3 до 45`;
  } else if (cells < 2 || cells > 9) {
    isValid = false;
    errorMsg = `количество клеток от 2 до 9`;
  }

  if (!isValid) {
    comboListDiv.innerHTML = `<div class="empty-message">✖ ${errorMsg}</div>`;
    if (cells >= 2 && cells <= 9) showRangeHint(cells);
    else rangeInfoDiv.innerHTML = `🔢 количество клеток от 2 до 9`;
    return;
  }

  let combos = getCombos(sum, cells);
  const originalCount = combos.length;
  combos = filterByContains(combos, selectedDigits);

  showRangeHint(cells);

  if (combos.length === 0) {
    const minS = (cells * (cells + 1)) / 2;
    const maxS = (cells * (19 - cells)) / 2;
    let message = `✖ нет комбинаций для суммы ${sum}`;
    if (selectedDigits.length > 0) {
      message = `✖ нет комбинаций с цифрами {${selectedDigits.join(", ")}} для суммы ${sum}`;
    }
    comboListDiv.innerHTML = `<div class="empty-message">${message}<br>➜ допустимо ${minS}…${maxS}</div>`;
    return;
  }

  let html = "";
  const sortedCombos = combos.map((arr) => arr.join("+")).sort();
  for (let combo of sortedCombos) {
    html += `<div class="combo">${combo}</div>`;
  }

  const variantsText =
    combos.length === 1
      ? "вариант"
      : combos.length < 5
        ? "варианта"
        : "вариантов";
  let filterInfo = "";
  if (selectedDigits.length > 0 && originalCount > combos.length) {
    filterInfo = `  (отфильтровано ${originalCount - combos.length})`;
  }
  comboListDiv.innerHTML =
    html +
    `<div style="flex-basis:100%; text-align:center; font-size:0.7rem; margin-top:12px; color:#6c85a3;">${combos.length} ${variantsText}${filterInfo}</div>`;
}

sumInput.addEventListener("input", renderCombinations);
cellsInput.addEventListener("input", renderCombinations);

initDigitButtons();
initComboSelection(); // ← включаем выделение по клику
renderCombinations();

// ------------------------------------------------------------
// 5. PWA
// ------------------------------------------------------------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((e) => console.log("SW note:", e));
  });
}
