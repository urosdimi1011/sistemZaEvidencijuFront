import { lazy, Suspense } from 'react';
import { Spinner } from "@fluentui/react-components";
import Modal from "../../modal/Modal";

// Lazy load forms for better performance
const AddUserForm = lazy(() => import('../../forms/AddUserForm'));
const DeleteModalContent = lazy(() => import('../../modal/DeleteModalContent'));

export default function UserModal({ isOpen, config, onClose, onSuccess,schools }) {
    const renderContent = () => {
        switch(config.viewType) {
            case 'add':
                return <AddUserForm schools={schools} onSuccess={(data) => onSuccess('add', data)} />;
            case 'edit':
                return <AddUserForm schools={schools} user={config.user} onSuccess={(data) => onSuccess('edit', data)} />;
            case 'delete':
                return <DeleteModalContent
                    type='users'
                    data={config.user}
                    itemType={`${config.user.email}`}
                    onSuccess={() => onSuccess('delete', config.user)}
                />;
            default:
                return null;
        }
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={config.title}>
            <Suspense fallback={<Spinner />}>
                {renderContent()}
            </Suspense>
        </Modal>
    );
}