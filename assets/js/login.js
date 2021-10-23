const form = document.getElementById('login-form')
const p = document.getElementById('invalid')

form.addEventListener('submit', login)

async function login(event) {
    event.preventDefault()

    p.style.display = 'none'

    var username = document.getElementById('username').value
    var pwd = document.getElementById('pwd').value

    var result = await fetch('login/', {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({username, pwd}),
    }).then((res) => res.json())

    if (result.status == 'ok') {
        p.innerHTML = 'Logged in successfully.'
        p.style.display = 'block'
        window.location.href = '/'
    } else {
        p.innerHTML = result.error
        p.style.display = 'block'
    }
}
