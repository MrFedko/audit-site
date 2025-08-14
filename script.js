document.addEventListener('DOMContentLoaded', function() {
    const totalTasksElement = document.getElementById('total-tasks');
    var totalTasks = 0;

    
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
                    totalTasks++;
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
                            resetOtherCheckboxesInRow(checkbox);
                            updateScores(scoreElements, tableIndex);
                            checkTotalReady();
                        
                            // Проверяем, есть ли уже строка с extra-fields сразу после вопроса
                            let nextRow = tr.nextElementSibling;
                            let extraDiv;
                            if (nextRow && nextRow.querySelector('.extra-fields')) {
                                extraDiv = nextRow.querySelector('.extra-fields');
                            } else {
                                // Создаём только один раз
                                extraDiv = document.createElement('div');
                                extraDiv.className = 'extra-fields';
                                extraDiv.style.display = 'none';
                                extraDiv.innerHTML = `
                                    <textarea placeholder="Комментарий..." class="comment"></textarea>
                                    <input type="file" accept="image/*" class="photo">
                                `;
                                const td = document.createElement('td');
                                td.colSpan = 4;
                                td.appendChild(extraDiv);
                        
                                const extraRow = document.createElement('tr');
                                extraRow.appendChild(td);
                                tr.parentNode.insertBefore(extraRow, tr.nextSibling);
                            }
                        
                            // Показываем / скрываем при выборе -1 или 0
                            if (checkbox.checked && (checkbox.value === '-1' || checkbox.value === '0')) {
                                extraDiv.style.display = 'block';
                            } else {
                                extraDiv.style.display = 'none';
                            }
                        });
                        
                    });

                    tr.insertBefore(questionTd, tr.firstChild);
                    questionTableElement.appendChild(tr);
                });
                totalTasksElement.textContent = `${totalTasks}`;
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
            }
        });

        for (let index = 0; index < scores.length; index++) {
            scorel[index].textContent = scores[index];
        }


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

function checkTotalReady(){
    const totalReadyElement = document.getElementById('total-ready');
    let totalReady = 0;
    const totalScoreElement = document.getElementById('total-score');
    let totalScore = 0;
    const totalPercElement = document.getElementById('total-percent');
    let totalPercent = 0;
    [...Array(12).keys()].forEach(tableIndex => {
        const scoreEls = {
            0: document.getElementById(`${tableIndex}score-1`),
            1: document.getElementById(`${tableIndex}score0`),
            2: document.getElementById(`${tableIndex}score1`)
        };
        for (let index = 0; index < Object.keys(scoreEls).length; index++) {
            totalReady += parseInt(scoreEls[index].textContent);
        };
        totalScore += parseInt(scoreEls[2].textContent) - parseInt(scoreEls[0].textContent);
    });
    const totalTasksElement = document.getElementById('total-tasks');
    totalTasks = parseInt(totalTasksElement.textContent);
    totalPercent = totalReady / (totalTasks/100);
    totalReadyElement.textContent = `Total Ready: ${totalReady}`;
    totalScoreElement.textContent = `Total Score: ${totalScore}`;
    totalPercElement.textContent = `Completion percentage: ${totalPercent.toFixed(2)}%`;
};

function resetAll() {
    // Сброс чекбоксов
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    // Сброс общего счета
    const totalScoreElement = document.getElementById('total-score');
    totalScoreElement.textContent = 'Total Score: 0';
    const totalReadyElement = document.getElementById('total-ready');
    totalReadyElement.textContent = 'Total Ready: 0'
    const totalPercElement = document.getElementById('total-percent');
    totalPercElement.textContent = 'Completion percentage: 0%'
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

function allcheck(value) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.value == value) {
            checkbox.click();
        }
    });
};

