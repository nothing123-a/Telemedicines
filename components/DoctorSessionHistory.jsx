"use client";
import { useState, useEffect } from "react";

export default function DoctorSessionHistory({ doctorId }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doctorId) {
      fetchSessions();
    }
  }, [doctorId]);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/doctor/sessions?doctorId=${doctorId}`);
      const data = await response.json();
      if (response.ok) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading sessions...</div>;
  }

  if (sessions.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-400 text-4xl mb-2">📋</div>
        <p className="text-gray-500">No sessions yet</p>
        <p className="text-sm text-gray-400 mt-1">Your patient sessions will appear here</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-3">
        {sessions.slice(0, 5).map((session) => (
          <div key={session._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                session.status === 'active' ? 'bg-green-500' : 
                session.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
              }`}></div>
              <div>
                <p className="font-medium text-gray-900">{session.userId?.name || 'Anonymous'}</p>
                <p className="text-sm text-gray-600">
                  {session.sessionType === 'chat' ? '💬' : '🎥'} {session.sessionType} session
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {new Date(session.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-400">
                {session.duration ? `${session.duration}min` : 'In progress'}
              </p>
            </div>
          </div>
        ))}
      </div>
      {sessions.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-blue-600 text-sm hover:text-blue-800">
            View all sessions ({sessions.length})
          </button>
        </div>
      )}
    </div>
  );
}