"use client";
import { useState } from 'react';
import { Button } from './ui/button';

const IOS_URL = 'https://apps.apple.com/br/app/webglass-vidra%C3%A7arias/id1575274044';
const ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.webglass.staging&hl=pt_BR&pli=1';

export function WebGlassDownload() {
    const [open, setOpen] = useState(false);

    const iosQr = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
        IOS_URL
    )}&size=240x240`;
    const androidQr = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
        ANDROID_URL
    )}&size=240x240`;

    // Detect platform at runtime (guarded for SSR)
    const detectPlatform = () => {
        if (typeof navigator === 'undefined') return 'desktop';
        const ua = navigator.userAgent || '';
        const isAndroid = /Android/i.test(ua);
        const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
        if (isAndroid) return 'android';
        if (isIOS) return 'ios';
        return 'desktop';
    };

    const handleCTA = () => {
        const platform = detectPlatform();
        if (platform === 'ios') {
            // On iOS open App Store
            if (typeof window !== 'undefined') window.location.href = IOS_URL;
            return;
        }
        if (platform === 'android') {
            // On Android open Play Store
            if (typeof window !== 'undefined') window.location.href = ANDROID_URL;
            return;
        }
        // Desktop: open modal
        setOpen(true);
    };

    return (
        <>
            {/* Floating CTA: label + button */}
            <div className="fixed bottom-32 right-4 z-50 flex items-center gap-3">
                <div
                    className="hidden sm:flex items-center px-3 py-2 rounded-full font-bold shadow-lg transform transition-all hover:scale-105 animate-pulse cursor-pointer"
                    style={{ background: "#54BCBB", color: "white" }}
                    onClick={handleCTA}
                    tabIndex={0}
                    role="button"
                    aria-label="Compre agora — Baixe nosso app já!"
                >
                    <span className="text-sm">Baixe nosso app já!</span>
                </div>

                {/* 3D effect button */}
                <button
                    aria-label="Baixar WebGlass"
                    onClick={handleCTA}
                    className="w-14 h-14 rounded-full shadow-2xl bg-gradient-to-br from-white via-gray-100 to-gray-300 border border-border flex items-center justify-center hover:scale-105 transition-transform animate-bounce relative overflow-hidden"
                    style={{
                        boxShadow: "0 6px 20px 0 rgba(38, 114, 113, 0.25), 0 1.5px 0 0 #267271 inset",
                        borderBottom: "4px solid #23b3b0ff",
                        borderRight: "2px solid #267271",
                        borderLeft: "2px solid #267271",
                        borderTop: "1px solid #fff"
                    }}
                    title="Baixar WebGlass"
                >
                    <img
                        src="/WebGlass.webp"
                        alt="WebGlass app logo"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{
                            filter: "drop-shadow(0 2px 6px rgba(38,114,113,0.15))"
                        }}
                    />
                </button>
            </div>

            {/* Modal with QR codes */}
            {open && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
                <div className="bg-white dark:bg-card rounded-lg shadow-xl p-6 w-[90%] max-w-2xl">
                <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold">Baixe o WebGlass</h3>
                    <button onClick={() => setOpen(false)} className="text-muted-foreground">Fechar</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="flex flex-col items-center gap-3">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <img src={iosQr} alt="QR iOS" className="w-48 h-48 bg-white p-1 rounded" />
                        <img
                        src="/App_Store_(iOS).png"
                        alt="iOS logo"
                        className="absolute w-10 h-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        />
                    </div>
                    <div className="text-center">
                        <div className="font-medium"></div>
                        <div className="mt-2 flex gap-2">
                            <Button className="bg-primary text-white px-3 py-2" onClick={() => window.open(IOS_URL, '_blank')}>Abrir App Store</Button>
                        </div>
                    </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <img src={androidQr} alt="QR Android" className="w-48 h-48 bg-white p-1 rounded" />
                        <img
                        src="/Google-Play-Logo.png"
                        alt="Android logo"
                        className="absolute w-10 h-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        />
                    </div>
                    <div className="text-center">
                        <div className="font-medium"></div>
                        <div className="mt-2 flex gap-2">
                            <Button className="bg-primary text-white px-3 py-2" onClick={() => window.open(ANDROID_URL, '_blank')}>Abrir Play Store</Button>
                        </div>
                    </div>
                    </div>
                </div>
                <div className="mt-8 flex flex-col items-center gap-2">
                    <span className="text-sm font-bold text-black dark:text-white">Ou acesse pelo navegador:</span>
                    <Button
                        className="bg-primary text-white px-3 py-2"
                        onClick={() => window.open('https://ubva.systemglass.com.br/login', '_blank')}
                    >
                        Acessar o WebGlass - Web
                    </Button>
                    <Button
                        className="bg-primary text-white px-3 py-2"
                        onClick={() => window.open('https://webglass.my.canva.site/', '_blank')}
                    >
                        Manual da WebGlass
                    </Button>
                </div>
                </div>
                </div>
            )}
        </>
    );
}

export default WebGlassDownload;
