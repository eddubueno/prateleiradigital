'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Menu() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };
    
    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <nav className="fixed w-full bg-white h-[50px]">
            {/* Hamburger Button */}
            <button
                className="text-2xl p-2 focus:outline-none"
                onClick={toggleMenu}
            >
                ☰
            </button>

            {/* Menu */}
            <ul
                className={`absolute top-12 left-0 bg-white border rounded-md shadow-md w-48 transition-transform transform ${
                    isOpen ? 'scale-100' : 'scale-0'
                }`}
            >
                <li className="border-b">
                    <Link
                        href="/"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={closeMenu}
                    >
                        Home
                    </Link>
                </li>
                <li className="border-b">
                    <Link
                        href="/pages/categorias"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={closeMenu}
                    >
                        Categorias
                    </Link>
                </li>
                <li className="border-b">
                    <Link
                        href="/pages/perfil"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={closeMenu}
                    >
                        Perfil
                    </Link>
                </li>
                <li>
                    <Link
                        href="/pages/carrinho"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={closeMenu}
                    >
                        Carrinho
                    </Link>
                </li>
            </ul>
            

            <h1 className="w-fit m-auto relative -top-9">Prateleira Digital</h1>
        </nav>
    );
}