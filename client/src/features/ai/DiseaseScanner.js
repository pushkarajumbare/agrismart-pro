import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera } from 'lucide-react';

const DiseaseScanner = ({ activeUserEmail = 'guest', onScanSaved }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [scanResult, setScanResult] = useState(null);

    // Clean up image preview memory
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setScanResult(null);
        }
    };

    // Upload image to backend
    const saveScanRecord = (result) => {
        const email = activeUserEmail || 'guest';
        const storageKey = `scans_${email}`;
        const record = {
            id: Date.now(),
            plant: 'Uploaded Leaf',
            diagnosis: result.disease || 'Unknown Diagnosis',
            confidence: result.confidence || '0%',
            location: email === 'guest' ? 'Guest Repository' : 'Scanner Upload',
            status: result.offline ? 'AI Offline Fallback' : 'Analyzed',
            date: new Date().toLocaleDateString()
        };

        if (typeof onScanSaved === 'function') {
            onScanSaved(record);
            return;
        }

        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        localStorage.setItem(storageKey, JSON.stringify([record, ...existing]));
    };

    const handleUpload = async (e) => {
        if (e) e.preventDefault();

        if (!selectedFile) {
            alert("Please select a leaf image first.");
            return;
        }

        setLoading(true);
        setScanResult(null);

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            // Send image to Node.js backend
            const response = await axios.post(
                'http://localhost:5000/api/scan',
                formData
            );

            setScanResult(response.data);
            saveScanRecord(response.data);

        } catch (err) {
            console.error("Scanning interface error:", err);

            const fallbackResult = {
                disease: 'AI Offline Fallback',
                confidence: '0%',
                symptoms: 'The scanner could not reach the AI service, but your dashboard workflow can continue.',
                cause: 'Node or Python AI service may be offline.',
                treatment: 'Keep the image selected and retry after the service reconnects.',
                prevention: 'Saved expenses and profile history remain available while AI reconnects.'
            };
            setScanResult(fallbackResult);
            saveScanRecord(fallbackResult);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                padding: '20px',
                background: '#fff',
                borderRadius: '15px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
        >
            <h2
                style={{
                    color: '#1b4332',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}
            >
                <Camera />
                AI Disease Scanner
            </h2>

            <p
                style={{
                    fontSize: '14px',
                    color: '#666',
                    marginTop: 0
                }}
            >
                Upload a crop leaf image and let AgriSmart
                analyze disease symptoms.
            </p>

            {/* File Upload */}
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{
                    margin: '15px 0',
                    display: 'block'
                }}
            />

            {/* Image Preview */}
            {previewUrl && (
                <div style={{ marginBottom: '15px' }}>
                    <img
                        src={previewUrl}
                        alt="Leaf Preview"
                        style={{
                            width: '100%',
                            maxHeight: '220px',
                            objectFit: 'cover',
                            borderRadius: '10px'
                        }}
                    />
                </div>
            )}

            {/* Scan Button */}
            <button
                type="button"
                onClick={handleUpload}
                disabled={loading}
                style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: loading
                        ? '#ccc'
                        : '#2d6a4f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading
                        ? 'not-allowed'
                        : 'pointer',
                    fontWeight: 'bold'
                }}
            >
                {loading
                    ? "Analyzing Leaf..."
                    : "🚀 Scan Leaf"}
            </button>

            {/* Scan Results */}
            {scanResult && (
                <div
                    style={{
                        marginTop: '20px',
                        borderTop: '2px dashed #eee',
                        paddingTop: '15px'
                    }}
                >
                    {/* Diagnosis Header */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            background: '#f8f9fa',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '15px'
                        }}
                    >
                        <div>
                            <span
                                style={{
                                    fontSize: '11px',
                                    color: '#888',
                                    textTransform:
                                        'uppercase'
                                }}
                            >
                                Diagnosis
                            </span>

                            <h3
                                style={{
                                    margin: 0,
                                    color:
                                        scanResult.disease ===
                                        'Healthy'
                                            ? '#2d6a4f'
                                            : '#dc3545'
                                }}
                            >
                                {scanResult.disease}
                            </h3>
                        </div>

                        <div
                            style={{
                                textAlign: 'right'
                            }}
                        >
                            <span
                                style={{
                                    fontSize: '11px',
                                    color: '#888'
                                }}
                            >
                                Confidence
                            </span>

                            <div
                                style={{
                                    fontWeight:
                                        'bold',
                                    fontSize:
                                        '18px',
                                    color:
                                        '#2d6a4f'
                                }}
                            >
                                {
                                    scanResult.confidence
                                }
                            </div>
                        </div>
                    </div>

                    {/* Symptoms */}
                    <div
                        style={{
                            padding: '10px',
                            background:
                                '#fff5f5',
                            borderLeft:
                                '4px solid #dc3545',
                            borderRadius:
                                '6px',
                            marginBottom:
                                '10px'
                        }}
                    >
                        <strong>
                            🔍 Symptoms:
                        </strong>
                        <p
                            style={{
                                margin:
                                    '5px 0 0'
                            }}
                        >
                            {
                                scanResult.symptoms
                            }
                        </p>
                    </div>

                    {/* Cause */}
                    <div
                        style={{
                            padding: '10px',
                            background:
                                '#fff9db',
                            borderLeft:
                                '4px solid #f59f00',
                            borderRadius:
                                '6px',
                            marginBottom:
                                '10px'
                        }}
                    >
                        <strong>
                            ⚠️ Cause:
                        </strong>
                        <p
                            style={{
                                margin:
                                    '5px 0 0'
                            }}
                        >
                            {scanResult.cause}
                        </p>
                    </div>

                    {/* Treatment */}
                    <div
                        style={{
                            padding: '10px',
                            background:
                                '#ebfbee',
                            borderLeft:
                                '4px solid #40c057',
                            borderRadius:
                                '6px',
                            marginBottom:
                                '10px'
                        }}
                    >
                        <strong>
                            🧪 Treatment
                            Plan:
                        </strong>
                        <p
                            style={{
                                margin:
                                    '5px 0 0'
                            }}
                        >
                            {
                                scanResult.treatment
                            }
                        </p>
                    </div>

                    {/* Prevention */}
                    <div
                        style={{
                            padding: '10px',
                            background:
                                '#f3f0ff',
                            borderLeft:
                                '4px solid #7950f2',
                            borderRadius:
                                '6px'
                        }}
                    >
                        <strong>
                            🛡️ Prevention
                            Tips:
                        </strong>
                        <p
                            style={{
                                margin:
                                    '5px 0 0'
                            }}
                        >
                            {
                                scanResult.prevention
                            }
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiseaseScanner;
