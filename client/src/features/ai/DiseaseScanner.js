import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, AlertCircle, Loader, Trash2, CheckCircle } from 'lucide-react';

// Dynamically use Vercel environment variable with Render Node backend fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://agrismart-pro-3.onrender.com';

const DiseaseScanner = ({ activeUserEmail = 'guest', onScanSaved }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileChange = (file) => {
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file (jpg, png, webp)');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setScanResult(null);
            setError(null);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileChange(file);
    };

    const saveScanRecord = (result) => {
        const email = activeUserEmail || 'guest';
        const storageKey = `scans_${email}`;
        const record = {
            id: Date.now(),
            plant: 'Leaf Scan',
            diagnosis: result.disease || result.prediction || 'Unknown',
            confidence: result.confidence || '0%',
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
            setError("Please select a leaf image first");
            return;
        }

        setLoading(true);
        setScanResult(null);
        setError(null);

        const formData = new FormData();
        // File field name expected by Node & FastAPI multer/form-data middleware
        formData.append('file', selectedFile);

        try {
            // Target Node.js backend service route instead of localhost:8000
            const response = await axios.post(
                `${API_BASE_URL}/api/disease/predict`,
                formData,
                { 
                    headers: { 'Content-Type': 'multipart/form-data' }, 
                    timeout: 45000 // 45 sec timeout to allow for Render free-tier cold starts
                }
            );

            const result = response.data?.data || response.data;
            setScanResult(result);
            saveScanRecord(result);
        } catch (err) {
            const errorMsg = 
                err.response?.data?.message || 
                err.response?.data?.details || 
                err.message || 
                'Failed to analyze image. Please try again.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setScanResult(null);
        setError(null);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 rounded-lg">
                    <Camera size={24} className="text-red-700" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Disease Detection</h2>
                    <p className="text-sm text-gray-600">Upload a clear leaf image for AI analysis</p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded flex gap-3 mb-6">
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Upload Area */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all mb-6 ${
                    dragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-red-400'
                }`}
            >
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    className="hidden"
                    id="file-input"
                    disabled={loading}
                />
                <label htmlFor="file-input" className="cursor-pointer block">
                    <Camera size={48} className="mx-auto mb-3 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-700 mb-1">Drag and drop your leaf image here</p>
                    <p className="text-xs text-gray-500">or click to select (JPG, PNG, WebP • Max 5MB)</p>
                </label>
            </div>

            {/* Image Preview */}
            {previewUrl && (
                <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
                    <img
                        src={previewUrl}
                        alt="Leaf Preview"
                        className="w-full h-64 object-cover"
                    />
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={handleUpload}
                    disabled={loading || !selectedFile}
                    className="flex-1 px-6 py-3 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-800 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader size={20} className="animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Camera size={20} />
                            Scan Leaf
                        </>
                    )}
                </button>
                {selectedFile && (
                    <button
                        onClick={handleClear}
                        className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                    >
                        <Trash2 size={20} />
                        Clear
                    </button>
                )}
            </div>

            {/* Results */}
            {scanResult && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border border-red-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        {scanResult.disease === 'Healthy Leaf' || scanResult.disease === 'Healthy' ? (
                            <>
                                <CheckCircle size={20} className="text-green-600" />
                                Healthy Leaf
                            </>
                        ) : (
                            <>
                                <AlertCircle size={20} className="text-red-600" />
                                Disease Detected
                            </>
                        )}
                    </h3>

                    {/* Disease & Confidence */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="p-4 bg-white rounded border-l-4 border-red-500">
                            <p className="text-xs font-semibold text-gray-600 uppercase">Disease</p>
                            <p className="text-2xl font-bold text-red-700 mt-1">
                                {scanResult.disease || scanResult.prediction || 'N/A'}
                            </p>
                        </div>
                        <div className="p-4 bg-white rounded border-l-4 border-blue-500">
                            <p className="text-xs font-semibold text-gray-600 uppercase">Confidence</p>
                            <p className="text-2xl font-bold text-blue-700 mt-1">
                                {scanResult.confidence || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Symptoms */}
                    {scanResult.symptoms && (
                        <div className="p-4 bg-white rounded border-l-4 border-yellow-500 mb-4">
                            <p className="font-semibold text-gray-800 mb-2">🔍 Symptoms</p>
                            <p className="text-sm text-gray-700">{scanResult.symptoms}</p>
                        </div>
                    )}

                    {/* Causes */}
                    {scanResult.cause && (
                        <div className="p-4 bg-white rounded border-l-4 border-orange-500 mb-4">
                            <p className="font-semibold text-gray-800 mb-2">⚠️ Causes</p>
                            <p className="text-sm text-gray-700">{scanResult.cause}</p>
                        </div>
                    )}

                    {/* Treatment */}
                    {scanResult.treatment && (
                        <div className="p-4 bg-white rounded border-l-4 border-green-500 mb-4">
                            <p className="font-semibold text-gray-800 mb-2">🧪 Treatment</p>
                            <p className="text-sm text-gray-700">
                                {typeof scanResult.treatment === 'object' 
                                    ? scanResult.treatment.organic || JSON.stringify(scanResult.treatment)
                                    : scanResult.treatment}
                            </p>
                        </div>
                    )}

                    {/* Prevention */}
                    {scanResult.prevention && (
                        <div className="p-4 bg-white rounded border-l-4 border-blue-500">
                            <p className="font-semibold text-gray-800 mb-2">🛡️ Prevention Tips</p>
                            <p className="text-sm text-gray-700">{scanResult.prevention}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DiseaseScanner;