import React from 'react';
import { Loader2 } from 'lucide-react';

const ReaderSkeleton = () => {
    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center">
                <div className="w-20 h-20 bg-[#99334C]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Loader2 className="w-10 h-10 text-[#99334C] animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Chargement du cours</h2>
                <p className="text-gray-500">Préparation de votre lecture...</p>
            </div>
        </div>
    );
};

export default ReaderSkeleton;
