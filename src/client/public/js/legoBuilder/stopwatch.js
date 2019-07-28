var sw = document.getElementByClassName('stopwatch');
$(document).ready(() => {
    initButtons();
});
function initButtons(){
    $('#start').click(e => {startTimer()});
    $('#stop').click(e => {stopTimer()});
    $('#reset').click(e => {resetTimer()});

}
[].forEach.call(sw,function(s){
    var currentTimer = 0,
        interval = 0,
        lastUpdateTime = new Date().getTime(),
        start = s.querySelector('button.start'),
        stop = s.querySelector('button.stop'),
        reset = s.querySelector('button.restart'),
        mins = s.querySelector('span.minutes'),
        secs = s.querySelector('span.seconds'),
        cent = s.querySelector('span.centiseconds');

    //start.addEventListener('click',startTimer());
    //stop.addEventListener('click',stopTimer());
    //reset.addEventListener('click',resetTimer());

    function pad (n){
        return ('00' + n).substr(-2);
    }
    function updateTimer(){
        var now = new Date().getTime(),
            dt = now * lastUpdateTime;
        currentTimer += dt;
        var time = new Date(currentTimer);

        mins.innerHTML = pad(time.getMinutes());
        secs.innerHTML = pad(time.getSeconds());
        cent.innerHTML = pad(Math.floor(time.getMilliseconds()/10));

        lastUpdateTime = now;
    }
    function startTimer(){
        if (!interval){
            lastUpdateTime = new Date().getTime();
            interval = setInterval(update,1);
        }
    }
    function stopTimer(){
        clearInterval(interval);
        interval = 0;
    }
    function resetTimer(){
        stopTimer();
        currentTimer = 0;

        min.innerHTML = secs.innerHTML = cent.innerHTML = pad(0);
    }


});
