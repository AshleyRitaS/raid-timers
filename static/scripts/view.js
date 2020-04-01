//Requires timer.js
//Requires JQuery
(function() {
    var currentTime = 0;
    var current = {
        index : -1,
        id : 0,
        time : 0
    }
    var ready = false;
    var timerRunning = false;
    var stopTimer = false;

    //Performs initial setup and starts the timer.
    //Requires timers to be loaded.
    //calls reset() if required.
    var start = (function() {
        console.log('start');
        var startTime = 0;
        var intervalID;
        var timerList = [];
        function intervalFunc() {
            if (stopTimer) {
                clearInterval(intervalID);
                stopTimer = false;
                return;
            }
            currentTime = (Date.now() - startTime) / 1000;
            if (currentTime > current.time) {
                if (!nextTimer()) {
                    end();
                    return;
                }
                setCurrentRow(current.id);
            }
            displayCurrentRowTime();
            displayCurrentTime();
        }

        function nextTimer() {
            if (current.index + 1 >= timerList.length) {
                return false;
            }

            var nextTimer = timerList[current.index + 1];
            current = {
                index : current.index + 1,
                id : nextTimer.id,
                time : nextTimer.time
            }
            return true;
        }

        return function start() {
            if (!ready) {
                reset();
            }
            timerList = timers.all();
            startTime = Date.now() - (getCountdown() * 1000);
            ready = false;
            timerRunning = true;
            intervalID = setInterval(intervalFunc, 5);
        }
    }());

    //Ends the current timer without resetting any of the html.
    function end() {
        stopTimer = true;
        timerRunning = false;
    }

    //Resets the HTML and all variables in preparation to restart the timer.
    //Can be called manually or automatically called by start()
    //Calls end() if required
    function reset() {
        if (timerRunning) {
            end();
        }
        currentTime = getCountdown();
        displayCurrentTime();
        resetAllRows();
        current.id = 0;
        current.index = -1;
        current.time = 0;
        ready=true;
    }

    //retrieves the countdown amount, if any
    function getCountdown() {
        var countdown = parseFloat($('#countdown-duration').val()) * -1;
        console.log(countdown)
        if (isNaN(countdown)) {
            countdown = 0;
        }
        console.log(countdown);
        return countdown;
    }

    //Takes an ID and sets the matching HTML row as current, removing the current status from all other rows.
    function setCurrentRow(id) {
        resetAllRows();
        var newRow = $('#raid-timer tr[data-id='+ id + ']');
        newRow.addClass('current');
    }

    //resets all current rows to their default state.
    function resetAllRows() {
        $('#raid-timer tr.current').each(resetRow);
    }

    //resets a row to its default state. should be executed from within the context of the row to be cleared
    function resetRow() {
        var $this = $(this);
        var timer = timers.get(parseInt($this.data('id')));
        var time = 0;
        var timeDisplay = '';
        if (timer !== null) {
            var time = timer.time;
        }
        $this.removeClass('current');
        timeDisplay = formatTimeClock(time);
        $this.find('.time').text(timeDisplay);
    }

    //Accepts a floating point number as time.
    //Returns the time formatted as 0.00
    function formatTimeFloat(time) {
        return Number(time).toFixed(2);
    }

    //formates time as mm:ss, with a decimal point if digits is greater than 0
    function formatTimeClock(time, digits = 0) {
        var isNegative, absTime, minutes, seconds, formattedTime;
        if (time < 0) {
            isNegative = true;
            absTime = time * -1;
        } else {
            absTime = time;
        }
        minutes = Math.floor(absTime / 60);
        seconds = absTime - (minutes * 60);
        seconds = Number(seconds).toFixed(digits);
        
        if (seconds < 10) {
            seconds = '0' + seconds;
        }
        return (isNegative ? '-' : '') + minutes + ':' + seconds;
    }

    //Displays the currentTime in the #current-time element
    function displayCurrentTime() {
        $('#current-time').text(formatTimeClock(currentTime, 2));
    }

    //Displays the time as a countdown within the current row.
    function displayCurrentRowTime() {
        $('#raid-timer tr.current').each(function() {
            var $this = $(this);
            var timer = timers.get(parseInt($this.data('id')));
            var timeRemaining = timer.time - currentTime;
            $this.find('.time').text('-' + formatTimeFloat(timeRemaining));
        })
    }

    //Creates the HTML table based on the timerList
    function createTable() {
        var table = $('#raid-timer').empty();
        var html = '<tr><th>Time</th><th>Name</th><th>Type</th><th>Notes</th></tr>' + 
            '<tr id="start-row" data-id="0"><td class="time">0:00</td><td>Start of Fight</td><td></td><td></td><td></td></tr>';
        timers.all().forEach(function(timer) {
            html += `<tr data-id="${timer.id}" class="${timer.display.type}">
            <td class="time">${timer.display.time}</td>
            <td>${timer.display.name}</td>
            <td>${timer.display.type}</td>
            <td>${timer.display.description}</td>
            </tr>`;
        })
        table.append(html);
    }

    $(document).ready(function() {
        var fileInput = $('#start-with-file')
        fileInput.change(function() {
            var fileList = fileInput.prop('files');
            var file;
            var reader = new FileReader();
            if (fileList.length)
                file = fileList[0];
            else return false;
            var type = file.name.split('.')[1];
            reader.onload = function(evt) {
                if(type === 'json') {
                    if (!timers.loadFromJSON(evt.target.result)) {
                        alert('Failed to load');
                        return;
                    }
                } else if (type === 'csv') {
                    if (!timers.loadFromCSV(evt.target.result)) {
                        alert('Failed to load');
                        return;
                    }
                } else {
                    alert('Invalid file extension; json or csv only');
                    return;
                }
                createTable();
                reset();
            };
            reader.onerror = function() {
                timers.load([]);
                timerList = timers.all();
            };
            reader.readAsText(file);
        });
        $('#start-button').click(function() {
            start();
        });
        $('#end-button').click(function() {
            end();
        });
        $('#reset-button').click(function() {
            reset();
        })
    })
}());