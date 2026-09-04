'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, QrCode, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const MAIN_SESSION_DURATION = 10 * 60 * 1000; // 10 minutes

export default function LiveSessionPage() {
  const { courseName } = useParams();
  const router = useRouter();

  const [sessionActive, setSessionActive] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [mainSessionExpiresAt, setMainSessionExpiresAt] = useState<number | null>(null);
  const [qrExpired, setQrExpired] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrLifespan, setQrLifespan] = useState(7);

  const generateNewQrCode = useCallback(() => {
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const newQrData = `https://attend.app/session/${sessionId}?course=${encodeURIComponent(courseName as string)}`;
    setQrData(newQrData);
    setCountdown(qrLifespan);
    setQrExpired(false);
  }, [qrLifespan, courseName]);

  const handleStartSession = () => {
    setMainSessionExpiresAt(Date.now() + MAIN_SESSION_DURATION);
    generateNewQrCode();
    setSessionActive(true);
  };

  useEffect(() => {
    if (!sessionActive) return;

    const timer = setInterval(() => {
      if (mainSessionExpiresAt && Date.now() > mainSessionExpiresAt) {
        setSessionActive(false);
        setQrData(null);
        setMainSessionExpiresAt(null);
        return;
      }

      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          setQrExpired(true);
          setQrData(null);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionActive, mainSessionExpiresAt]);

  const progressPercentage = (countdown / qrLifespan) * 100;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} /> Go Back to Dashboard
        </button>

        <div className="bg-white shadow-lg rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-2">
            Live Attendance Session: {decodeURIComponent(courseName as string)}
          </h1>
          <p className="text-gray-600 mb-8">
            A secure QR code is generated for students to scan.
          </p>

          {!sessionActive ? (
            <div className="text-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto text-lg transition-colors"
              >
                <QrCode /> Generate QR Code
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              {qrData ? (
                <>
                  <div className="p-4 bg-white rounded-lg shadow-inner">
                    <QRCodeCanvas value={qrData} size={256} />
                  </div>

                  <div className="w-full max-w-sm mt-6 text-center">
                    <p className="text-gray-600 font-semibold">
                      QR code expires in{' '}
                      <span className="text-blue-600 text-xl">{countdown}</span> seconds
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <button
                      onClick={generateNewQrCode}
                      className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Generate New QR
                    </button>
                  </div>
                </>
              ) : qrExpired ? (
                <p className="mt-6 text-red-600 font-bold text-lg">
                  This QR has expired. Please generate again.
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Modal for QR Lifespan */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4">QR Lifespan</h2>
            <input
              type="number"
              min="1"
              value={qrLifespan}
              onChange={(e) => setQrLifespan(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 mb-2"
            />
            <p className="text-sm text-gray-600 mb-4">
              Recommended <span className="font-medium">7 secs</span> for offline and{' '}
              <span className="font-medium">30 secs</span> for online classes.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  handleStartSession();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
