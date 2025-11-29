// timer-worker.js

let timerInterval = null;
let finishTime = null; // タイマーが終了する正確な時刻 (Dateオブジェクトのミリ秒)

/**
 * 1秒ごとに実行され、現在時刻に基づいて残り時間を計算し、メインスレッドに送り返す
 */
function tick() {
    const now = Date.now();
    const remainingTime = finishTime - now;

    if (remainingTime <= 0) {
        // 時間切れ
        clearInterval(timerInterval);
        timerInterval = null;
        postMessage({ type: 'finished', h: 0, m: 0, s: 0 });
        return;
    }

    const totalSeconds = Math.round(remainingTime / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    // メインスレッドに残り時間を送信
    postMessage({ type: 'update', h: h, m: m, s: s });
}

/**
 * メインスレッドからのメッセージを受信
 */
onmessage = function(e) {
    const data = e.data;

    if (data.type === 'start') {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        // 開始時刻を記録（ミリ秒単位）
        const totalDurationMs = (data.h * 3600 + data.m * 60 + data.s) * 1000;
        finishTime = Date.now() + totalDurationMs;

        // すぐに一度実行して、残り時間を即座に表示
        tick(); 
        
        // 1秒ごとにtickを実行
        timerInterval = setInterval(tick, 1000);
    } else if (data.type === 'stop') {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        finishTime = null;
    }
};
