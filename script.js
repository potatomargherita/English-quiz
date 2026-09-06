const API_URL = "https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnTHAVGGqkhFQ8cQt9-CYlPh0eTGEB9CoY16UJBjF25-IgMntajbHLD6Vf4SFW8AGhDqnr3gi53Gzd3PjmPeiyK0yPQ_WO7I59RG-EZtP_FoFoObqp_dijEqz0gbw7VaTbNv_m4QxYHF-cwewdlDwAzCXIQfcwfqfDYDXagbPWzKlHH8qv-2J85g4srGO4VBfVfjPoDnr6VSYYiEImwnrJWi-RoDQkkX8HZlN3VY6ei7nykIip-rQoHrniQMXk6_DtQYSI_uL6QTO_I7Y8ItgjUNFZPO5w&lib=MGGNkkBYB9_EbA2oXK5fE53PtzVWH_WY1";


// ==================================================
// データ
// ==================================================

let words = [];


// ==================================================
// クイズ設定
// ==================================================

let startId = 1;
let endId = 100;

let totalQuestions = 10;


// ==================================================
// クイズの状態
// ==================================================

let currentQuestion = 0;
let correctCount = 0;


// 今回のクイズで使う単語
let quizWords = [];


// ==================================================
// 学習履歴
// ==================================================

// localStorageから履歴を読み込む
let studyData =
    JSON.parse(
        localStorage.getItem("leapStudyData")
    ) || {};


// ==================================================
// 学習履歴を保存する関数
// ==================================================

function saveStudyData() {

    localStorage.setItem(
        "leapStudyData",
        JSON.stringify(studyData)
    );

}


// ==================================================
// 回答結果を記録する関数
// ==================================================

function recordAnswer(wordId, isCorrect) {


    // まだその単語のデータがなければ作る
    if (!studyData[wordId]) {

        studyData[wordId] = {

            correct: 0,

            incorrect: 0

        };

    }


    // 正解なら正解数を+1
    if (isCorrect) {

        studyData[wordId].correct++;

    }


    // 不正解なら不正解数を+1
    else {

        studyData[wordId].incorrect++;

    }


    // 保存
    saveStudyData();


    // デバッグ用
    console.log(
        "学習履歴:",
        studyData[wordId]
    );

}


// ==================================================
// データ取得
// ==================================================

fetch(API_URL)

    .then(response => {

        if (!response.ok) {

            throw new Error(
                "データの取得に失敗しました"
            );

        }

        return response.json();

    })

    .then(data => {


        // ------------------------------------------
        // IDを数字に変換
        // ------------------------------------------

        words = data.map(word => ({

            id: Number(word.id),

            word: word.word,

            meaning: word.meaning

        }));


        // ------------------------------------------
        // デバッグ用
        // ------------------------------------------

        console.log("データ取得成功！");

        console.log(
            "単語数:",
            words.length
        );

        console.log(words);


        // ------------------------------------------
        // ロード画面を消す
        // ------------------------------------------

        document.querySelector(
            "#loading-screen"
        ).style.display = "none";


        // ------------------------------------------
        // スタート画面を表示
        // ------------------------------------------

        document.querySelector(
            "#home-screen"
        ).style.display = "block";

    })


    // ==================================================
    // エラー
    // ==================================================

    .catch(error => {

        console.error(
            "データ取得エラー:",
            error
        );


        document.querySelector(
            "#loading-screen"
        ).innerHTML = `

            <h2>Loading Error</h2>

            <p>
                単語データを読み込めませんでした。
            </p>

            <p>
                ページを再読み込みしてください。
            </p>

        `;

    });




// ==================================================
// 問題を作る
// ==================================================

