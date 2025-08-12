"use client";
import Image from "next/image";
import { useState, useRef } from "react";
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [filename, setFilename] = useState<string>('');
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        // ログインしていない場合はログインページにリダイレクト
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    const sanitizeFilename = (name: string) => {
        // ファイル名として使えない文字をアンダースコアに置換し、長さを50文字に制限
        return name.replace(/[\/\\?%*:|"<>]/g, '_').slice(0, 50);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setAudioUrl(null); // 古いURLをクリア

        try {
            const response = await fetch('/api/text-to-speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error('音声データの取得に失敗しました。');
            }

            const audioBlob = await response.blob();
            const newAudioUrl = URL.createObjectURL(audioBlob);
            
            setAudioUrl(newAudioUrl);
            setFilename(text);

            if (audioRef.current) {
                audioRef.current.src = newAudioUrl;
                audioRef.current.play();
            }
        } catch (error) {
            console.error('エラー:', error);
            alert('エラーが発生しました。コンソールを確認してください。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <p>このページは許可されたアカウントのみが閲覧できます。</p>
            <button onClick={() => signOut()}>サインアウト</button>
            <h1>テキストを音声に変換</h1>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="ここにテキストを入力してください..."
                    rows={5}
                    disabled={loading}
                />
                <button type="submit" disabled={!text || loading}>
                    {loading ? '変換中...' : '音声に変換'}
                </button>
            </form>

            {audioUrl && (
                <div className="audio-container">
                    <audio ref={audioRef} controls src={audioUrl} className="audio-player" />
                    <a
                        href={audioUrl}
                        download={`${filename}.mp3`}
                        className="download-button"
                    >
                        ダウンロード
                    </a>
                </div>
            )}

            <style jsx>{`
                .container {
                    max-width: 600px;
                    margin: 40px auto;
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    font-family: sans-serif;
                }
                h1 {
                    text-align: center;
                }
                form {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                textarea {
                    width: 100%;
                    padding: 10px;
                    font-size: 16px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                button, .download-button {
                    padding: 12px;
                    font-size: 16px;
                    color: white;
                    background-color: #0070f3;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    transition: background-color 0.2s;
                }
                button:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }
                .audio-container {
                    margin-top: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .audio-player {
                    width: 100%;
                }
                .download-button {
                    background-color: #28a745;
                }
                .download-button:hover {
                    background-color: #218838;
                }
            `}</style>
        </div>
    );
} 
