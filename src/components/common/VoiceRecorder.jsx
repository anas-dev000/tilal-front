// src/components/common/VoiceRecorder.jsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Square, Trash2, Play, Pause, Upload } from 'lucide-react';
import Button from './Button';
import { toast } from 'sonner';

const VoiceRecorder = ({ onRecordingComplete, existingRecording, onDelete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(existingRecording || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // Sync with existing recording if it changes (e.g. when modal opens with task data)
  useEffect(() => {
    if (existingRecording && !audioBlob) {
      setAudioUrl(existingRecording);
    }
  }, [existingRecording, audioBlob]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.success('Recording started');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      toast.success('Recording stopped');
    }
  }, [isRecording]);

  const deleteRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    
    if (onDelete) {
      onDelete();
    }
    
    toast.success('Recording deleted');
  }, [audioUrl, onDelete]);

  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {!audioUrl && !isRecording && (
          <Button
            type="button"
            variant="primary"
            icon={Mic}
            onClick={startRecording}
            className="flex-1"
          >
            Start Recording
          </Button>
        )}

        {isRecording && (
          <div className="flex-1 flex items-center gap-3">
            <Button
              type="button"
              variant="danger"
              icon={Square}
              onClick={stopRecording}
              className="flex-1"
            >
              Stop Recording
            </Button>
            <div className="flex items-center gap-2 bg-red-100 px-4 py-2 rounded-lg">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-red-800 font-mono font-bold">
                {formatTime(recordingTime)}
              </span>
            </div>
          </div>
        )}

        {audioUrl && !isRecording && (
          <div className="flex-1 flex items-center gap-3">
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            
            <Button
              type="button"
              variant="secondary"
              icon={isPlaying ? Pause : Play}
              onClick={togglePlayback}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>

            <div className="flex-1 bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center justify-between">
              <span className="text-green-800 font-medium flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Voice Recording Ready
                {recordingTime > 0 && (
                  <span className="text-sm">({formatTime(recordingTime)})</span>
                )}
              </span>
            </div>

            <Button
              type="button"
              variant="danger"
              icon={Trash2}
              onClick={deleteRecording}
              title="Delete recording"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