function createQuestion() {


    // ==================================================
    // 全問題終了
    // ==================================================

    if (
        currentQuestion >=
        totalQuestions
    ) {

        showResult();

        return;

    }


    // ==================================================
    // 今何問目か
    // ==================================================

    currentQuestion++;


    // ==================================================
    // 進捗表示
    // ==================================================

    document.querySelector(
        "#progress"
    ).textContent =

        `${currentQuestion} / ${totalQuestions}`;


    // ==================================================
    // 正解の単語
    // ==================================================

    const correctWord =
        quizWords[currentQuestion - 1];


    // ==================================================
    // ダミー選択肢を作る
    // ==================================================

    const otherWords = words

        .filter(word => {

            return word.id !== correctWord.id;

        })

        .sort(() => Math.random() - 0.5)

        .slice(0, 3);


    // ==================================================
    // 4択を作る
    // ==================================================

    const choices = [

        correctWord,

        ...otherWords

    ];


    // ==================================================
    // 4択をシャッフル
    // ==================================================

    shuffle(choices);


    // ==================================================
    // 問題を表示
    // ==================================================

    document.querySelector(
        "#question"
    ).textContent =

        correctWord.word;


    // ==================================================
    // ボタンを取得
    // ==================================================

    const buttons =
        document.querySelectorAll(
            ".choice"
        );


    // ==================================================
    // 選択肢を表示
    // ==================================================

    choices.forEach(
        (choice, index) => {


            buttons[index].textContent =
                choice.meaning;


            buttons[index].disabled = false;


            buttons[index].onclick = () => {


                // --------------------------------------
                // ボタンを一時的に押せなくする
                // --------------------------------------

                buttons.forEach(button => {

                    button.disabled = true;

                });


                // --------------------------------------
                // 正解判定
                // --------------------------------------

                const isCorrect =
                    choice.id === correctWord.id;


                // --------------------------------------
                // 学習履歴に記録
                // --------------------------------------

                recordAnswer(
                    correctWord.id,
                    isCorrect
                );


            // --------------------------------------
// 正解・不正解
// --------------------------------------

const quizScreen =
    document.querySelector("#quiz-screen");


if (isCorrect) {

    correctCount++;

    // 選択肢エリアを水色にする
    quizScreen.classList.add("correct");

    // 選んだ正解を水色にする
    buttons[index].classList.add(
        "correct-answer"
    );

} else {

    // 選択肢エリアを赤色にする
    quizScreen.classList.add("incorrect");

    // 選んだ不正解を赤色にする
    buttons[index].classList.add(
        "wrong-answer"
    );

    // 正解の選択肢を水色にする
    buttons.forEach((button, buttonIndex) => {

        if (
            choices[buttonIndex].id ===
            correctWord.id
        ) {

            button.classList.add(
                "correct-answer"
            );

        }

    });

}


// --------------------------------------
// 1.5秒後に次の問題
// --------------------------------------

setTimeout(() => {

    quizScreen.classList.remove(
    "correct",
    "incorrect"
);

    buttons.forEach(button => {

        button.classList.remove(
            "correct-answer",
            "wrong-answer"
        );

    });

    createQuestion();

}, 1500);

            };

        }

    );

}


// ==================================================
// 結果画面
// ==================================================

function showResult() {


    document.querySelector(
        "#quiz-screen"
    ).style.display = "none";


    document.querySelector(
        "#result-screen"
    ).style.display = "block";


    document.querySelector(
        "#score"
    ).textContent =

        `${correctCount} / ${totalQuestions}`;


    const percentage = Math.round(

        correctCount /
        totalQuestions *
        100

    );


    document.querySelector(
        "#percentage"
    ).textContent =

        `正答率 ${percentage}%`;

}


// ==================================================
// もう一度挑戦
// ==================================================

document.querySelector(
    "#retry-button"
).onclick = () => {


    currentQuestion = 0;

    correctCount = 0;


    quizWords = shuffle(
        [...quizWords]
    );


    document.querySelector(
        "#result-screen"
    ).style.display = "none";


    document.querySelector(
        "#quiz-screen"
    ).style.display = "block";


    createQuestion();

};


// ==================================================
// シャッフル関数
// ==================================================

function shuffle(array) {


    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {


        const j = Math.floor(
            Math.random() * (i + 1)
        );


        [
            array[i],
            array[j]
        ] = [

            array[j],
            array[i]

        ];

    }


    return array;

}



