'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, QrCode, X, Users, Square } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '@/contexts/AuthContext';
import { classesAPI, sessionsAPI } from '@/lib/api';

interface ScannedStudent {
  _id: string;
  name: string;
  rollNo: number;
}

interface SessionSummary {
  presentCount: number;
  totalStudents: number;
}

export default function LiveSessionPage() {
  const { courseName } = useParams();
  const router = useRouter();
  const { user, isReady } = useAuth();

  const [classInfo, setClassInfo] = useState<{ _id: string; name: string } | null>(null);
  const [classError, setClassError] = useState('');

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [mainSessionExpiresAt, setMainSessionExpiresAt] = useState<number | null>(null);
  const [qrExpired, setQrExpired] = useState(false);

  const [scannedStudents, setScannedStudents] = useState<ScannedStudent[]>([]);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [ending, setEnding] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrLifespan, setQrLifespan] = useState(7);

  const startingRef = useRef(false);

  // Resolve the class by name for the logged-in teacher
  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!courseName) return;

    (async () => {
      try {
        const result = await classesAPI.getAll(user.id);
        const classes = result.classes || [];
        const decoded = decodeURIComponent(courseName as string);
        const match = classes.find((c: { name: string }) => c.name === decoded);
        if (match) {
          setClassInfo({ _id: match._id, name: match.name });
        } else {
          setClassError(`Class "${decoded}" was not found for your account.`);
        }
      } catch (err) {
        console.error('Error resolving class:', err);
        setClassError('Failed to load the class. Please go back and try again.');
      }
    })();
  }, [isReady, user, courseName, router]);

  /** Rotate the QR payload (anti screenshot-sharing) while keeping the same session id */
  const buildQrPayload = useCallback(
    (activeSessionId: string) => {
      const nonce = Date.now().toString(36);
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      return `${origin}/student/verify?session=${activeSessionId}&course=${encodeURIComponent(
        courseName as string
      )}&t=${nonce}`;
    },
    [courseName]
  );

  const generateNewQrCode = useCallback(() => {
    if (!sessionId) return;
    setQrData(buildQrPayload(sessionId));
    setCountdown(qrLifespan);
    setQrExpired(false);
  }, [qrLifespan, sessionId, buildQrPayload]);

  const handleStartSession = async () => {
    if (!classInfo || !user || startingRef.current) return;
    startingRef.current = true;
    try {
      const result = await sessionsAPI.create({
        classId: classInfo._id,
        teacherId: user.id,
        duration: 10 * 60 * 1000,
      });
      if (result.success) {
        const newSessionId = result.session._id as string;
        setSessionId(newSessionId);
        setMainSessionExpiresAt(new Date(result.session.sessionExpiresAt).getTime());
        setQrData(buildQrPayload(newSessionId));
        setCountdown(qrLifespan);
        setQrExpired(false);
        setSessionActive(true);
        setIsModalOpen(false);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      startingRef.current = false;
    }
  };

  const endSession = useCallback(async () => {
    if (!sessionId || ending) return;
    setEnding(true);
    try {
      const result = await sessionsAPI.end(sessionId);
      setSessionSummary({
        presentCount: result.presentCount ?? 0,
        totalStudents: result.totalStudents ?? 0,
      });
    } catch (err) {
      console.error('Error ending session:', err);
      setSessionSummary(null);
    } finally {
      setSessionActive(false);
      setQrData(null);
      setMainSessionExpiresAt(null);
      setEnding(false);
    }
  }, [sessionId, ending]);

  // Timers: main session countdown + QR rotation
  useEffect(() => {
    if (!sessionActive) return;

    const timer = setInterval(() => {
      if (mainSessionExpiresAt && Date.now() > mainSessionExpiresAt) {
        void endSession();
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
  }, [sessionActive, mainSessionExpiresAt, endSession]);

  // Poll live check-ins
  useEffect(() => {
    if (!sessionActive || !sessionId) return;

    const poll = setInterval(async () => {
      try {
        const result = await sessionsAPI.getById(sessionId);
        if (result.success) {
          setScannedStudents(result.session.scannedStudentDetails || []);
          if (!result.session.isActive && !ending) {
            // Session expired server-side
            setSessionActive(false);
            setQrData(null);
          }
        }
      } catch {
        // Ignore transient polling errors
      }
    }, 3000);

    return () => clearInterval(poll);
  }, [sessionActive, sessionId, ending]);

  const progressPercentage = Math.min(100, Math.max(0, (countdown / qrLifespan) * 100));

  if (!isReady || (isReady && !user)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/teacher')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} /> Go Back to Dashboard
        </button>

        <div className="bg-white shadow-lg rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-2">
            Live Attendance Session: {decodeURIComponent(courseName as string)}
          </h1>
          <p className="text-gray-600 mb-8">
            A secure QR code is generated for students to scan. Students who scan are marked
            present in real time; everyone else is marked absent when the session ends.
          </p>

          {classError && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {classError}
            </div>
          )}

          {!classInfo ? (
            <p className="text-gray-500">Resolving class...</p>
          ) : !sessionActive ? (
            sessionSummary ? (
              <div className="text-center py-6">
                <h2 className="text-2xl font-bold text-green-600 mb-2">Session Ended</h2>
                <p className="text-gray-600 mb-6">
                  Attendance finalized: <strong>{sessionSummary.presentCount}</strong> of{' '}
                  <strong>{sessionSummary.totalStudents}</strong> students present.
                </p>
                <button
                  onClick={() => router.push('/teacher')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Back to Dashboard
                </button>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto text-lg transition-colors"
                >
                  <QrCode /> Generate QR Code
                </button>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center gap-6">
              {qrData ? (
                <>
                  <div className="p-4 bg-white rounded-lg shadow-inner">
                    <QRCodeCanvas value={qrData} size={256} />
                  </div>

                  <div className="w-full max-w-sm mt-2 text-center">
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
                <div className="text-center">
                  <p className="mt-2 text-red-600 font-bold text-lg mb-4">
                    This QR has expired. Please generate again.
                  </p>
                  <button
                    onClick={generateNewQrCode}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Generate New QR
                  </button>
                </div>
              ) : null}

              <div className="w-full mt-4 bg-gray-50 rounded-xl p-6 border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Users size={20} /> Live Check-ins ({scannedStudents.length})
                  </h3>
                  <button
                    onClick={endSession}
                    disabled={ending}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    <Square size={16} /> {ending ? 'Ending...' : 'End Session'}
                  </button>
                </div>
                {scannedStudents.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No students have checked in yet. Share the QR code with your class.
                  </p>
                ) : (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {scannedStudents.map((student) => (
                      <li
                        key={student._id}
                        className="flex items-center justify-between bg-white border rounded-lg px-3 py-2 text-sm"
                      >
                        <span className="font-semibold">{student.name}</span>
                        <span className="text-gray-500">Roll {student.rollNo}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
                onClick={handleStartSession}
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
