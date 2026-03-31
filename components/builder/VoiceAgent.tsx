
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveServerMessage, Blob } from '@google/genai';

import { connectLiveAgent } from '../../services/liveAgentService';
import { encode, decode, decodeAudioData } from '../../utils/audio';
import MicrophoneIcon from '../icons/MicrophoneIcon';

type LiveSession = Awaited<ReturnType<typeof connectLiveAgent>>;

interface VoiceAgentProps {
    isOpen: boolean;
    onClose: () => void;
    currentStepKey: string;
    onApplySuggestion: (path: string, value: any) => void;
    onFunctionCall: (name: string, args: any) => Promise<string>;
}

type AgentStatus = 'disconnected' | 'connecting' | 'connected' | 'speaking';

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const VoiceAgent: React.FC<VoiceAgentProps> = ({ isOpen, onClose, currentStepKey, onApplySuggestion, onFunctionCall }) => {
    const [status, setStatus] = useState<AgentStatus>('disconnected');
    const [isAvailable, setIsAvailable] = useState(false);
    
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef<number>(0);

    useEffect(() => {
        const supported = !!(window.AudioContext || (window as any).webkitAudioContext);
        setIsAvailable(supported);
        return () => {
            disconnect();
        };
    }, []);

    const disconnect = useCallback(async () => {
        setStatus('disconnected');
        
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) { console.error("Error closing session:", e); }
            sessionPromiseRef.current = null;
        }

        scriptProcessorRef.current?.disconnect();
        scriptProcessorRef.current = null;

        sourceNodeRef.current?.disconnect();
        sourceNodeRef.current = null;

        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;

        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
        }
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;

        sourcesRef.current.forEach(source => source.stop());
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;
    }, []);

    const connect = useCallback(async () => {
        if (status !== 'disconnected') return;
        setStatus('connecting');

        try {
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            sessionPromiseRef.current = connectLiveAgent({
                onopen: () => {
                    setStatus('connected');
                    const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                    sourceNodeRef.current = source;
                    const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        
                        if (sessionPromiseRef.current) {
                           sessionPromiseRef.current.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                           });
                        }
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContextRef.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.toolCall) {
                        for (const fc of message.toolCall.functionCalls) {
                            const result = await onFunctionCall(fc.name, fc.args);
                            if (sessionPromiseRef.current) {
                                sessionPromiseRef.current.then((session) => {
                                    session.sendToolResponse({
                                        functionResponses: { id: fc.id, name: fc.name, response: { result } }
                                    });
                                });
                            }
                        }
                    }

                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio && outputAudioContextRef.current) {
                        setStatus('speaking');
                        const outputCtx = outputAudioContextRef.current;
                        const nextStartTime = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                        
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                        
                        const source = outputCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputCtx.destination);
                        
                        source.onended = () => {
                            sourcesRef.current.delete(source);
                            if (sourcesRef.current.size === 0) {
                                setStatus('connected');
                            }
                        };
                        
                        source.start(nextStartTime);
                        nextStartTimeRef.current = nextStartTime + audioBuffer.duration;
                        sourcesRef.current.add(source);
                    }
                    
                    if(message.serverContent?.interrupted) {
                        sourcesRef.current.forEach(source => source.stop());
                        sourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
                        setStatus('connected');
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Live session error:', e);
                    disconnect();
                },
                onclose: () => {
                    disconnect();
                },
            });

        } catch (error) {
            console.error('Failed to start voice agent:', error);
            disconnect();
        }
    }, [status, onFunctionCall, disconnect]);

    const handleMicClick = () => {
        if (status === 'disconnected') {
            connect();
        } else {
            disconnect();
        }
    };

    if (!isAvailable) return null;

    const getButtonContent = () => {
        switch (status) {
            case 'connecting':
                return <div className="w-7 h-7 border-4 border-t-transparent border-white rounded-full animate-spin" />;
            case 'speaking':
            case 'connected':
                return (
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                       <div className="w-4 h-4 bg-white rounded-full ring-4 ring-white/30" />
                    </div>
                );
            case 'disconnected':
            default:
                return <MicrophoneIcon className="w-7 h-7" />;
        }
    };

    const getButtonColor = () => {
        switch (status) {
            case 'connected':
            case 'speaking':
                return "from-emerald-500 to-green-500";
            case 'connecting':
                return "from-amber-500 to-yellow-500";
            case 'disconnected':
            default:
                return "from-violet-600 to-pink-600";
        }
    };
    
    // Only render the VoiceAgent if isOpen is true
    if (!isOpen) return null;

    return (
        <motion.button
            onClick={handleMicClick}
            className={`absolute bottom-6 left-6 w-14 h-14 rounded-full bg-gradient-to-br ${getButtonColor()} text-white shadow-2xl shadow-violet-500/30 flex items-center justify-center z-40`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle Voice Agent"
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={status}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                >
                    {getButtonContent()}
                </motion.div>
            </AnimatePresence>
        </motion.button>
    );
};

export default VoiceAgent;