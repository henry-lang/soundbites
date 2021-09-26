const toggleTheme = (theme) => {
    if (theme == null) {
        state = state == 'light' ? 'dark' : 'light'
    } else state = theme

    document.documentElement.setAttribute('theme', state)
    localStorage.setItem('theme', state)
}

let state = localStorage.getItem('theme') || 'light'
toggleTheme(state)
