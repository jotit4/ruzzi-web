import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const WhatsAppButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { webConfig } = useApp();
    const whatsapp = webConfig?.contact?.whatsapp || '5493518178057';

    useEffect(() => {
        // Show after a small delay to not block initial view
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-[0_4px_12px_rgba(37,211,102,0.5)] hover:shadow-[0_6px_16px_rgba(37,211,102,0.6)] hover:scale-110 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
            aria-label="Contactar por WhatsApp"
        >
            <svg
                viewBox="0 0 24 24"
                width="32"
                height="32"
                fill="currentColor"
                className="fill-current"
            >
                <path d="M12.0117 2.01562C6.54117 2.01562 2.0625 6.46734 2.0625 11.9648C2.0625 13.9878 2.66859 15.8672 3.71484 17.4453L2.24609 21.9492L6.87891 20.6602C8.38922 21.5742 10.1503 22.0938 12.0117 22.0938H12.0156C17.4862 22.0938 21.9648 17.6381 21.9648 12.1445C21.9648 6.64711 17.4823 2.01562 12.0117 2.01562ZM12.0156 20.4062C10.3702 20.4062 8.79984 19.9547 7.42969 19.0969L7.10547 18.8906L4.35938 19.6547L5.13281 16.8984L4.81641 16.5234C3.86812 15.4078 3.32812 13.918 3.32812 12.3516C3.32812 7.73438 7.22109 3.97266 12.0195 3.97266C16.8141 3.97266 20.707 7.73438 20.707 12.3477C20.707 16.9648 16.8141 20.4062 12.0156 20.4062ZM16.9531 14.8672C16.6836 14.7305 15.3516 14.0547 15.1016 13.9648C14.8555 13.8711 14.6719 13.8281 14.4883 14.1016C14.3047 14.375 13.7852 14.9922 13.6211 15.1719C13.457 15.3555 13.293 15.375 13.0234 15.2383C12.7539 15.1016 11.8867 14.8086 10.8594 13.875C10.0547 13.1406 9.51172 12.2383 9.34766 11.9648C9.18359 11.6914 9.32812 11.5352 9.46484 11.3984C9.58594 11.2734 9.73438 11.0742 9.87891 10.9023C10.0234 10.7305 10.0703 10.6094 10.1719 10.4062C10.2734 10.2031 10.2227 10.0312 10.1523 9.89453C10.082 9.75781 9.53516 8.38672 9.30859 7.82812C9.07422 7.29297 8.84375 7.37109 8.67969 7.37109C8.52344 7.36719 8.35156 7.36719 8.16797 7.36719C7.98438 7.36719 7.6875 7.4375 7.4375 7.71094C7.1875 7.98438 6.47656 8.66797 6.47656 10.0625C6.47656 11.457 7.47266 12.8086 7.61719 13.0117C7.76172 13.2187 9.57812 16.1406 12.4414 17.3164C13.125 17.5977 13.6562 17.7656 14.0742 17.8945C14.8125 18.125 15.4805 18.0938 15.9961 18.0195C16.5742 17.9336 17.7734 17.2773 18.0195 16.5664C18.2695 15.8555 18.2695 15.2422 18.1875 15.1016C18.1055 14.9648 17.9219 14.9141 17.6523 14.7773L16.9531 14.8672Z" />
            </svg>
            {/* Pulse effect rings */}
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-20 animate-ping -z-10"></span>
        </a>
    );
};

export default WhatsAppButton;
