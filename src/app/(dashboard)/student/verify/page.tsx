'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ScanLine, CheckCircle2, XCircle, Keyboard, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { sessionsAPI } from '@/lib/api';

type ScanState = 'idle' | 'scanning' | 'verifying' | 'success' | 'error';

/**
 * Student QR verification page.
 *
 * Students scan the QR code displayed by the teacher's live session.
 * The QR encodes a URL of the form:
 *   <origin>/student/verify?session=<sessionId>&course=<courseName>
 * A raw session id is also accepted. Scanning marks the logged-in
 * student present for the session's class (server-side validation).
 * A manual entry fallback is provided for devices without a camera.
 */
export default function StudentVerificationPage() {
  const router = useRouter();
  const { logout, user, isReady } = useAuth();

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [resultDetail, setResultDetail] = useState<{ course?: string; session?: string } | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);

  const verifyingRef = useRef(false);
  // Keep the latest scan handler without re-triggering the scanner effect
  const scanHandlerRef = useRef<(text: string) => void>(() => {});

  /** Extract a session id from a scanned string (URL or raw id) */
  const extractSessionId = (decodedText: string): string | null => {
    try {
      const trimmed = decodedText.trim();
      // Direct session id
      if (/^[a-f\d]{24}$/i.test(trimmed)) return trimmed;
      // URL containing ?session=<id>
      const url = new URL(trimmed);
      const session = url.searchParams.get('session');
      if (session) return session;
      // URL path like /student/verify/<id>
      const match = trimmed.match(/verify\/([a-f\d]{24})/i);
      if (match) return match[1];
      return null;
    } catch {
      return null;
    }
  };

  const verifySession = useCallback(
    async (sessionId: string) => {
      if (verifyingRef.current) return;
      verifyingRef.current = true;
      setScanState('verifying');
      setStatusMessage('Marking your attendance...');

      try {
        const result = await sessionsAPI.checkIn(sessionId, user!.id);
        if (result.success) {
          setScanState('success');
          setStatusMessage(
            result.alreadyMarked
              ? 'Your attendance was already marked for this session.'
              : 'Attendance marked successfully!'
          );
          setResultDetail({ session: sessionId });
        }
      } catch (err) {
        setScanState('error');
        setStatusMessage(
          err instanceof Error ? err.message : 'Verification failed. Please try again.'
        );
        setResultDetail({ session: sessionId });
      } finally {
        verifyingRef.current = false;
      }
    },
    [user]
  );

  const handleScan = useCallback(
    (decodedText: string) => {
      if (scanState === 'verifying' || scanState === 'success') return;

      const sessionId = extractSessionId(decodedText);
      if (!sessionId) {
        setScanState('error');
        setStatusMessage('This QR code is not a valid attendance code.');
        setResultDetail(null);
        return;
      }
      verifySession(sessionId);
    },
    [scanState, verifySession]
  );

  // Sync the latest scan handler for the scanner callback
  useEffect(() => {
    scanHandlerRef.current = handleScan;
  }, [handleScan]);

  // Redirect to login when not authenticated
  useEffect(() => {
    if (isReady && !user) {
      router.push('/login');
    }
  }, [isReady, user, router]);

  // Load the camera scanner library and start scanning
  useEffect(() => {
    if (!user || scanState === 'success') return;

    let cancelled = false;
    let cleanupScanner: (() => void) | null = null;

    Promise.resolve()
      .then(() => {
        // Camera support check (browser only)
        if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
          setCameraSupported(false);
          setShowManualEntry(true);
          return;
        }
        return import('html5-qrcode').then(({ Html5Qrcode }) => {
          if (cancelled) return;
          const scanner = new Html5Qrcode('qr-reader-region', { verbose: false });

          scanner
            .start(
              { facingMode: 'environment' },
              { fps: 10, qrbox: { width: 250, height: 250 } },
              (decodedText: string) => scanHandlerRef.current(decodedText),
              () => {
                // per-frame decode failures are expected; ignore
              }
            )
            .then(() => {
              if (!cancelled) setScanState('scanning');
            })
            .catch((err: unknown) => {
              console.error('Camera start failed:', err);
              if (!cancelled) {
                setCameraSupported(false);
                setShowManualEntry(true);
                setStatusMessage('Camera unavailable. Enter the code manually below.');
              }
            });

          cleanupScanner = () => {
            scanner
              .stop()
              .then(() => scanner.clear())
              .catch(() => {
                // Scanner already stopped
              });
          };
        });
      })
      .catch((err) => {
        console.error('Failed to load scanner library:', err);
        if (!cancelled) {
          setCameraSupported(false);
          setShowManualEntry(true);
        }
      });

    return () => {
      cancelled = true;
      if (cleanupScanner) cleanupScanner();
    };
  }, [user, scanState === 'success']); // eslint-disable-line react-hooks/exhaustive-deps

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleScan(manualCode.trim());
  };

  const handleRescan = () => {
    setScanState('idle');
    setStatusMessage('');
    setResultDetail(null);
    setManualCode('');
    // Restarting the scanner happens through the effect above
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isReady || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/student')}
            className="flex items-center gap-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft size={20} /> Go Back to Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg"
          >
            Logout
          </button>
        </div>

        <div className="bg-gray-800 shadow-lg rounded-2xl p-8">
          {scanState === 'success' ? (
            <div className="text-center">
              <CheckCircle2 size={64} className="mx-auto mb-4 text-green-400" />
              <h1 className="text-2xl font-bold mb-2 text-green-400">You&apos;re Checked In!</h1>
              <p className="text-gray-300 mb-4">{statusMessage}</p>
              {resultDetail?.session && (
                <div className="mt-2 p-3 bg-gray-700 rounded-lg text-left text-xs break-words">
                  <span className="text-gray-400">Session: </span>
                  <code>{resultDetail.session}</code>
                </div>
              )}
              <button
                onClick={() => router.push('/student')}
                className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Back to Dashboard
              </button>
            </div>
          ) : scanState === 'error' ? (
            <div className="text-center">
              <XCircle size={64} className="mx-auto mb-4 text-red-400" />
              <h1 className="text-2xl font-bold mb-2 text-red-400">Verification Failed</h1>
              <p className="text-gray-300 mb-4">{statusMessage}</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleRescan}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Try Scanning Again
                </button>
                <button
                  onClick={() => setShowManualEntry(true)}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-500"
                >
                  Enter Code Manually
                </button>
              </div>
            </div>
          ) : scanState === 'verifying' ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-2">Verifying...</h1>
              <p className="text-gray-300">{statusMessage}</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <ScanLine size={28} className="text-blue-400" />
                <div>
                  <h1 className="text-2xl font-bold">Scan QR Code</h1>
                  <p className="text-gray-400 text-sm">
                    Point your camera at the QR code shown by your teacher.
                  </p>
                </div>
              </div>

              <div id="qr-reader-region" className="w-full rounded-lg overflow-hidden" />

              {scanState === 'idle' && cameraSupported && (
                <p className="text-gray-400 text-sm mt-3 flex items-center gap-2">
                  <Camera size={14} /> Starting camera...
                </p>
              )}
              {!cameraSupported && (
                <p className="text-yellow-400 text-sm mt-3">
                  Camera is not available on this device.
                </p>
              )}

              {showManualEntry && (
                <form onSubmit={handleManualSubmit} className="mt-6">
                  <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                    <Keyboard size={16} /> Or enter the session code manually
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="e.g. 6859f0d3..."
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!manualCode.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Verify
                    </button>
                  </div>
                </form>
              )}

              {!showManualEntry && (
                <button
                  onClick={() => setShowManualEntry(true)}
                  className="mt-4 text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
                >
                  <Keyboard size={14} /> Enter code manually instead
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
