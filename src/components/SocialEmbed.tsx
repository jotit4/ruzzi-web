import {
    InstagramEmbed,
    TikTokEmbed,
    TwitterEmbed,
    YouTubeEmbed,
    FacebookEmbed,
    LinkedInEmbed,
    PinterestEmbed
} from 'react-social-media-embed';
import { cn } from "@/lib/utils";

interface SocialEmbedProps {
    url: string;
    width?: number | string;
    className?: string;
    captioned?: boolean;
}

export const SocialEmbed = ({ url, width = '100%', className, captioned = true }: SocialEmbedProps) => {
    if (!url) return null;

    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;

        if (hostname.includes('instagram.com')) {
            return (
                <div className={cn("flex justify-center w-full overflow-hidden", className)}>
                    <InstagramEmbed url={url} width={width} captioned={captioned} />
                </div>
            );
        }
        if (hostname.includes('tiktok.com')) {
            return (
                <div className={cn("flex justify-center", className)}>
                    <TikTokEmbed url={url} width={width} />
                </div>
            );
        }
        if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
            return (
                <div className={cn("flex justify-center", className)}>
                    <TwitterEmbed url={url} width={width} />
                </div>
            );
        }
        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
            return (
                <div className={cn("flex justify-center", className)}>
                    <YouTubeEmbed url={url} width={width} />
                </div>
            );
        }
        if (hostname.includes('facebook.com')) {
            return (
                <div className={cn("flex justify-center", className)}>
                    <FacebookEmbed url={url} width={width} />
                </div>
            );
        }
        if (hostname.includes('linkedin.com')) {
            return (
                <div className={cn("flex justify-center", className)}>
                    <LinkedInEmbed url={url} width={width} />
                </div>
            );
        }
        if (hostname.includes('pinterest.com')) {
            return (
                <div className={cn("flex justify-center", className)}>
                    <PinterestEmbed url={url} width={width} />
                </div>
            );
        }
    } catch (e) {
        console.error("Invalid URL passed to SocialEmbed:", url);
    }

    return (
        <div className={cn("p-4 border rounded bg-gray-50 text-center text-muted-foreground", className)}>
            <p className="mb-2">Vista previa no disponible</p>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
            >
                Ver contenido en {url}
            </a>
        </div>
    );
};
