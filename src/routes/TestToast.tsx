import {Button, useToastController, Toast, ToastTitle, ToastBody, Toaster, useId} from "@fluentui/react-components";
export default function TestToaster() {
    const toasterId = useId();
    const { dispatchToast } = useToastController(toasterId);

    const showToast = () => {
        dispatchToast(
            <Toast>
                <ToastTitle>Test</ToastTitle>
                <ToastBody>Ovo je test toast poruka</ToastBody>
            </Toast>,
            { intent: 'success' }
        );
    };
    return (
        <div style={{ padding: '20px' }}>
            <Toaster toasterId={toasterId}/>
            <Button appearance="primary" onClick={showToast}>
                Prikazi test toast
            </Button>
        </div>
    );
}