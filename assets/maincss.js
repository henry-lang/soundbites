var nav = `
<nav>
    <ul>
        <li><a class="tabs" href="/">home</a></li>
        <li><a class="tabs" href="/posts">posts</a></li>
    </ul>
</nav>
<br>`;

var style = `
@import url('https://fonts.googleapis.com/css2?family=Georama&display=swap');

html {
    /* background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
    background-size: 400% 400%;
    animation: fadeIn 1.5s; */

    background-color: whitesmoke;
}

body {
    -webkit-animation: fadein 1s; /* Safari, Chrome and Opera > 12.1 */
    -moz-animation: fadein 1s; /* Firefox < 16 */
    -ms-animation: fadein 1s; /* Internet Explorer */
    -o-animation: fadein 1s; /* Opera < 12.1 */
    animation: fadein 1s;
}

@keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* Firefox < 16 */
@-moz-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* Safari, Chrome and Opera > 12.1 */
@-webkit-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* Internet Explorer */
@-ms-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* Opera < 12.1 */
@-o-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}

nav {
    text-align: center;
    width: 100%;
    background-color: rgb(53, 53, 53);
}

ul {
    z-index: 1;
    position: fixed;
    top: 0;
}

li {
    z-index: 1;
    float: left;
    display: inline;
    border-right: 1.5px solid whitesmoke;
    transition: 0.25s;
}

li:hover {
    transform: scale(1.1)
}

li:last-child {
    border-right:none;
    border-left: 1.5px solid whitesmoke;
}

li a {
    color: rgb(201, 44, 32);
    transition: .25s;
    text-decoration: none;
    font-family: "Georama";
    font-weight: 200;
    z-index: 1;
    display: block;
    padding: 9px;
    background-color: rgb(36, 36, 36);
}`;

var currentBody = document.body.innerHTML;
document.body.innerHTML = `${nav}\n${currentBody}`;
var styleElement = document.createElement("style");
styleElement.innerHTML = style;
document.head.appendChild(styleElement);
console.log(document.getElementsByTagName("html")[0].innerHTML);