// ==================================================
// HOME → LEAP HOME
// ==================================================

document.querySelector(
    "#leap-button"
).onclick = () => {

    document.querySelector(
        "#home-screen"
    ).style.display = "none";

    document.querySelector(
        "#leap-home-screen"
    ).style.display = "block";

};

// ==================================================
// LEAP HOME → TEST設定
// ==================================================

document.querySelector(
    "#leap-test-button"
).onclick = () => {

    document.querySelector(
        "#leap-home-screen"
    ).style.display = "none";

    document.querySelector(
        "#test-settings-screen"
    ).style.display = "block";

};

// ==================================================
// TEST設定 → クイズ開始
// ==================================================

document.querySelector(
    "#start-button"
).onclick = () => {

    // 入力値を取得
    startId = Number(
        document.querySelector(
            "#start-id"
        ).value
    );

    endId = Number(
        document.querySelector(
            "#end-id"
        ).value
    );

    totalQuestions = Number(
        document.querySelector(
            "#question-count"
        ).value
    );


    // ==================================================
    // 入力チェック
    // ==================================================

    if (startId < 1) {

        alert(
            "開始番号は1以上にしてください。"
        );

        return;
    }


    if (endId > 2300) {

        alert(
            "終了番号は2300以下にしてください。"
        );

        return;
    }


    if (startId > endId) {

        alert(
            "開始番号は終了番号以下にしてください。"
        );

        return;
    }


    if (
        totalQuestions < 1 ||
        totalQuestions > 100
    ) {

        alert(
            "問題数は1〜100問で設定してください。"
        );

        return;
    }


    // ==================================================
    // 出題範囲の単語を取得
    // ==================================================

    const candidates = words.filter(word => {

        return (
            word.id >= startId &&
            word.id <= endId
        );

    });


    // 4択を作れるか確認
    if (candidates.length < 4) {

        alert(
            "出題範囲は4語以上にしてください。"
        );

        return;
    }


    // 問題数が多すぎないか確認
    if (
        totalQuestions >
        candidates.length
    ) {

        alert(
            `この範囲には${candidates.length}語しかありません。\n` +
            `問題数を${candidates.length}問以下にしてください。`
        );

        return;
    }


    // ==================================================
    // クイズを初期化
    // ==================================================

    currentQuestion = 0;
    correctCount = 0;


    // 今回出題する単語を決定
    quizWords = shuffle(
        [...candidates]
    ).slice(
        0,
        totalQuestions
    );


    console.log(
        "今回の出題:",
        quizWords
    );


    // ==================================================
    // 画面切り替え
    // ==================================================

    document.querySelector(
        "#test-settings-screen"
    ).style.display = "none";

    document.querySelector(
        "#result-screen"
    ).style.display = "none";

    document.querySelector(
        "#quiz-screen"
    ).style.display = "block";


    // 最初の問題
    createQuestion();

};

// ==================================================
// TEST設定 → LEAP HOME
// ==================================================

document.querySelector(
    "#test-back-button"
).onclick = () => {

    document.querySelector(
        "#test-settings-screen"
    ).style.display = "none";

    document.querySelector(
        "#leap-home-screen"
    ).style.display = "block";

};

// ==================================================
// LEAP HOME → STATUS
// ==================================================

document.querySelector(
    "#leap-status-button"
).onclick = () => {

    // LEAP HOMEを隠す
    document.querySelector(
        "#leap-home-screen"
    ).style.display = "none";


    // 学習状況を計算
    updateStatus();


    // STATUS画面を表示
    document.querySelector(
        "#status-screen"
    ).style.display = "block";

};


