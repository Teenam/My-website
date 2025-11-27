import React from 'react';

interface Social {
    icon: string;
    link: string;
}

interface FooterProps {
    socials: Social[];
    version: string;
}

const Footer: React.FC<FooterProps> = ({ socials, version }) => {
    return (
        <footer>
            <div className="footer-content">
                <div className="socials">
                    {socials.map((social, index) => (
                        <a key={index} href={social.link}><i className={social.icon}></i></a>
                    ))}
                </div>
                <p>&copy; 2025 Teenam. All Rights <span style={{ opacity: 0.5, marginLeft: '10px' }}>{version}</span></p>
            </div>
        </footer>
    );
};

export default Footer;
