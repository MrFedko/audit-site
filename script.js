document.addEventListener('DOMContentLoaded', function() {
    const totalScoreElement = document.getElementById('total-score');
    let totalScore = 0;
    
    // Для каждой таблицы с вопросами
    [...Array(12).keys()].forEach(tableIndex => {
        const questionTableElement = document.getElementById(`question-table-${tableIndex + 1}`);
        let scores = [0, 0, 0];
        const scoreElements = {
            0: document.getElementById(`${tableIndex}score-1`),
            1: document.getElementById(`${tableIndex}score0`),
            2: document.getElementById(`${tableIndex}score1`)
        };
        fetch(`${tableIndex + 1}.txt`) // Предположим, что вопросы для каждой таблицы хранятся в различных файлах
            .then(response => {
                return response.text();
            })
            .then(data => {
                const questions = data.split('\n').map(question => question.trim());
                questions.forEach(questionText => {
                    const tr = document.createElement('tr');
                    const questionTd = document.createElement('td');
                    questionTd.textContent = questionText;

                    const checkboxes = [-1, 0, 1];
                    checkboxes.forEach((value, index) => {
                        const tdCheckbox = document.createElement('td');
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.value = value;
                        checkbox.name = `checkbox-table-${tableIndex}-${questionText}`; // Уникальное имя для каждой строки
                        checkbox.className = tableIndex;
                        tdCheckbox.appendChild(checkbox);
                        tr.appendChild(tdCheckbox);

                        checkbox.addEventListener('change', () => {
                            resetOtherCheckboxesInRow(checkbox); // Сброс других чекбоксов в строке
                            updateScores(scoreElements, tableIndex);
                        });
                    });

                    tr.insertBefore(questionTd, tr.firstChild);
                    questionTableElement.appendChild(tr);
                });
            })
            .catch(error => {
                console.error(`Error fetching questions for table ${tableIndex + 1}:`, error);
            });
    });

    function updateScores(scorel, table) {
        const checkboxes = document.querySelectorAll(`input[class="${table}"]`);
        let totalScore = 0;

        scores = [0, 0, 0];

        checkboxes.forEach((checkbox, index) => {
            if (checkbox.checked) {
                const value = parseInt(checkbox.value);
                scores[index % 3]++; // % 3 для получения правильного индекса в массиве scores
                if (value === -1) {
                    totalScore--;
                } else if (value === 1) {
                    totalScore++;
                }
            }
        });

        for (let index = 0; index < scores.length; index++) {
            scorel[index].textContent = scores[index];
        }

        totalScoreElement.textContent = `Total Score: ${totalScore}`;
    }

    function resetOtherCheckboxesInRow(currCheckbox) {
        const currentRowCheckboxes = document.querySelectorAll(`input[name="${currCheckbox.name}"]`);

        currentRowCheckboxes.forEach(checkbox => {
            if (checkbox !== currCheckbox) {
                checkbox.checked = false;
            }
        });
    }
});

function resetAll() {
    // Сброс чекбоксов
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    // Сброс общего счета
    const totalScoreElement = document.getElementById('total-score');
    totalScoreElement.textContent = 'Total Score: 0';
}


function savePageAsImage() {
    html2canvas(document.body, {
        imageTimeout: 15000, //newline
        scale:3, //newline
        useCORS: true
}).then(function(canvas) {
        // Создаем ссылку для скачивания изображения
        var link = document.createElement('a');
        link.download = 'page_screenshot.png';
        link.href = canvas.toDataURL('image/png');
        
        // Добавляем ссылку к DOM и эмулируем клик по ней для скачивания изображения
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
}
