import { ReactNode, useEffect } from 'react';
import * as ReactDOM from 'react-dom';
import './Modal.css';
import {FluentProvider, Toaster, useId, webLightTheme} from '@fluentui/react-components';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

export default function Modal({isOpen, onClose, title, children}: ModalProps){
    useEffect(() => {
        console.log("Usli u promenui isOpne",isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }, [isOpen]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) =>
            e.key === 'Escape' && onClose();
        if (isOpen) window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
       <>
           <FluentProvider theme={webLightTheme}>
               <div className="modal-overlay" onClick={onClose}>
                   <div className="modal-content" onClick={e => e.stopPropagation()}>
                       <header className="modal-header">
                           <h2>{title}</h2>
                           <button className="modal-close" onClick={onClose}>×</button>
                       </header>
                       <div className="modal-body">
                           {children}
                       </div>
                   </div>
               </div>
           </FluentProvider>
       </>
        , document.getElementById('modal-root')!
    );
}