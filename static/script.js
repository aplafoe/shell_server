document.addEventListener('DOMContentLoaded', function() {
    let textField = document.getElementById('textField');
    let cpuButton = document.getElementById('cpuButton');
    let ramButton = document.getElementById('ramButton');
    let diskButton = document.getElementById('diskButton');
    let netButton = document.getElementById('netButton');
    let timeButton = document.getElementById('timeButton');
    let restartButton = document.getElementById('restartButton');
    let updateButton = document.getElementById('updateButton');
    let journalButton = document.getElementById('journalButton');
    let shellButton = document.getElementById('shellButton');
    let cpuPoll;
    let ramPoll;
    let diskPoll;
    let netPoll;
    let journalPoll;
    const defaultColor = cpuButton.style.backgroundColor

    function stopPolling() {
        clearInterval(ramPoll)
        clearInterval(cpuPoll)
        clearInterval(diskPoll)
        clearInterval(netPoll)
        clearInterval(journalPoll)
    }

    async function fetchUsage(type) {
        const urls = {
            cpu: 'http://127.0.0.1:8080/cpu_usage',
            ram: 'http://127.0.0.1:8080/ram_usage',
            disk: 'http://127.0.0.1:8080/disk_usage',
            net: 'http://127.0.0.1:8080/net_info'
        };

        const url = urls[type];

        fetch(url)
        .then(response => response.json())
        .then(data => {
            textField.value = '';
            switch (type) {
                case 'cpu':
                    textField.value = 'CPU usage : ' + data.cpu_usage + ' % ';
                    break;
                case 'ram':
                    textField.value = 'RAM usage : ' + 100 * data.used_memory / data.total_memory + ' % ';
                    break;
                case 'disk':
                    data.forEach(element => {
                        textField.value += "Disk : " + element.name + ", fs : " + element.filesystem + ", usage : " + (100 - 100 * element.available_space / element.total_space) + '\n';
                    });
                    break;
                case 'net':
                    data.forEach(element => {
                        textField.value += "Device : " + element.name + ", MAC address : " + element.mac_address + ", bytes received : " + element.bytes_received + ", bytes transmitted : " + element.bytes_transmitted + '\n';
                    });
                    break;
            }
        })
        .catch(error => {
            textField.value = error.message;
        });
    }

    async function fetchPostRequest(body) {
        return fetch('http://127.0.0.1:8080/shell_command', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then(response => {
            if (!response.ok) {
                throw new Error('Server Error: ' + response.status);
            }
            return response.json();
        }).catch(error => {
            textField.value = error.message
        })
    }

    async function fetchJournalLogs() {
        var requestBody = {
            target: 'sh',
            command_name: 'journalctl',
            args: []
        };
        let response = await fetchPostRequest(requestBody);
        if (response !== undefined) {
            shellButton.style.backgroundColor = '#67E55C'
            setTimeout(() => {
                journalButton.style.backgroundColor = defaultColor;
            }, 2000);
            textField.value += '\n' + response.output;
        } else {
            journalButton.style.backgroundColor = '#EC3F3F'
            setTimeout(() => {
                journalButton.style.backgroundColor = defaultColor;
            }, 2000);
        }
    }

    cpuButton.addEventListener('click', async function() {
        stopPolling();
        cpuPoll = setInterval(() => fetchUsage('cpu'), 1000);
        fetchUsage('cpu');
    });

    ramButton.addEventListener('click', async function() {
        stopPolling();
        cpuPoll = setInterval(() => fetchUsage('ram'), 1000);
        fetchUsage('ram');
    })

    diskButton.addEventListener('click', async function() {
        stopPolling();
        cpuPoll = setInterval(() => fetchUsage('disk'), 1000);
        fetchUsage('disk');
    })

    netButton.addEventListener('click', async function() {
        stopPolling();
        cpuPoll = setInterval(() => fetchUsage('net'), 1000);
        fetchUsage('net');
    })
    
    journalButton.addEventListener('click', async function() {
        stopPolling()
        journalPoll = setInterval(fetchJournalLogs, 4000);
        fetchJournalLogs();
    })

    timeButton.addEventListener('click', function() {
        window.location.href = 'http://127.0.0.1:8080/set_time';
    });

    restartButton.addEventListener('click', async function() {
        stopPolling();
        var requestBody = {
            target: 'sh',
            command_name: 'reboot',
            args: []
        };
        fetchPostRequest(requestBody);
    });

    updateButton.addEventListener('click', async function() {
        stopPolling()
        var requestBody = {
            target: 'sh',
            command_name: 'apt-get update && apt-get upgrade',
            args: []
        };
        let response = await fetchPostRequest(requestBody);
        if (response !== undefined) {
            shellButton.style.backgroundColor = '#67E55C'
            setTimeout(() => {
                updateButton.style.backgroundColor = defaultColor;
            }, 2000);
            textField.value += '\n' + response.output;
        } else {
            updateButton.style.backgroundColor = '#EC3F3F'
            setTimeout(() => {
                updateButton.style.backgroundColor = defaultColor;
            }, 2000);
        }
    });

    shellButton.addEventListener('click', async function() {
        stopPolling()
        var lines = textField.value.trim().split('\n');
        var query = lines[lines.length - 1];

        if (query.trim() !== '') {
            var commandParts = query.split(' ');
            var commandName = commandParts.shift();
            var argsList = commandParts;

            var requestBody = {
                target: 'sh',
                command_name: commandName,
                args: argsList
            };

            let response = await fetchPostRequest(requestBody);
            if (response !== undefined) {
                shellButton.style.backgroundColor = '#67E55C'
                setTimeout(() => {
                    shellButton.style.backgroundColor = defaultColor;
                }, 2000);
                textField.value += '\n' + response.output;
            } else {
                shellButton.style.backgroundColor = '#EC3F3F'
                setTimeout(() => {
                    shellButton.style.backgroundColor = defaultColor;
                }, 2000);
            }
        } else {
            shellButton.style.backgroundColor = '#EC3F3F'
            setTimeout(() => {
                shellButton.style.backgroundColor = defaultColor;
            }, 2000);
        }
    })
});