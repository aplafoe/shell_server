document.addEventListener('DOMContentLoaded', function() {
    let okButton = document.getElementById('okButton');
    let dtInput = document.getElementById('dateTimeInput');
    const defaultColor = okButton.style.backgroundColor;

    okButton.addEventListener('click', async function() {
        let date = new Date(dtInput.value)
        var requestBody = {
            target: 'sh',
            command_name: 'date',
            args: ['--set=' + '\"' + date.toISOString() + '\"']
        };
        fetch('http://127.0.0.1:8080/shell_command', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        }).then(response => {
            if (!response.ok) {
                throw new Error('Server Error: ' + response.status);
            }
        }).then(data => {
            okButton.style.backgroundColor = '#67E55C'
            setTimeout(() => {
                okButton.style.backgroundColor = defaultColor;
            }, 2000);
        }).catch(error => {
            okButton.style.backgroundColor = '#EC3F3F'
            setTimeout(() => {
                okButton.style.backgroundColor = defaultColor;
            }, 2000);
        })
    })
});