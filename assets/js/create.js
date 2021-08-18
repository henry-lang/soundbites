const simplemde = new SimpleMDE({element: document.getElementById("text")})

const form = document.getElementById("form")
const text = document.getElementById("text")
const title = document.getElementById("title-field")
const description = document.getElementById("description-field")
const p = document.getElementById("invalid")

form.addEventListener("submit", async (event) => {
    event.preventDefault()

    var result = await fetch("create", {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({
            title: title.value,
            description: description.value,
            markdown: text.value
        })
    }).then((res) => res.json())
    if (result.status == "OK") {
        p.innerHTML = "article submitted!"
        p.style.display = "block"
    } else {
        p.innerHTML = result.error;
        p.style.display = "block"
    }
})