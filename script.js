// Global variables
let currentTopic = '';
let allQuestions = [];
let selectedQuestions = [];
let currentQuestionIndex = 0;
let totalPoints = 0;
let earnedPoints = 0;
let userAnswers = [];
let certificateDownloaded = false;

// Topic names in Hungarian
const topicNames = {
    'csillagaszat': 'Csillagászat',
    'kozetbolygo': 'Kőzetbolygó',
    'legkor': 'Légkör',
    'vizburok': 'Vízburok',
    'geoszferak': 'Geoszférák'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

function setupEventListeners() {
    // Topic selection
    document.querySelectorAll('.topic-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentTopic = e.target.dataset.topic;
            loadQuestions(currentTopic);
        });
    });

    // Difficulty selection (first question)
    document.querySelectorAll('#difficultyScreen .diff-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const difficulty = e.target.dataset.difficulty;
            selectQuestionByDifficulty(difficulty);
        });
    });

    // Submit answer
    document.getElementById('submitAnswer').addEventListener('click', submitAnswer);

    // Difficulty selection (after feedback)
    document.querySelectorAll('#feedbackScreen .diff-btn-small').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const difficulty = e.target.dataset.difficulty;
            selectQuestionByDifficulty(difficulty);
        });
    });

    // Next question button
    document.getElementById('nextQuestion').addEventListener('click', nextQuestion);

    // Restart quiz
    document.getElementById('restartQuiz').addEventListener('click', restartQuiz);
}

// Load questions from Excel file
async function loadQuestions(topic) {
    try {
        const response = await fetch(`${topic}.xlsx`);
        if (!response.ok) {
            alert(`Ez a témakör egyelőre nem elérhető.`);
            return;
        }

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Read entire sheet as array (without header)
        const allData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // First row: point thresholds [Ponthatárok, 30, 40, 50]
        const pointThresholds = allData[0];
        window.minPoints = parseInt(pointThresholds[1]) || 30;
        window.silverPoints = parseInt(pointThresholds[2]) || 40;
        window.goldPoints = parseInt(pointThresholds[3]) || 50;
        
        // Read data from row 3 onwards (row 1 = Ponthatárok, row 2 = header, row 3+ = data)
        const data = XLSX.utils.sheet_to_json(firstSheet, { range: 1 });

        // Filter out invalid rows (e.g., Ponthatárok row or empty rows)
        const validData = data.filter(row => {
            // Must have these fields
            if (!row['kerdés'] || !row['tipus']) return false;
            
            // helyes_valaszok must exist and be a string (not a number like in Ponthatárok row)
            const helyes = row['helyes_valaszok'];
            if (!helyes || typeof helyes !== 'string') return false;
            
            // Make sure it's not the Ponthatárok row (where helyes_valaszok would be a number)
            if (typeof helyes === 'number') return false;
            
            return true;
        });

        allQuestions = validData.map(row => ({
            question: row['kerdés'] || row['kerdes'],
            type: row['tipus'],
            correctAnswers: (row['helyes_valaszok'] || '').split(';').map(a => a.trim()).filter(a => a),
            incorrectAnswers: (row['hibas_valaszok'] || '').split(';').map(a => a.trim()).filter(a => a),
            points: parseInt(row['pontErtek']) || 0,
            difficulty: row['nehezseg'] || row['nehezség']
        }));

        resetQuiz();
        showScreen('difficultyScreen');
        updateQuestionCounter(1);
        updateTotalPointsDisplay();
        updateMaxPointsDisplay();
        updateDifficultyButtons('difficultyScreen');
    } catch (error) {
        console.error('Hiba a fájl betöltésekor:', error);
        alert('Ez a témakör egyelőre nem elérhető.');
    }
}

// Reset quiz state
function resetQuiz() {
    selectedQuestions = [];
    currentQuestionIndex = 0;
    totalPoints = 0;
    earnedPoints = 0;
    userAnswers = [];
    certificateDownloaded = false;
}

