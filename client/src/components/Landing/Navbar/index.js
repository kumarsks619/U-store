import React, { useState, useEffect } from 'react'
import { HashLink } from 'react-router-hash-link'

import { WEBSITE_URL } from '../../../constants/urls'
import Logo from '../../utils/Logo'
import './Navbar.css'

const Navbar = ({ setIsOpen }) => {
    const [backgroundClass, setBackgroundClass] = useState('navbar')

    useEffect(() => {
        const listenerFunc = () => {
            if (window.scrollY > 200) {
                setBackgroundClass('navbar filled')
            } else {
                setBackgroundClass('navbar')
            }
        }
        document.addEventListener('scroll', listenerFunc)
        return () => {
            document.removeEventListener('scroll', listenerFunc)
        }
    }, [])

    return (
        <div className={backgroundClass}>
            <div className="navbar__container">
                <a
                    href={WEBSITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="navbar__logoWrapper"
                    title="Ustore"
                >
                    <Logo />
                </a>
                <div className="navbar__linksWrapper">
                    <HashLink to="#homeID">Home</HashLink>
                    <HashLink to="#overviewID">Overview</HashLink>
                    <HashLink to="#featuresID">Features</HashLink>
                    <HashLink to="#contactID">Contact</HashLink>
                    <button onClick={() => setIsOpen(true)}>Sign Up</button>
                </div>
            </div>
        </div>
    )
}

export default Navbar
