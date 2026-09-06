const API_URL = "https://script.google.com/macros/s/AKfycby0CTKPBEFCH__N4fv68p-wNKtNEH6jNPmspOjMU6EN_RW6H5TEYTPyeoF_DLz6gn48PQ/exec";


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
// 現在のテストモード
// ==================================================

// normal → 通常TEST
// weak   → WEAK TEST

let quizMode = "normal";


// ==================================================
// クイズの状態
// ==================================================

let currentQuestion = 0;
let correctCount = 0;


// 今回のクイズで使う単語
let quizWords = [];
let quizResults = [];


// ==================================================
// 学習履歴
// ==================================================

let studyData =
    JSON.parse(
        localStorage.getItem("leapStudyData")
    ) || {};


// ==================================================
// 学習履歴を保存
// ==================================================

function saveStudyData() {

    localStorage.setItem(
        "leapStudyData",
        JSON.stringify(studyData)
    );

}


// ==================================================
// 回答結果を記録
// ==================================================

function recordAnswer(wordId, isCorrect) {

    if (!studyData[wordId]) {

        studyData[wordId] = {
            correct: 0,
            incorrect: 0
        };

    }


    if (isCorrect) {

        studyData[wordId].correct++;

    } else {

        studyData[wordId].incorrect++;

    }


    saveStudyData();


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


        console.log("データ取得成功！");
        console.log("単語数:", words.length);
        console.log(words);


        // ------------------------------------------
        // ロード画面を消す
        // ------------------------------------------

        document.querySelector(
            "#loading-screen"
        ).style.display = "none";


        // ------------------------------------------
        // HOMEを表示
        // ------------------------------------------

        document.querySelector(
            "#home-screen"
        ).style.display = "block";

    })


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

    // ------------------------------------------
    // 全問題終了
    // ------------------------------------------

    if (currentQuestion >= totalQuestions) {

        showResult();

        return;

    }


    // ------------------------------------------
    // 問題番号
    // ------------------------------------------

    currentQuestion++;


    // ------------------------------------------
    // 進捗表示
    // ------------------------------------------

    document.querySelector(
        "#progress"
    ).textContent =
        `${currentQuestion} / ${totalQuestions}`;


    // ------------------------------------------
    // 正解の単語
    // ------------------------------------------

    const correctWord =
        quizWords[currentQuestion - 1];


    // ------------------------------------------
    // ダミー選択肢
    // ------------------------------------------

    const otherWords = words

        .filter(word => {

            return word.id !== correctWord.id;

        })

        .sort(() => Math.random() - 0.5)

        .slice(0, 3);


    // ------------------------------------------
    // 4択
    // ------------------------------------------

    const choices = [
        correctWord,
        ...otherWords
    ];


    // ------------------------------------------
    // シャッフル
    // ------------------------------------------

    shuffle(choices);


    // ------------------------------------------
    // 問題表示
    // ------------------------------------------

    document.querySelector(
        "#question"
    ).textContent =
        correctWord.word;


    // ------------------------------------------
    // 選択肢ボタン
    // ------------------------------------------

    const buttons =
        document.querySelectorAll(".choice");


    choices.forEach((choice, index) => {

        buttons[index].textContent =
            choice.meaning;

        buttons[index].disabled = false;


        // 念のため前のイベントを解除
        buttons[index].onclick = null;


        buttons[index].onclick = () => {

            // --------------------------------------
            // 全ボタンを一時的に無効化
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
            // 学習履歴
            // --------------------------------------

            recordAnswer(
                correctWord.id,
                isCorrect
            );

            quizResults.push({
                word: correctWord.word,
                meaning: correctWord.meaning,
                isCorrect: isCorrect
            });


            // --------------------------------------
            // クイズ画面
            // --------------------------------------

            const quizScreen =
                document.querySelector("#quiz-screen");


            // --------------------------------------
            // 正解
            // --------------------------------------

            if (isCorrect) {

                correctCount++;


                quizScreen.classList.add(
                    "correct"
                );


                buttons[index].classList.add(
                    "correct-answer"
                );

            }


            // --------------------------------------
            // 不正解
            // --------------------------------------

            else {

                quizScreen.classList.add(
                    "incorrect"
                );


                buttons[index].classList.add(
                    "wrong-answer"
                );


                // 正解を表示
                buttons.forEach(
                    (button, buttonIndex) => {

                        if (
                            choices[buttonIndex].id ===
                            correctWord.id
                        ) {

                            button.classList.add(
                                "correct-answer"
                            );

                        }

                    }
                );

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

    });

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


    /* =========================
       スコア
    ========================= */

    document.querySelector(
        "#score"
    ).textContent =
        `${correctCount} / ${totalQuestions}`;

    const percentage =
        Math.round(
            correctCount /
            totalQuestions *
            100
        );

    document.querySelector(
        "#percentage"
    ).textContent =
        `正答率 ${percentage}%`;


    /* =========================
       単語一覧
    ========================= */

    const resultList =
        document.querySelector(
            "#result-word-list"
        );

    resultList.innerHTML =
        quizResults
            .map(result => {

                const className =
                    result.isCorrect
                        ? "result-word correct"
                        : "result-word incorrect";


                return `
                    <div class="${className}">
                        <div class="result-word-header">

                            <strong>
                                ${result.word}
                            </strong>
                        </div>

                        <div class="result-meaning">
                            ${result.meaning}
                        </div>
                    </div>
                `;
            })
            .join("");
}


// ==================================================
// RETRY
// ==================================================

document.querySelector(
    "#retry-button"
).onclick = () => {

    /* =========================
       同じ範囲から問題を再抽選
    ========================= */

    currentQuestion = 0;
    correctCount = 0;
    quizResults = [];

    let candidates =
        words.filter(word => {
            return (
                word.id >= startId &&
                word.id <= endId
            );
        });


    /* =========================
       前回と同じ問題を
       できるだけ避ける
    ========================= */

    const previousIds =
        quizWords.map(word => word.id);

    const differentWords =
        candidates.filter(word => {
            return !previousIds.includes(word.id);
        });


    /*
     * 新しい問題だけで必要数を
     * 用意できる場合はそれを使う
     *
     * 足りない場合は残りを
     * 元の範囲から補充
     */

    let newCandidates = [];

    if (
        differentWords.length >=
        totalQuestions
    ) {
        newCandidates =
            differentWords;
    } else {
        newCandidates = [
            ...differentWords,
            ...candidates.filter(word => {
                return previousIds.includes(
                    word.id
                );
            })
        ];
    }


    quizWords =
        shuffle(
            [...newCandidates]
        ).slice(
            0,
            totalQuestions
        );


    console.log(
        "再挑戦の問題:",
        quizWords
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
// シャッフル
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

    quizMode = "normal";


    document.querySelector(
        "#settings-title"
    ).textContent = "TEST";


    // 説明文が存在する場合だけ変更
    const description =
        document.querySelector(
            "#settings-description"
        );

    if (description) {

        description.textContent =
            "出題範囲を設定してください";

    }


    document.querySelector(
        "#leap-home-screen"
    ).style.display = "none";


    document.querySelector(
        "#quiz-settings-screen"
    ).style.display = "block";

};


// ==================================================
// LEAP HOME → WEAK TEST設定
// ==================================================

document.querySelector(
    "#leap-weak-button"
).onclick = () => {

    quizMode = "weak";


    document.querySelector(
        "#settings-title"
    ).textContent = "WEAK TEST";


    // 説明文が存在する場合だけ変更
    const description =
        document.querySelector(
            "#settings-description"
        );

    if (description) {

        description.textContent =
            "苦手な単語から出題します";

    }


    document.querySelector(
        "#leap-home-screen"
    ).style.display = "none";


    document.querySelector(
        "#quiz-settings-screen"
    ).style.display = "block";

};


// ==================================================
// 設定画面 → クイズ開始
// ==================================================

document.querySelector(
    "#settings-start-button"
).onclick = () => {

    // ------------------------------------------
    // 入力値取得
    // ------------------------------------------

    startId = Number(
        document.querySelector(
            "#setting-start-id"
        ).value
    );


    endId = Number(
        document.querySelector(
            "#setting-end-id"
        ).value
    );


    totalQuestions = Number(
        document.querySelector(
            "#setting-question-count"
        ).value
    );


    // ------------------------------------------
    // 入力チェック
    // ------------------------------------------

    if (
        !startId ||
        !endId ||
        !totalQuestions
    ) {

        alert(
            "範囲と問題数を入力してください。"
        );

        return;

    }


    if (startId < 1) {

        alert(
            "開始番号は1以上にしてください。"
        );

        return;

    }


    if (endId > words.length) {

        alert(
            `終了番号は${words.length}以下にしてください。`
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
    // WEAK TEST
    // ==================================================

    if (quizMode === "weak") {

        startWeakTest();

        return;

    }


    // ==================================================
    // 通常TEST
    // ==================================================

    const candidates =
        words.filter(word => {

            return (
                word.id >= startId &&
                word.id <= endId
            );

        });


    // ------------------------------------------
    // 4択を作れるか
    // ------------------------------------------

    if (candidates.length < 4) {

        alert(
            "出題範囲は4語以上にしてください。"
        );

        return;

    }


    // ------------------------------------------
    // 問題数チェック
    // ------------------------------------------

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


    // ------------------------------------------
    // クイズ初期化
    // ------------------------------------------

    currentQuestion = 0;

    correctCount = 0;

    quizResults = [];


    quizWords = shuffle(
        [...candidates]
    ).slice(
        0,
        totalQuestions
    );


    console.log(
        "今回の通常TEST:",
        quizWords
    );


    // ------------------------------------------
    // 画面切り替え
    // ------------------------------------------

    document.querySelector(
        "#quiz-settings-screen"
    ).style.display = "none";


    document.querySelector(
        "#result-screen"
    ).style.display = "none";


    document.querySelector(
        "#quiz-screen"
    ).style.display = "block";


    // ------------------------------------------
    // 第1問
    // ------------------------------------------

    createQuestion();

};


// ==================================================
// 設定画面 → LEAP HOME
// ==================================================

document.querySelector(
    "#settings-back-button"
).onclick = () => {

    document.querySelector(
        "#quiz-settings-screen"
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

    document.querySelector(
        "#leap-home-screen"
    ).style.display = "none";


    updateStatus();


    document.querySelector(
        "#status-screen"
    ).style.display = "block";

};


// ==================================================
// STATUS更新
// ==================================================

function updateStatus() {

    // ------------------------------------------
    // 学習した単語
    // ------------------------------------------

    const studiedWords =
        Object.keys(studyData);


    const studiedCount =
        studiedWords.length;


    // ------------------------------------------
    // 全体の正解数・不正解数
    // ------------------------------------------

    let totalCorrect = 0;

    let totalIncorrect = 0;


    studiedWords.forEach(id => {

        totalCorrect +=
            studyData[id].correct || 0;

        totalIncorrect +=
            studyData[id].incorrect || 0;

    });


    // ------------------------------------------
    // 全体正答率
    // ------------------------------------------

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


    // ------------------------------------------
    // 学習単語数
    // ------------------------------------------

    document.querySelector(
        "#studied-count"
    ).textContent =
        `${studiedCount} / ${words.length}語`;


    // ------------------------------------------
    // 全体正答率
    // ------------------------------------------

    document.querySelector(
        "#overall-accuracy"
    ).textContent =
        `${accuracy}%`;


    // ------------------------------------------
    // 単語ごとのデータ
    // ------------------------------------------

    const ranking =
        studiedWords.map(id => {

            const data =
                studyData[id];


            const correct =
                data.correct || 0;


            const incorrect =
                data.incorrect || 0;


            const attempts =
                correct + incorrect;


            const word =
                words.find(
                    item =>
                        item.id === Number(id)
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

    const weakWords =
        [...ranking]
            .sort((a, b) => {

                if (
                    a.accuracy !==
                    b.accuracy
                ) {

                    return (
                        a.accuracy -
                        b.accuracy
                    );

                }


                return (
                    b.attempts -
                    a.attempts
                );

            })
            .slice(0, 5);


    // ==================================================
    // 得意ランキング
    // ==================================================

    const strongWords =
        [...ranking]
            .sort((a, b) => {

                if (
                    a.accuracy !==
                    b.accuracy
                ) {

                    return (
                        b.accuracy -
                        a.accuracy
                    );

                }


                return (
                    b.attempts -
                    a.attempts
                );

            })
            .slice(0, 5);


    // ==================================================
    // 苦手単語表示
    // ==================================================

    const weakElement =
        document.querySelector(
            "#weak-words"
        );


    if (weakWords.length === 0) {

        weakElement.innerHTML =
            "まだデータがありません。";

    } else {

        weakElement.innerHTML =
            weakWords
                .map((item, index) => {

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

                })
                .join("");

    }


    // ==================================================
    // 得意単語表示
    // ==================================================

    const strongElement =
        document.querySelector(
            "#strong-words"
        );


    if (strongWords.length === 0) {

        strongElement.innerHTML =
            "まだデータがありません。";

    } else {

        strongElement.innerHTML =
            strongWords
                .map((item, index) => {

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

                })
                .join("");

    }

}


// ==================================================
// STATUS → LEAP HOME
// ==================================================

document.querySelector(
    "#status-back-button"
).onclick = () => {

    document.querySelector(
        "#status-screen"
    ).style.display = "none";


    document.querySelector(
        "#leap-home-screen"
    ).style.display = "block";

};


// ==================================================
// WEAK TEST
// ==================================================

function startWeakTest() {

    // ------------------------------------------
    // 現在の設定値を使用
    // ------------------------------------------

    const rangeWords =
        words.filter(word => {

            return (
                word.id >= startId &&
                word.id <= endId
            );

        });


    // ------------------------------------------
    // 学習済み単語だけ取り出す
    // ------------------------------------------

    const weakWords =
        rangeWords

            .map(word => {

                const data =
                    studyData[word.id];


                if (!data) {

                    return null;

                }


                const correct =
                    data.correct || 0;


                const incorrect =
                    data.incorrect || 0;


                const attempts =
                    correct +
                    incorrect;


                if (attempts === 0) {

                    return null;

                }


                const accuracy =
                    correct /
                    attempts *
                    100;


                return {

                    word: word,

                    accuracy: accuracy,

                    attempts: attempts

                };

            })

            .filter(
                item => item !== null
            );


    // ------------------------------------------
    // 苦手順に並べる
    // ------------------------------------------

    weakWords.sort((a, b) => {

        if (
            a.accuracy !==
            b.accuracy
        ) {

            return (
                a.accuracy -
                b.accuracy
            );

        }


        return (
            b.attempts -
            a.attempts
        );

    });


    // ------------------------------------------
    // 学習済み単語がない
    // ------------------------------------------

    if (weakWords.length === 0) {

        alert(
            "この範囲には、まだ学習した単語がありません。"
        );

        return;

    }


    // ------------------------------------------
    // 問題数を決定
    // ------------------------------------------

    const selectedWords =
        weakWords.slice(
            0,
            totalQuestions
        );


    // ------------------------------------------
    // 出題単語
    // ------------------------------------------

    quizWords =
        selectedWords.map(
            item => item.word
        );


    totalQuestions =
        quizWords.length;


    // ------------------------------------------
    // クイズ初期化
    // ------------------------------------------

    currentQuestion = 0;

    correctCount = 0;

    quizResults = [];


    console.log(
        "今回のWEAK TEST:",
        quizWords
    );


    // ------------------------------------------
    // 画面切り替え
    // ------------------------------------------

    document.querySelector(
        "#quiz-settings-screen"
    ).style.display = "none";


    document.querySelector(
        "#result-screen"
    ).style.display = "none";


    document.querySelector(
        "#quiz-screen"
    ).style.display = "block";


    // ------------------------------------------
    // 第1問
    // ------------------------------------------

    createQuestion();

}


// ==================================================
// Partボタン
// ==================================================

document.querySelectorAll(
    ".part-button"
).forEach(button => {

    button.onclick = () => {

        // ------------------------------------------
        // Partの範囲取得
        // ------------------------------------------

        const start =
            Number(
                button.dataset.start
            );


        const end =
            Number(
                button.dataset.end
            );


        // ------------------------------------------
        // 入力欄に反映
        // ------------------------------------------

        document.querySelector(
            "#setting-start-id"
        ).value = start;


        document.querySelector(
            "#setting-end-id"
        ).value = end;


        // ------------------------------------------
        // 全Partの選択状態を解除
        // ------------------------------------------

        document.querySelectorAll(
            ".part-button"
        ).forEach(partButton => {

            partButton.classList.remove(
                "selected"
            );

        });


        // ------------------------------------------
        // 今押したPartを選択状態にする
        // ------------------------------------------

        button.classList.add(
            "selected"
        );

    };

});


// ==================================================
// 手入力したらPart選択を解除
// ==================================================

const startInput =
    document.querySelector(
        "#setting-start-id"
    );


const endInput =
    document.querySelector(
        "#setting-end-id"
    );


function clearPartSelection() {

    document.querySelectorAll(
        ".part-button"
    ).forEach(button => {

        button.classList.remove(
            "selected"
        );

    });

}


startInput.addEventListener(
    "input",
    clearPartSelection
);


endInput.addEventListener(
    "input",
    clearPartSelection
);

document.querySelector(
    "#result-back-button"
).onclick = () => {

    document.querySelector(
        "#result-screen"
    ).style.display = "none";

    document.querySelector(
        "#leap-home-screen"
    ).style.display = "block";
};

// ==================================================
// LEAP HOME → LIST
// ==================================================

document.querySelector(
    "#leap-list-button"
).onclick = () => {

    document.querySelector(
        "#leap-home-screen"
    ).style.display = "none";

    document.querySelector(
        "#list-screen"
    ).style.display = "block";

    updateList();

};


// ==================================================
// LIST更新
// ==================================================

let listStartId = 1;
let listEndId = 2300;


function updateList() {

    const searchInput =
        document.querySelector(
            "#list-search-input"
        );

    const searchText =
        searchInput.value
            .trim()
            .toLowerCase();


    const filteredWords =
        words.filter(word => {

            // ------------------------------
            // ID範囲
            // ------------------------------

            if (
                word.id < listStartId ||
                word.id > listEndId
            ) {

                return false;

            }


            // ------------------------------
            // 検索
            // ------------------------------

            if (searchText === "") {

                return true;

            }


            const wordText =
                String(word.word)
                    .toLowerCase();

            const meaningText =
                String(word.meaning)
                    .toLowerCase();


            return (
                wordText.includes(searchText) ||
                meaningText.includes(searchText)
            );

        });


    const container =
        document.querySelector(
            "#list-word-container"
        );


    // ------------------------------
    // 単語がない
    // ------------------------------

    if (filteredWords.length === 0) {

        container.innerHTML = `
            <div style="
                padding: 30px;
                text-align: center;
                color: #999;
            ">
                該当する単語がありません。
            </div>
        `;

        return;

    }


    // ------------------------------
    // 単語表示
    // ------------------------------

    container.innerHTML =
        filteredWords
            .map(word => {

                const data =
                    studyData[word.id];


                let statusText =
                    "未学習";

                let learnedClass = "";


                if (data) {

                    const correct =
                        data.correct || 0;

                    const incorrect =
                        data.incorrect || 0;

                    const attempts =
                        correct +
                        incorrect;


                    if (attempts > 0) {

                        const accuracy =
                            Math.round(
                                correct /
                                attempts *
                                100
                            );


                        statusText =
                            `正答率 ${accuracy}%　` +
                            `（${attempts}回）`;

                        learnedClass =
                            "learned";

                    }

                }


                return `
                    <div class="list-word ${learnedClass}">

                        <div class="list-word-header">

                            <span class="list-word-id">
                                #${word.id}
                            </span>

                            <span class="list-word-name">
                                ${word.word}
                            </span>

                        </div>


                        <div class="list-word-meaning">
                            ${word.meaning}
                        </div>


                        <div class="list-word-status ${learnedClass}">
                            ${statusText}
                        </div>

                    </div>
                `;

            })
            .join("");

}


// ==================================================
// LIST検索
// ==================================================

document.querySelector(
    "#list-search-input"
).addEventListener(
    "input",
    updateList
);


// ==================================================
// LIST Part選択
// ==================================================

document.querySelectorAll(
    ".list-part-button"
).forEach(button => {

    button.onclick = () => {

        listStartId =
            Number(
                button.dataset.start
            );

        listEndId =
            Number(
                button.dataset.end
            );


        // ------------------------------
        // 選択状態
        // ------------------------------

        document.querySelectorAll(
            ".list-part-button"
        ).forEach(partButton => {

            partButton.classList.remove(
                "selected"
            );

        });


        button.classList.add(
            "selected"
        );


        updateList();

    };

});


// ==================================================
// LIST → LEAP HOME
// ==================================================

document.querySelector(
    "#list-back-button"
).onclick = () => {

    document.querySelector(
        "#list-screen"
    ).style.display = "none";

    document.querySelector(
        "#leap-home-screen"
    ).style.display = "block";

};