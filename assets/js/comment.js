const form = document.getElementById('login-form')
const p = document.getElementById('invalid')


form.addEventListener('submit', comment)

async function comment(event) {
    event.preventDefault()

    p.style.display = 'none'

    var content = document.getElementById('content').value

    var result = await fetch(window.location.href + '/comment', {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({content}),
    }).then((res) => res.json())

    if (result.status == 'ok') {
        window.location.reload()
    } else {
        p.innerHTML = result.error
        p.style.display = 'block'
    }
}

async function deleteComment(element) {
    var postID = window.location.href.split("/")[4]
    console.log(element.id)
    console.log(postID)
    let result = await fetch(window.location.href + '/comment/delete', {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({
            commentID: element.id,
            postID: postID
        }),
    }).then((res) => res.json())

    if (result.status == "ok") {
        window.location.reload()
    }
}
