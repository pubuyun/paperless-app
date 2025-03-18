import { Modal, ModalDialog } from "@mui/joy";
import React from "react";

interface WebViewDialogProps {
    open: boolean;
    onClose: () => void;
    url: string;
}

function WebViewDialog(props: WebViewDialogProps) {
    const { open, onClose, url } = props;

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog
                aria-labelledby="web-view-dialog"
                sx={{
                    width: '95vw',
                    height: '90vh',
                    maxWidth: 'none',
                    maxHeight: 'none',
                    p: 0,
                }}
            >
                <iframe
                    src={url}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                    }}
                    title="Web Content"
                />
            </ModalDialog>
        </Modal>
    );
}

export default WebViewDialog;
