// 1. ПОИСК ЭЛЕМЕНТОВ (getElementById, querySelector)
const paletteContainer = document.getElementById('palette');
const paletteWrap = document.getElementById('palette-wrap');
const emptyNote = document.getElementById('empty-note');
const colorCount = document.getElementById('color-count');
const statusMsg = document.getElementById('status');

const addBtn = document.getElementById('add-btn');
const clearBtn = document.getElementById('clear-btn');
const toggleBtn = document.getElementById('toggle-palette-btn');
const themeBtn = document.getElementById('theme-btn');

// Обработка ошибок: проверяем, что критически важные элементы существуют
if (!paletteContainer || !addBtn) {
    console.error("Критическая ошибка: не найдены основные элементы DOM (palette или add-btn)!");
}

// 2. ПЕРЕМЕННЫЕ СОСТОЯНИЯ
let colors = []; // Массив для хранения объектов { hex, name }

// 3. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// Показ уведомления (статуса)
function showStatus(message) {
    if (!statusMsg) return;
    statusMsg.textContent = message;
    // Очищаем сообщение через 3 секунды
    setTimeout(() => { statusMsg.textContent = ''; }, 3000);
}

// Сохранение в localStorage
function saveState() {
    localStorage.setItem('designerPalette', JSON.stringify(colors));
    localStorage.setItem('paletteTheme', document.documentElement.getAttribute('data-theme'));
    // Сохраняем, скрыта ли палитра
    localStorage.setItem('isPaletteHidden', paletteWrap.hidden);
}

// Отрисовка плиток (вызывается при загрузке и при любых изменениях)
function renderPalette() {
    paletteContainer.innerHTML = ''; // Очищаем контейнер
    
    // Обновляем счетчик
    if (colorCount) colorCount.textContent = colors.length;
    
    // Показываем/скрываем подсказку "Палитра пуста"
    if (colors.length === 0) {
        emptyNote.hidden = false;
    } else {
        emptyNote.hidden = true;
    }

    // Создаем плитки
    colors.forEach((color, index) => {
        // Создаем DOM-элементы (createElement)
        const tile = document.createElement('div');
        tile.className = 'tile';

        const swatch = document.createElement('div');
        swatch.className = 'swatch';
        swatch.style.backgroundColor = color.hex; // Красим квадрат

        const meta = document.createElement('div');
        meta.className = 'meta';

        const name = document.createElement('div');
        name.className = 'name';
        name.textContent = color.name;

        const hex = document.createElement('div');
        hex.className = 'hex';
        hex.textContent = color.hex;

        const delBtn = document.createElement('button');
        delBtn.className = 'del';
        delBtn.textContent = 'Удалить';
        
        // Обработчик удаления конкретной плитки
        delBtn.addEventListener('click', () => {
            // Анимация удаления
            tile.classList.add('removing');
            
            // Ждем окончания анимации и удаляем из массива
            setTimeout(() => {
                colors.splice(index, 1);
                saveState(); // Сохраняем новое состояние
                renderPalette(); // Перерисовываем
                showStatus(`Цвет "${color.name}" удален`);
            }, 300);
        });

        // Собираем плитку
        meta.appendChild(name);
        meta.appendChild(hex);
        meta.appendChild(delBtn);

        tile.appendChild(swatch);
        tile.appendChild(meta);

        // Добавляем на страницу (append)
        paletteContainer.appendChild(tile);
    });
}

// 4. ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ (Восстановление из localStorage)
function init() {
    // Восстанавливаем цвета
    const savedColors = localStorage.getItem('designerPalette');
    if (savedColors) {
        colors = JSON.parse(savedColors);
    }

    // Восстанавливаем тему
    const savedTheme = localStorage.getItem('paletteTheme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeBtnText(savedTheme);
    }

    // Восстанавливаем видимость палитры
    const isHidden = localStorage.getItem('isPaletteHidden') === 'true';
    paletteWrap.hidden = isHidden;
    toggleBtn.textContent = isHidden ? 'Показать палитру' : 'Скрыть палитру';

    renderPalette();
}

// Вспомогательная функция для текста кнопки темы
function updateThemeBtnText(theme) {
    if (theme === 'dark') {
        themeBtn.textContent = '☀️ Светлая тема';
    } else {
        themeBtn.textContent = '🌙 Тёмная тема';
    }
}

// 5. ОБРАБОТЧИКИ СОБЫТИЙ (Кнопки)

// Добавление цвета
addBtn.addEventListener('click', () => {
    const hex = prompt("Введите HEX-код цвета (например, #FF5733):");
    if (!hex) return; // Отмена

    // Простая проверка на формат HEX
    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
        alert("Неверный формат HEX. Попробуйте, например: #FF0000");
        return;
    }

    const name = prompt("Введите название цвета (например, Огненный):");
    if (!name) return;

    colors.push({ hex: hex, name: name });
    saveState();
    renderPalette();
    showStatus(`Добавлен цвет: ${name}`);
});

// Очистка палитры
clearBtn.addEventListener('click', () => {
    if (colors.length === 0) return;
    
    if (confirm("Вы уверены, что хотите удалить все цвета?")) {
        colors = [];
        saveState();
        renderPalette();
        showStatus("Палитра полностью очищена");
    }
});

// Скрытие/Показ палитры
toggleBtn.addEventListener('click', () => {
    paletteWrap.hidden = !paletteWrap.hidden;
    toggleBtn.textContent = paletteWrap.hidden ? 'Показать палитру' : 'Скрыть палитру';
    saveState();
});

// Переключение темы
themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    updateThemeBtnText(newTheme);
    saveState();
});

// Запускаем инициализацию при загрузке страницы
document.addEventListener('DOMContentLoaded', init);
