const form = document.getElementById('settings')
const p = document.getElementById('invalid')

form.addEventListener('submit', register)

async function register(event) {
    p.style.display = 'none'

    event.preventDefault()
    var formData = new FormData()
    var strData = {
        username: document.getElementById('username').value,
        displayName: document.getElementById('display').value,
        checkbox: document.getElementById("checkbox").checked,
        bio: document.getElementById("content").value

    }
    formData.append("strData", JSON.stringify(strData))
    formData.append('avatar', document.getElementById("file-upload").files[0])

    console.log(formData)

    result = await fetch('settings/', {
        method: 'POST',
        body: formData
    }).then((res) => res.json())

    if (result.status == 'ok') {
        if (result.modified) {
            p.innerHTML = 'settings changed successfully.'
            p.style.color = 'var(--dark-color)'
        } else {
            p.innerHTML = "no settings were changed"
            p.style.color = 'var(--accent-color)'
        }
        p.style.display = 'block'
    } else {
        p.innerHTML = result.error
        p.style.display = 'block'
    }
}