document.getElementById('save-pdf').addEventListener('click', async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Шрифт с кириллицей
    pdf.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    pdf.setFont("Roboto");

    let y = 10;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const maxLineWidth = pageWidth - margin * 2;

    pdf.setFontSize(14);
    pdf.text('Отчёт по аудиту', margin, y);
    y += 10;

    const restaurantName = document.getElementById("restaurantName").value;
    const auditorName = document.getElementById("auditorName").value;
    const auditDate = document.getElementById("auditDate").value;


    pdf.setFontSize(14);
    pdf.text(`Название ресторана: ${restaurantName}`, 10, y);
    y += 10;
    pdf.text(`Имя Фамилия аудитора: ${auditorName}`, 10, y);
    y += 10;
    pdf.setFontSize(14);
    pdf.text(`Дата аудита: ${auditDate}`, margin, y);
    y += 10;


    for (let tableIndex = 1; tableIndex <= 12; tableIndex++) {
        const table = document.getElementById(`question-table-${tableIndex}`);
        if (!table) continue;

        pdf.setFontSize(12);
        const titleLines = pdf.splitTextToSize(table.querySelector('th').textContent.trim(), maxLineWidth);
        pdf.text(titleLines, margin, y);
        y += titleLines.length * 6 + 2;

        const rows = table.querySelectorAll('tr');
        for (let i = 1; i < rows.length; i++) {
            const tr = rows[i];
            const qCell = tr.querySelector('td');
            if (!qCell || !qCell.textContent.trim()) continue;

            const question = qCell.textContent.trim();
            const checked = tr.querySelector('input[type="checkbox"]:checked');
            if (!checked) continue;

            let comment = null, photoData = null;
            const extraFields = tr.nextElementSibling?.querySelector('.extra-fields');
            if (extraFields && extraFields.style.display !== 'none') {
                comment = extraFields.querySelector('.comment')?.value || null;
                const fileInput = extraFields.querySelector('.photo');
                if (fileInput?.files?.length) {
                    const file = fileInput.files[0];
                    photoData = await new Promise(resolve => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                    });
                }
            }

            pdf.setFontSize(10);

            // Вопрос
            const qLines = pdf.splitTextToSize(`${question} — Оценка: ${checked.value}`, maxLineWidth);
            pdf.text(qLines, margin, y);
            y += qLines.length * 5;

            // Комментарий
            if (comment) {
                const cLines = pdf.splitTextToSize(`Комментарий: ${comment}`, maxLineWidth);
                pdf.text(cLines, margin, y);
                y += cLines.length * 5;
            }

            // Фото с сохранением пропорций
            if (photoData) {
                const img = new Image();
                img.src = photoData;
                await new Promise(resolve => {
                    img.onload = () => {
                        let imgWidth = img.width;
                        let imgHeight = img.height;

                        const maxImgWidth = maxLineWidth;
                        const maxImgHeight = pageHeight / 3;

                        // масштабируем, сохраняя пропорции
                        if (imgWidth > maxImgWidth) {
                            const scale = maxImgWidth / imgWidth;
                            imgWidth *= scale;
                            imgHeight *= scale;
                        }
                        if (imgHeight > maxImgHeight) {
                            const scale = maxImgHeight / imgHeight;
                            imgWidth *= scale;
                            imgHeight *= scale;
                        }

                        // перенос на новую страницу, если не влезает
                        if (y + imgHeight > pageHeight - margin) {
                            pdf.addPage();
                            y = margin;
                        }

                        pdf.addImage(photoData, 'JPEG', margin, y, imgWidth, imgHeight);
                        y += imgHeight + 5;
                        resolve();
                    };
                });
            }

            y += 3;

            // перенос страницы при переполнении
            if (y > pageHeight - margin) {
                pdf.addPage();
                pdf.setFont("Roboto");
                y = margin;
            }
        }
        y += 5;
    }
    // Получаем данные (если они есть в HTML или JS)
// Получаем итоговые значения
    const totalScore = document.getElementById("total-score").textContent.replace("Total Score: ","");
    const totalReady = document.getElementById("total-ready").textContent.replace("Total Ready: ","");
    const totalPercent = document.getElementById("total-percent").textContent.replace("Completion percentage: ","");
    const totalTasks = document.getElementById("total-tasks").textContent; // total-tasks у вас есть

    pdf.setFontSize(12);
    pdf.text(`Всего очков: ${totalScore}`, 20, y);
    y += 7;
    pdf.text(`Всего пунктов: ${totalTasks}`, 20, y);
    y += 7;
    pdf.text(`Всего заполнено: ${totalReady}`, 20, y);
    y += 7;
    pdf.text(`Процент заполнения: ${totalPercent}`, 20, y);


    pdf.save('audit-report.pdf');
});