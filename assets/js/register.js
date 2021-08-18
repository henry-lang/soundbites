const form = document.getElementById("reg")
const p = document.getElementById("invalid")

form.addEventListener("submit", register)

async function register(event) {
    p.style.display = "none"
    event.preventDefault()
    var username = document.getElementById("username").value
    var pwd = document.getElementById('pwd').value
    var displayName = document.getElementById("display").value

    result = await fetch("register/", {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({username, pwd, displayName})
    }).then((res) => res.json())

    if (result.status == "ok") {
        p.innerHTML = "successfully made your account."
        p.style.color = "var(--dark-color)"
        p.style.display = "block"
    } else {
        p.innerHTML = result.error
        p.style.display = "block"
    }
}