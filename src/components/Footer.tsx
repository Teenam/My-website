import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer>
            <div className="footer-content">
                <div className="socials">
                    <a href="#"><i className="fab fa-instagram"></i></a>
                    <a href="#"><i className="fab fa-twitter"></i></a>
                    <a href="#"><i className="far fa-envelope"></i></a>
                </div>
                <p>&copy; 2025 Liquid Glass. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
