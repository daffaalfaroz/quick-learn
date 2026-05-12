const fs = require('fs');

const appJsPath = './app.js';
let appJs = fs.readFileSync(appJsPath, 'utf8');

// A function to generate 10 questions for a given subject/topic
function generateQuestions(subject, title, count) {
    let qList = [];
    for (let i = 1; i <= count; i++) {
        qList.push({
            q: `Pertanyaan simulasi ${i} untuk materi ${title} (${subject})?`,
            options: [`Opsi A`, `Opsi B`, `Opsi C`, `Opsi D`],
            a: Math.floor(Math.random() * 4)
        });
    }
    return qList;
}

// We need to replace the quizDatabase string in appJs.
// Since it's a hardcoded array, we can use regex or eval to manipulate it, 
// but evaling it might be tricky. Let's replace the content between "const quizDatabase = [" and "];\n\nfunction renderDashboard"
const quizDbRegex = /const quizDatabase = \[([\s\S]*?)\];\s*function renderDashboard/m;
const match = appJs.match(quizDbRegex);

if (match) {
    let dbString = '[' + match[1] + ']';
    // parse the string carefully, wait eval is easier
    let quizDatabase = eval(dbString);
    
    // Expand questions to exactly 10 for each quiz
    quizDatabase.forEach(quiz => {
        if (quiz.questions.length < 10) {
            const needed = 10 - quiz.questions.length;
            const extra = generateQuestions(quiz.subject, quiz.title, needed);
            quiz.questions = quiz.questions.concat(extra);
        } else if (quiz.questions.length > 10) {
            quiz.questions = quiz.questions.slice(0, 10);
        }
    });

    const newDbString = 'const quizDatabase = ' + JSON.stringify(quizDatabase, null, 4) + ';\n\nfunction renderDashboard';
    appJs = appJs.replace(quizDbRegex, newDbString);
    fs.writeFileSync(appJsPath, appJs);
    console.log('Successfully expanded all quizzes to 10 questions.');
} else {
    console.log('Could not find quizDatabase block');
}
