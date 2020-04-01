//requires timers.js
//requires JQuery
(function() {

    function setForm(values) {
        var form = $('#submit-timer');
        if (!values) {
            values = {
                type:'Other',
                display:{time:''}
            };
        }
        form.find('input[name="id"]').val(values.id);
        form.find('input[name="time"]').val(values.display.time);
        form.find('input[name="name"]').val(values.name);
        form.find('select[name="type"]').val(values.type);
        form.find('input[name="description"]').val(values.description);
    }

    function switchToAdd() {
        $('.edit-element').addClass('add').removeClass('edit');
        setForm();
    }

    function switchToEdit(values) {
        $('.edit-element').addClass('edit').removeClass('add');
        setForm(values);
    }

    function createTable(timerList) {
        var table = $('#raid-timer').empty();
        var html = '<tr><th>Time</th><th>Name</th><th>Type</th><th>Notes</th><th>Modify</th></tr>' + 
            '<tr><td>0:00</td><td>Start of Fight</td><td></td><td></td><td></td></tr>';
        timerList.forEach(function(timer) {
            html += `<tr class="${timer.display.type}"><td>${timer.display.time}</td>
            <td>${timer.display.name}</td>
            <td>${timer.display.type}</td>
            <td>${timer.display.description}</td>
            <td><a data-id="${timer.id}" class="edit-link" href="#">Edit</a>&nbsp;
            <a data-id="${timer.id}" class="delete-link" href="#">Delete</a></tr>`;
        })
        table.append(html);
        $('a.edit-link').click(function() {
            switchToEdit(timers.get(parseInt($(this).data('id'))));
        });
        $('a.delete-link').click(function() {
            timers.delete(parseInt($(this).data('id')));
            createTable(timers.all());
            switchToAdd();
        });
    }
    function switchToEditor() {
        $('.file-selector').addClass('inactive').removeClass('active');
        $('.editor').addClass('active').removeClass('inactive');
        setForm(null);
    }

    function downloadJSON(filename, values) {
        var json = JSON.stringify(values);
        var tempElement = document.createElement('a');
        
        tempElement.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(json));
        tempElement.setAttribute('download', filename);
        tempElement.style.display = 'none';
        document.body.appendChild(tempElement);
        tempElement.click();
        document.body.removeChild(tempElement);
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
                createTable(timers.all());
                switchToEditor();
            };
            reader.onerror = function() {
                timers.load([]);
            };
            reader.readAsText(file);
        });
        $('#start-without-file').click(function() {
            timers.load([]);
            createTable(timers.all());
            switchToEditor();
        });
        $('#submit-timer').submit(function(evt) {
            var inputs = $(this).serializeArray();
            var values = {}
            inputs.forEach(function (value) {
                values[value.name] = value.value;
            })
            if (values.id === '' || !values.id) {
                timers.add(values);
                createTable(timers.all());
            } else {
                timers.edit(parseInt(values.id), values);
                createTable(timers.all());
            }
            switchToAdd();
            evt.preventDefault();
            return false;
        });
        $('#cancel-edit').click(function() {
            switchToAdd();
            return false;
        });
        $('#save-timers').click(function() {
            console.log('click');
            downloadJSON('timers.json', {timers:timers.all()});
        });
    })
}());