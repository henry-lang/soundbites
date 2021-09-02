const form = document.getElementById('login-form')
const p = document.getElementById('invalid')

form.addEventListener('submit', comment)

async function comment(event) {
    event.preventDefault()

    p.style.display = 'none'

    var content = document.getElementById('content').value

    var path = window.location.href
    path = "/posts" + "/" + path.split("/")[4] + "/comment"
    console.log(path)

    var result = await fetch(path, {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({content}),
    }).then((res) => res.json())

    if (result.status == 'ok') {
        p.innerHTML = 'success'
        p.style.display = 'block'
    } else {
        p.innerHTML = result.error
        p.style.display = 'block'
    }
}
