const form = document.getElementById('settings')
const p = document.getElementById('invalid')

form.addEventListener('submit', register)

async function register(event) {
    p.style.display = 'none'

    event.preventDefault()
    var username = document.getElementById('username').value
    var pwd = document.getElementById('pwd').value
    var displayName = document.getElementById('display').value
    var checkbox = document.getElementById("checkbox").checked

    result = await fetch('settings/', {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({username, pwd, displayName, checkbox}),
    }).then((res) => res.json())

    if (result.status == 'ok') {
        if (result.modified) {p.innerHTML = 'settings changed successfully.'}
        else {p.innerHTML = "no settings were changed"}
        p.style.color = 'var(--dark-color)'
        p.style.display = 'block'
    } else {
        p.innerHTML = result.error
        p.style.display = 'block'
    }
}
