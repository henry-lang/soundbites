const form = document.getElementById("login-form")
const p = document.getElementById("invalid")

form.addEventListener("submit", login)

const login = async event => {
    event.preventDefault()

    p.style.display = "none"

    var username = document.getElementById("username").value
    var pwd = document.getElementById('pwd').value

    var result = await fetch("/login", {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({username, pwd})
    }).then((res) => res.json())

    if (result.status == "ok") {
        p.innerHTML = result.data
        p.style.display = "block"
    } else {
        p.innerHTML = result.error
        p.style.display = "block"
    }
}