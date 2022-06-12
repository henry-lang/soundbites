import {Link} from 'solid-app-router'

export default function Navbar() {
    return (
        <nav>
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
        </nav>
    )
}
