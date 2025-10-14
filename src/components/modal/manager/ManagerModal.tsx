import { lazy, Suspense } from 'react';
import {Spinner} from "@fluentui/react-components";
import Modal from "../../modal/Modal";
import DetailsOfManager from './DetailsOfManager';

// Lazy load forms for better performance
const AddMenadzerForm = lazy(() => import('../../forms/AddMenadzerForm'));
const DeleteModalContent = lazy(() => import('../../modal/DeleteModalContent'));

export default function ManagerModal({ isOpen, config, onClose, onSuccess }) {
    const renderContent = () => {
        switch(config.viewType) {
            case 'details':
                return <DetailsOfManager id={config.menadzer.id} />;
            case 'add':
                return <AddMenadzerForm onSuccess={(data) => onSuccess('add', data)} />;
            case 'edit':
                return <AddMenadzerForm menadzer={config.menadzer} onSuccess={(data) => onSuccess('edit', data)} />;
            case 'delete':
                return <DeleteModalContent
                    data={config.menadzer}
                    type='menadzeri'
                    itemType="Menadzera"
                    onSuccess={(data) => onSuccess('delete', data)}
                />;
            default:
                return null;
        }
    };

    return (
        <Modal isOpen={isOpen} title={config.title} onClose={onClose}>
            <Suspense fallback={<Spinner className="mt-10" />}>
                {renderContent()}
            </Suspense>
        </Modal>
    );
}