// Select question by difficulty
function selectQuestionByDifficulty(difficulty) {
    const availableQuestions = allQuestions.filter(q => 
        q.difficulty === difficulty && 
        !selectedQuestions.includes(q)
    );

    if (availableQuestions.length === 0) {
        alert('Nincs több kérdés ebből a nehézségből!');
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    
    selectedQuestions.push(selectedQuestion);
    totalPoints += selectedQuestion.points;

    showQuestion(selectedQuestion);
}

// Show question screen
function showQuestion(question) {
    showScreen('questionScreen');
    
    document.getElementById('qNum').textContent = selectedQuestions.length;
    document.getElementById('currentPoints').textContent = earnedPoints;
    document.getElementById('questionText').textContent = question.question;
    
    const answersContainer = document.getElementById('answersContainer');
    answersContainer.innerHTML = '';

    if (question.type === 'szoveges') {
        // Text input
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'text-answer-input';
        input.placeholder = 'Írd be a választ...';
        input.id = 'textAnswer';
        input.name = 'answer_' + Math.random();
        input.autocomplete = 'off';
        answersContainer.appendChild(input);
    } else {
        // Multiple choice
        const allAnswers = [...question.correctAnswers, ...question.incorrectAnswers];
        const shuffledAnswers = shuffleArray(allAnswers);

        shuffledAnswers.forEach((answer, index) => {
            const div = document.createElement('div');
            div.className = 'answer-option';

            const input = document.createElement('input');
            input.type = question.type === 'tobbszoros' ? 'checkbox' : 'radio';
            input.name = 'answer';
            input.value = answer;
            input.id = `answer${index}`;

            const label = document.createElement('label');
            label.htmlFor = `answer${index}`;
            label.textContent = answer;

            div.appendChild(input);
            div.appendChild(label);
            
            // Stop event bubbling when clicking on input or label
            input.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            label.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            // Make the entire div clickable (for areas outside input/label)
            div.addEventListener('click', () => {
                if (question.type === 'tobbszoros') {
                    input.checked = !input.checked;
                } else {
                    input.checked = true;
                }
            });

            answersContainer.appendChild(div);
        });
    }

    updateProgressBar();
    document.getElementById('submitAnswer').disabled = false;
}

// Submit answer
function submitAnswer() {
    const currentQuestion = selectedQuestions[selectedQuestions.length - 1];
    let userAnswer = [];
    let isCorrect = false;

    if (currentQuestion.type === 'szoveges') {
        const input = document.getElementById('textAnswer');
        userAnswer = [input.value.trim()];
        
        // Case-insensitive comparison for text answers
        isCorrect = currentQuestion.correctAnswers.some(correct => 
            correct.toLowerCase() === userAnswer[0].toLowerCase()
        );
    } else {
        const selected = document.querySelectorAll('#answersContainer input:checked');
        if (selected.length === 0) {
            alert('Kérlek, válassz legalább egy választ!');
            return;
        }

        userAnswer = Array.from(selected).map(input => input.value);

        // Check if answer is correct
        if (currentQuestion.type === 'tobbszoros') {
            // All correct answers must be selected, no incorrect ones
            const correctSet = new Set(currentQuestion.correctAnswers);
            const userSet = new Set(userAnswer);
            isCorrect = correctSet.size === userSet.size && 
                       [...correctSet].every(ans => userSet.has(ans));
        } else {
            isCorrect = currentQuestion.correctAnswers.includes(userAnswer[0]);
        }
    }

    // Store user answer
    userAnswers.push({
        question: currentQuestion.question,
        userAnswer: userAnswer,
        correctAnswers: currentQuestion.correctAnswers,
        isCorrect: isCorrect,
        points: currentQuestion.points
    });

    if (isCorrect) {
        earnedPoints += currentQuestion.points;
    }

    showFeedback(isCorrect, currentQuestion.points);
}

// Show feedback
function showFeedback(isCorrect, points) {
    showScreen('feedbackScreen');

    const feedbackContent = document.getElementById('feedbackContent');
    feedbackContent.className = isCorrect ? 'feedback-correct' : 'feedback-incorrect';
    
    const minPoints = window.minPoints || 30;
    const silverPoints = window.silverPoints || 40;
    const goldPoints = window.goldPoints || 50;
    
    // Check if there are any questions left - MUST BE BEFORE innerHTML!
    const hasQuestionsLeft = ['könnyű', 'közepes', 'nehéz'].some(difficulty => {
        return allQuestions.filter(q => 
            q.difficulty === difficulty && 
            !selectedQuestions.includes(q)
        ).length > 0;
    });
    
    // Determine level and next milestone
    let levelInfo = '';
    if (earnedPoints < minPoints) {
        const remaining = minPoints - earnedPoints;
        levelInfo = `<div class="feedback-points">Még ${remaining} pont kell a bronz szinthez!</div>`;
    } else if (earnedPoints >= minPoints && earnedPoints < silverPoints) {
        const remaining = silverPoints - earnedPoints;
        levelInfo = `<div class="feedback-points level-bronze">🥉 Bronz szint elérve!</div>`;
        if (remaining > 0) levelInfo += `<div class="feedback-points">Még ${remaining} pont az ezüstig!</div>`;
    } else if (earnedPoints >= silverPoints && earnedPoints < goldPoints) {
        const remaining = goldPoints - earnedPoints;
        levelInfo = `<div class="feedback-points level-silver">🥈 Ezüst szint elérve!</div>`;
        if (remaining > 0) levelInfo += `<div class="feedback-points">Még ${remaining} pont az aranyig!</div>`;
    } else if (earnedPoints >= goldPoints) {
        levelInfo = `<div class="feedback-points level-gold">🥇 Arany szint elérve! Maximális teljesítmény!</div>`;
    }

    const remainingQuestions = 10 - selectedQuestions.length;
    
    feedbackContent.innerHTML = `
        <div class="feedback-icon">${isCorrect ? '✅' : '❌'}</div>
        <div class="feedback-text">${isCorrect ? 'Helyes válasz!' : 'Helytelen válasz'}</div>
        <div class="feedback-points">${isCorrect ? '+' : '+0'} ${isCorrect ? points : 0} pont</div>
        <div class="feedback-points">Összpontszám: ${earnedPoints} pont</div>
        ${levelInfo}
        ${earnedPoints < goldPoints ? `<div class="feedback-points">Hátra lévő kérdések száma: ${remainingQuestions}</div>` : ''}
        ${!hasQuestionsLeft && selectedQuestions.length < 10 ? '<div class="feedback-points" style="color: #e74c3c; margin-top: 15px;">⚠️ Elfogytak a kérdések!</div>' : ''}
    `;

    // Check if quiz should end (10 questions OR no questions left OR gold level reached)
    const shouldEnd = selectedQuestions.length >= 10 || !hasQuestionsLeft || earnedPoints >= goldPoints;

    // Show difficulty choice if not at end
    const difficultyChoice = document.getElementById('nextDifficultyChoice');
    const nextBtn = document.getElementById('nextQuestion');

    if (!shouldEnd) {
        difficultyChoice.style.display = 'block';
        nextBtn.style.display = 'none';
        updateDifficultyButtons('feedbackScreen');
    } else {
        difficultyChoice.style.display = 'none';
        nextBtn.style.display = 'block';
        nextBtn.textContent = 'Eredmény megtekintése →';
    }
}

// Next question or show results
function nextQuestion() {
    // Check if there are any questions left
    const hasQuestionsLeft = ['könnyű', 'közepes', 'nehéz'].some(difficulty => {
        return allQuestions.filter(q => 
            q.difficulty === difficulty && 
            !selectedQuestions.includes(q)
        ).length > 0;
    });
    
    const shouldEnd = selectedQuestions.length >= 10 || !hasQuestionsLeft || earnedPoints >= 50;
    
    if (shouldEnd) {
        showResults();
    } else {
        showScreen('difficultyScreen');
        updateQuestionCounter(selectedQuestions.length + 1);
        updateTotalPointsDisplay();
        updateDifficultyButtons('difficultyScreen');
    }
}

// Update difficulty buttons (disable if no questions available)
function updateDifficultyButtons(screenId) {
    const buttons = document.querySelectorAll(`#${screenId} .diff-btn, #${screenId} .diff-btn-small`);
    
    buttons.forEach(btn => {
        const difficulty = btn.dataset.difficulty;
        const available = allQuestions.filter(q => 
            q.difficulty === difficulty && 
            !selectedQuestions.includes(q)
        ).length;

        btn.disabled = available === 0;
    });
}

// Show results
function showResults() {
    showScreen('resultScreen');

    const minPoints = window.minPoints || 30;
    const silverPoints = window.silverPoints || 40;
    const goldPoints = window.goldPoints || 50;
    const passed = earnedPoints >= minPoints;
    
    // Determine level
    let level = '';
    let levelClass = '';
    if (earnedPoints >= goldPoints) {
        level = '🥇 Arany szint';
        levelClass = 'level-gold';
    } else if (earnedPoints >= silverPoints) {
        level = '🥈 Ezüst szint';
        levelClass = 'level-silver';
    } else if (earnedPoints >= minPoints) {
        level = '🥉 Bronz szint';
        levelClass = 'level-bronze';
    }

    const resultContent = document.getElementById('resultContent');
    resultContent.innerHTML = `
        <div class="result-percentage">${earnedPoints} pont</div>
        ${passed ? `<div class="result-level ${levelClass}">${level}</div>` : ''}
        <div class="result-message">
            ${passed ? '🎉 Gratulálunk! Sikeres teszt!' : `😔 Sajnos nem sikerült elérni a ${minPoints} pontot`}
        </div>
        <div class="feedback-points">
            Kérdések száma: ${selectedQuestions.length}
        </div>
        ${passed && earnedPoints < goldPoints ? '<div class="feedback-points" style="margin-top: 15px;">A 10 kérdés végére értél, az arany fokozat megszerzéséhez indítsd újra a kvízt.</div>' : ''}
    `;

    // Show correct answers
    showCorrectAnswers();

    // Show certificate section if passed
    const certificateSection = document.getElementById('certificateSection');
    if (passed) {
        const sessionKey = `certificate_${currentTopic}_${Date.now()}`;
        
        certificateSection.innerHTML = `
            <h3>🎓 Igazolás letöltése</h3>
            <p>Add meg a neved a tanúsítvány letöltéséhez:</p>
            <input type="text" id="nameInput" placeholder="Neved" maxlength="50">
            <br>
            <button id="downloadBtn">📥 Tanúsítvány letöltése</button>
        `;
        certificateSection.style.display = 'block';

        document.getElementById('downloadBtn').addEventListener('click', () => {
            const name = document.getElementById('nameInput').value.trim();
            if (!name) {
                alert('Kérlek, add meg a neved!');
                return;
            }
            generateCertificate(name, sessionKey);
        });
    } else {
        certificateSection.style.display = 'none';
    }
}

// Show correct answers
function showCorrectAnswers() {
    const section = document.getElementById('correctAnswersSection');
    section.innerHTML = '<h3>📝 Helyes válaszok:</h3>';

    userAnswers.forEach((answer, index) => {
        const div = document.createElement('div');
        div.className = 'correct-answer-item';
        
        const questionDiv = document.createElement('div');
        questionDiv.className = 'correct-answer-question';
        questionDiv.textContent = `${index + 1}. ${answer.question}`;
        
        const correctDiv = document.createElement('div');
        correctDiv.className = 'correct-answer-text';
        correctDiv.textContent = `✓ Helyes: ${answer.correctAnswers.join(', ')}`;
        
        div.appendChild(questionDiv);
        div.appendChild(correctDiv);

        if (!answer.isCorrect) {
            const userDiv = document.createElement('div');
            userDiv.className = 'user-answer-text';
            userDiv.textContent = `✗ Te: ${answer.userAnswer.join(', ')}`;
            div.appendChild(userDiv);
        }

        section.appendChild(div);
    });
}

// Generate certificate
function generateCertificate(name, sessionKey) {
    // Check if already downloaded
    if (localStorage.getItem(sessionKey)) {
        alert('Ezt a tanúsítványt már letöltötted!');
        document.getElementById('downloadBtn').disabled = true;
        document.getElementById('downloadBtn').textContent = '✓ Már letöltve';
        return;
    }

    // Csillagászati emojik
    const spaceEmojis = ['🌟', '⭐', '✨', '🪐', '🌙', '🌎', '🌍', '🌏', '☄️', '🚀', '🛸', '🌌', '🔭', '🌠', '💫'];
    const yellowEmojis = ['🌟', '⭐', '✨', '🪐', '🌙', '🌠', '💫']; // Összes sárga emoji és Szaturnusz
    const earthEmojis = ['🌎', '🌍', '🌏']; // Föld emojik
    
    // Véletlenszerű emoji választás
    function getRandomEmojis(count, isGold = false) {
        // Szűrjük ki a sárgákat arany szintnél
        let availableEmojis = isGold 
            ? spaceEmojis.filter(e => !yellowEmojis.includes(e))
            : spaceEmojis;
        
        // Keverjük meg
        const shuffled = [...availableEmojis].sort(() => Math.random() - 0.5);
        
        // Válasszunk emojikkat, de max 1 Föld
        const selected = [];
        let earthEmoji = null;
        
        // Először gyűjtsük össze a Földet és a többi emojit külön
        const nonEarthEmojis = [];
        for (const emoji of shuffled) {
            if (earthEmojis.includes(emoji) && !earthEmoji) {
                earthEmoji = emoji; // Első Föld
            } else if (!earthEmojis.includes(emoji)) {
                nonEarthEmojis.push(emoji);
            }
        }
        
        // Ha arany szint (3 emoji) és van Föld, csak 2 nem-Föld emojit vegyünk
        const neededCount = (count === 3 && isGold && earthEmoji) ? 2 : count;
        
        // Válasszunk a szükséges mennyiséget
        for (let i = 0; i < neededCount && i < nonEarthEmojis.length; i++) {
            selected.push(nonEarthEmojis[i]);
        }
        
        // Ha van Föld és 3 emojit kértünk (arany szint), rakjuk középre
        if (earthEmoji && count === 3 && isGold) {
            if (selected.length >= 2) {
                // Helyezzük be középre (index 1, ami a 2. pozíció)
                selected.splice(1, 0, earthEmoji);
            } else {
                selected.push(earthEmoji);
            }
        } else if (earthEmoji && selected.length < count) {
            // Egyébként adjuk hozzá, ha van hely
            selected.push(earthEmoji);
        }
        
        return selected.join('');
    }

    const canvas = document.getElementById('certificateCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 600;

    const goldPoints = window.goldPoints || 50;
    const silverPoints = window.silverPoints || 40;

    // Determine level and colors
    let levelText = '';
    let emoji = getRandomEmojis(1);
    let color1, color2, borderColor;
    
    if (earnedPoints >= goldPoints) {
        levelText = 'ARANY SZINT';
        emoji = getRandomEmojis(3, true); // true = arany szint, kiszűri a sárgákat
        color1 = '#FFD700';  // Gold
        color2 = '#FFA500';  // Orange
        borderColor = '#FFD700';
    } else if (earnedPoints >= silverPoints) {
        levelText = 'EZÜST SZINT';
        emoji = getRandomEmojis(2);
        color1 = '#C0C0C0';  // Silver
        color2 = '#A8A8A8';  // Dark silver
        borderColor = '#C0C0C0';
    } else {
        levelText = 'BRONZ SZINT';
        emoji = getRandomEmojis(1);
        color1 = '#CD7F32';  // Bronze
        color2 = '#A0522D';  // Dark bronze
        borderColor = '#CD7F32';
    }

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, 760, 560);
    
    // Inner border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 720, 520);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('IGAZOLÁS', 400, 100);

    // Level badge
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(levelText, 400, 145);

    // Underline
    ctx.beginPath();
    ctx.moveTo(250, 155);
    ctx.lineTo(550, 155);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Name
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(name, 400, 220);

    // Main text
    ctx.font = '24px Arial';
    const topicName = topicNames[currentTopic] || currentTopic;
    ctx.fillText(`A(z) ${topicName} témakör feladatát`, 400, 290);
    
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${earnedPoints} ponttal`, 400, 350);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.fillText('sikeresen elvégezte.', 400, 400);

    // Emoji
    ctx.font = '64px Arial';
    ctx.fillText(emoji, 400, 480);

    // Date
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}-${String(now.getSeconds()).padStart(2,'0')}`;
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(dateStr, 400, 540);

    // Download
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Igazolas_${topicName}_${levelText.replace(' ', '_')}_${name}_${dateStr}.png`;
        a.click();
        URL.revokeObjectURL(url);

        // Mark as downloaded
        localStorage.setItem(sessionKey, 'downloaded');
        document.getElementById('downloadBtn').disabled = true;
        document.getElementById('downloadBtn').textContent = '✓ Letöltve';
    });
}

// Restart quiz
function restartQuiz() {
    currentTopic = '';
    allQuestions = [];
    resetQuiz();
    showScreen('topicScreen');
}

// Utility functions
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function updateQuestionCounter(num) {
    document.querySelectorAll('#currentQuestion').forEach(el => {
        el.textContent = num;
    });
}

function updateTotalPointsDisplay() {
    document.querySelectorAll('#totalPointsDisplay').forEach(el => {
        el.textContent = earnedPoints;
    });
}

function updateMaxPointsDisplay() {
    const minPoints = window.minPoints || 30;
    document.querySelectorAll('#maxPoints').forEach(el => {
        el.textContent = minPoints;
    });
}

function updateProgressBar() {
    const minPoints = window.minPoints || 30;
    const progress = Math.min((earnedPoints / minPoints) * 100, 100);
    document.getElementById('progressFill').style.width = progress + '%';
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}
