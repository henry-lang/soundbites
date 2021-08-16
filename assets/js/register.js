const form = document.getElementById("register-form")

form.addEventListener("submit", register)

const register = async event => {
    event.preventDefault()
    var username = document.getElementById("username").value
    var pwd = document.getElementById('pwd').value

    await fetch("/register", {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({username, pwd})
    })
}