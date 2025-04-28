"use client";

import { useState, useRef, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Download,
    Share2,
    Copy,
    Edit,
    Trash2,
    Heart,
    ZoomIn,
    ZoomOut,
    RotateCw,
    Wand2,
    Sparkles,
    Code,
    X,
    Send
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useScrollLock } from "./hooks/useScrollLock";

interface ImagePreviewDialogProps {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
    image: string;
    prompt?: string;
    negativePrompt?: string;
    timestamp?: string;
    seed?: number;
    modelName?: string;
    tags?: string[];
}

export function ImagePreviewDialog({
                                       open,
                                       onOpenChangeAction,
                                       image,
                                       prompt = "",
                                       negativePrompt = "",
                                       timestamp = "Today, 10:30 AM",
                                       seed = 12345678,
                                       modelName = "Flux Realistic",
                                       tags = ["Portrait", "Photorealistic", "8K", "Detailed"],
                                   }: ImagePreviewDialogProps) {
    const [liked, setLiked] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [comment, setComment] = useState("");
    const [showPromptDetails, setShowPromptDetails] = useState(false);
    const [activeTab, setActiveTab] = useState("details");
    const [copied, setCopied] = useState(false);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    // Применяем хук для предотвращения тряски
    useScrollLock(open);

    const handleZoomIn = () => {
        setZoomLevel((prev) => Math.min(prev + 10, 200));
    };

    const handleZoomOut = () => {
        setZoomLevel((prev) => Math.max(prev - 10, 50));
    };

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const toggleLike = () => {
        setLiked((prev) => !prev);
    };

    const copyPrompt = () => {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const submitComment = () => {
        if (comment.trim()) {

            setComment("");
        }
    };

    const togglePromptDetails = () => {
        setShowPromptDetails(prev => !prev);
    };

    // Reset zoom and rotation when the dialog opens
    useEffect(() => {
        if (open) {
            setZoomLevel(100);
            setRotation(0);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChangeAction}>
            <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-lg bg-background">
                <DialogHeader className="px-6 py-3 flex flex-row items-center justify-between border-b">
                    <div className="flex items-center">
                        <DialogTitle className="pr-6">Image Details</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {timestamp}
                        </DialogDescription>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => onOpenChangeAction(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left side - Image */}
                    <div className="w-3/5 h-full bg-black/50 relative overflow-hidden">
                        <div
                            ref={imageContainerRef}
                            className="w-full h-full flex items-center justify-center"
                        >
                            <img
                                src={image}
                                alt="Preview"
                                className="transition-all duration-300 ease-in-out"
                                style={{
                                    transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain"
                                }}
                            />
                        </div>

                        {/* Zoom controls */}
                        <div className="absolute bottom-4 right-4 flex gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            onClick={handleZoomOut}
                                            disabled={zoomLevel <= 50}
                                            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                                        >
                                            <ZoomOut className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Zoom Out</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 rounded-full bg-background/80 backdrop-blur-sm"
                                onClick={() => setZoomLevel(100)}
                            >
                                {zoomLevel}%
                            </Button>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            onClick={handleZoomIn}
                                            disabled={zoomLevel >= 200}
                                            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                                        >
                                            <ZoomIn className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Zoom In</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            onClick={handleRotate}
                                            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                                        >
                                            <RotateCw className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Rotate 90°</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {/* Action buttons */}
                        <div className="absolute bottom-4 left-4 flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="bg-background/80 backdrop-blur-sm"
                                onClick={toggleLike}
                            >
                                <Heart
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        liked ? "fill-red-500 text-red-500" : ""
                                    )}
                                />
                                {liked ? "Liked" : "Like"}
                            </Button>

                            <Button
                                variant="secondary"
                                size="sm"
                                className="bg-background/80 backdrop-blur-sm"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>

                            <Button
                                variant="secondary"
                                size="sm"
                                className="bg-background/80 backdrop-blur-sm"
                            >
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                            </Button>
                        </div>
                    </div>

                    {/* Right side - Details */}
                    <div className="w-2/5 flex flex-col border-l">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                            <TabsList className="w-full justify-start px-4 pt-4 bg-transparent">
                                <TabsTrigger value="details" className="data-[state=active]:bg-muted">
                                    Details
                                </TabsTrigger>
                                <TabsTrigger value="comments" className="data-[state=active]:bg-muted">
                                    Comments
                                </TabsTrigger>
                                <TabsTrigger value="variations" className="data-[state=active]:bg-muted">
                                    Variations
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="flex-1 p-0 mt-0">
                                <ScrollArea className="h-[calc(80vh-8rem)] modal-scrollable">
                                    <div className="px-6 py-4 space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-base font-medium">Prompt</h3>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2 text-xs"
                                                    onClick={copyPrompt}
                                                >
                                                    {copied ? "Copied!" : "Copy"}
                                                    <Copy className="ml-1 h-3 w-3" />
                                                </Button>
                                            </div>

                                            <div className="relative">
                                                <div
                                                    className={cn(
                                                        "rounded-md bg-muted p-3 text-sm",
                                                        !showPromptDetails && "max-h-24 overflow-hidden"
                                                    )}
                                                >
                                                    {prompt}
                                                </div>

                                                {prompt.length > 120 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="mt-1 h-6 px-2 text-xs w-full justify-center"
                                                        onClick={togglePromptDetails}
                                                    >
                                                        {showPromptDetails ? "Show Less" : "Show More"}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {negativePrompt && (
                                            <div className="space-y-4">
                                                <h3 className="text-base font-medium">Negative Prompt</h3>
                                                <div className="rounded-md bg-muted p-3 text-sm">
                                                    {negativePrompt}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            <h3 className="text-base font-medium">Tags</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {tags.map((tag, index) => (
                                                    <Badge key={index} variant="outline" className="bg-secondary/50">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <h3 className="text-base font-medium">Generation Info</h3>
                                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                                <div className="text-muted-foreground">Model</div>
                                                <div>{modelName}</div>

                                                <div className="text-muted-foreground">Seed</div>
                                                <div className="flex items-center">
                                                    {seed}
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>

                                                <div className="text-muted-foreground">Dimensions</div>
                                                <div>1024 × 1024</div>

                                                <div className="text-muted-foreground">Guidance Scale</div>
                                                <div>7.5</div>

                                                <div className="text-muted-foreground">Steps</div>
                                                <div>30</div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <h3 className="text-base font-medium">Actions</h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button variant="outline" className="w-full justify-start">
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Button>

                                                <Button variant="outline" className="w-full justify-start">
                                                    <Wand2 className="mr-2 h-4 w-4" />
                                                    Enhance
                                                </Button>

                                                <Button variant="outline" className="w-full justify-start">
                                                    <Sparkles className="mr-2 h-4 w-4" />
                                                    Use as Reference
                                                </Button>

                                                <Button variant="outline" className="w-full justify-start">
                                                    <Code className="mr-2 h-4 w-4" />
                                                    View Metadata
                                                </Button>

                                                <Button variant="outline" className="w-full justify-start text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="comments" className="flex-1 flex flex-col p-0 mt-0">
                                <ScrollArea className="flex-1 modal-scrollable">
                                    <div className="px-6 py-4 space-y-4">
                                        {Array.from({ length: 3 }).map((_, index) => (
                                            <div key={index} className="flex gap-3">
                                                <div className="h-8 w-8 rounded-full bg-secondary flex-shrink-0 overflow-hidden">
                                                    <img
                                                        src={`/placeholder.svg?height=32&width=32&text=U${index}`}
                                                        alt="User avatar"
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm">User {index + 1}</span>
                                                        <span className="text-xs text-muted-foreground">
                              {index === 0 ? "Just now" : `${index} hour${index > 1 ? "s" : ""} ago`}
                            </span>
                                                    </div>
                                                    <p className="text-sm mt-1">
                                                        {index === 0
                                                            ? "This looks amazing! I love the lighting and composition."
                                                            : index === 1
                                                                ? "The details are incredible. What settings did you use?"
                                                                : "I'm trying to create something similar but can't get the colors right. Any tips?"
                                                        }
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                                            Reply
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                                            Like
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>

                                <div className="p-4 border-t">
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-secondary flex-shrink-0">
                                            <img
                                                src="/placeholder.svg?height=32&width=32&text=ME"
                                                alt="Your avatar"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Textarea
                                                placeholder="Add a comment..."
                                                className="min-h-[80px] resize-none"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                            />
                                            <div className="flex justify-end mt-2">
                                                <Button
                                                    size="sm"
                                                    disabled={!comment.trim()}
                                                    onClick={submitComment}
                                                >
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Comment
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="variations" className="flex-1 p-0 mt-0">
                                <div className="p-6 modal-scrollable">
                                    <div className="mb-4">
                                        <h3 className="text-base font-medium mb-2">Generate Variations</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Create similar images with different parameters
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <Button className="justify-start w-full">
                                            <Wand2 className="mr-2 h-4 w-4" />
                                            Similar Style
                                        </Button>
                                        <Button className="justify-start w-full">
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Different Style
                                        </Button>
                                    </div>

                                    <div className="bg-muted/30 rounded-lg p-4 mb-4">
                                        <h4 className="text-sm font-medium mb-2">Quick Variations</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {["Same pose", "Change outfit", "New background", "Change lighting", "Different angle", "Artistic style"].map((option, index) => (
                                                <Button key={index} variant="outline" size="sm" className="h-auto py-2">
                                                    {option}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <h3 className="text-base font-medium mb-3">Similar Images</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Array.from({ length: 4 }).map((_, index) => (
                                            <div key={index} className="rounded-md border overflow-hidden">
                                                <img
                                                    src={`/placeholder.svg?height=150&width=150&text=Similar+${index + 1}`}
                                                    alt={`Similar image ${index + 1}`}
                                                    className="w-full aspect-square object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}