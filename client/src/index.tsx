import {render} from 'solid-js/web'
import {lazy} from 'solid-js'
import {Route, Router, Routes, Link} from 'solid-app-router'

import Navbar from './Navbar'
import './index.css'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))

render(
    () => (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
            </Routes>
            <h1>Footer</h1>
        </Router>
    ),
    document.getElementById('root') as HTMLElement
)
