import { lazy, Suspense } from 'react';
import {Spinner} from "@fluentui/react-components";
import Modal from "../../modal/Modal";

// Lazy load forms for better performance
const AddStudentsForm = lazy(() => import('../../forms/AddStudentsForm'));
const StudentDetails = lazy(() => import('../../table/StudentDetails'));
const DeleteModalContent = lazy(() => import('../../modal/DeleteModalContent'));

export default function StudentsModal({ isOpen, config, onClose, onSuccess }) {
    const renderContent = () => {
        switch(config.viewType) {
            case 'add':
                return <AddStudentsForm onSuccess={(data) => onSuccess('add', data)} />;
            case 'details':
                return <StudentDetails
                    student={config.student}
                    onSuccess={onClose}
                />;
            case 'edit':
                return <AddStudentsForm
                    student={config.student}
                    onSuccess={(data) => onSuccess('edit', data)}
                />;
            case 'delete':
                return <DeleteModalContent
                    data={config.student}
                    itemType="Studenta"
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