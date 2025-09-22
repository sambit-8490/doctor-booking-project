// src/components/QrScanner.jsx

import React from 'react';
import { QrReader } from 'react-qr-reader';

const QrScanner = ({ onScanResult }) => {
    return (
        <div className="qr-scanner-container">
            <h3>Scan QR Code to View Patient Details</h3>
            <div className="card shadow-sm p-4 text-center">
                <QrReader
                    onResult={(result, error) => {
                        if (!!result) {
                            onScanResult(result?.text);
                        }
                        if (!!error) {
                            console.error(error);
                        }
                    }}
                    style={{ width: '100%' }}
                    constraints={{ facingMode: 'environment' }}
                />
                <p className="mt-3 text-muted">Point your camera at the patient's QR code.</p>
            </div>
        </div>
    );
};

export default QrScanner;