function updateStatus() {


    // ==================================================
    // 学習した単語
    // ==================================================

    const studiedWords =
        Object.keys(studyData);


    const studiedCount =
        studiedWords.length;


    // ==================================================
    // 全体の正解数・不正解数
    // ==================================================

    let totalCorrect = 0;

    let totalIncorrect = 0;


    studiedWords.forEach(id => {

        totalCorrect +=
            studyData[id].correct;

        totalIncorrect +=
            studyData[id].incorrect;

    });


    // ==================================================
    // 全体の正答率
    // ==================================================

    const totalAnswers =
        totalCorrect +
        totalIncorrect;


    let accuracy = 0;


    if (totalAnswers > 0) {

        accuracy = Math.round(
            totalCorrect /
            totalAnswers *
            100
        );

    }


    // ==================================================
    // 学習単語数を表示
    // ==================================================

    document.querySelector(
        "#studied-count"
    ).textContent =

        `${studiedCount} / ${words.length}語`;


    // ==================================================
    // 全体正答率を表示
    // ==================================================

    document.querySelector(
        "#overall-accuracy"
    ).textContent =

        `${accuracy}%`;


    // ==================================================
    // 単語ごとの正答率を計算
    // ==================================================

    const ranking = studiedWords.map(id => {


        const data =
            studyData[id];


        const correct =
            data.correct;


        const incorrect =
            data.incorrect;


        const attempts =
            correct + incorrect;


        const word =
            words.find(
                item => item.id === Number(id)
            );


        let wordAccuracy = 0;


        if (attempts > 0) {

            wordAccuracy =
                Math.round(
                    correct /
                    attempts *
                    100
                );

        }


        return {

            id: Number(id),

            word: word
                ? word.word
                : "Unknown",

            correct: correct,

            incorrect: incorrect,

            attempts: attempts,

            accuracy: wordAccuracy

        };

    });


    // ==================================================
    // 苦手ランキング
    // ==================================================

    const weakWords = [...ranking]

        .sort((a, b) => {

            // 正答率が低い順
            if (a.accuracy !== b.accuracy) {

                return a.accuracy -
                    b.accuracy;

            }

            // 同じ正答率なら
            // 回答回数が多い順
            return b.attempts -
                a.attempts;

        })

        .slice(0, 5);


    // ==================================================
    // 得意ランキング
    // ==================================================

    const strongWords = [...ranking]

        .sort((a, b) => {

            // 正答率が高い順
            if (a.accuracy !== b.accuracy) {

                return b.accuracy -
                    a.accuracy;

            }

            // 同じ正答率なら
            // 回答回数が多い順
            return b.attempts -
                a.attempts;

        })

        .slice(0, 5);


    // ==================================================
    // 苦手単語をHTMLにする
    // ==================================================

    const weakElement =
        document.querySelector(
            "#weak-words"
        );


    if (weakWords.length === 0) {

        weakElement.innerHTML =
            "まだデータがありません。";

    }

    else {

        weakElement.innerHTML =
            weakWords.map((item, index) => {

                return `

                    <div class="status-word">

                        <strong>
                            ${index + 1}. ${item.word}
                        </strong>

                        <br>

                        正答率
                        ${item.accuracy}%

                        （${item.correct}
                        / ${item.attempts}）

                    </div>

                `;

            }).join("");

    }


    // ==================================================
    // 得意単語をHTMLにする
    // ==================================================

    const strongElement =
        document.querySelector(
            "#strong-words"
        );


    if (strongWords.length === 0) {

        strongElement.innerHTML =
            "まだデータがありません。";

    }

    else {

        strongElement.innerHTML =
            strongWords.map((item, index) => {

                return `

                    <div class="status-word">

                        <strong>
                            ${index + 1}. ${item.word}
                        </strong>

                        <br>

                        正答率
                        ${item.accuracy}%

                        （${item.correct}
                        / ${item.attempts}）

                    </div>

                `;

            }).join("");

    }

}


// ==================================================
// STATUS → LEAP HOME
// ==================================================

document.querySelector(
    "#status-back-button"
).onclick = () => {


    // STATUS画面を隠す
    document.querySelector(
        "#status-screen"
    ).style.display = "none";


    // LEAP HOMEを表示
    document.querySelector(
        "#leap-home-screen"
    ).style.display = "block";

};