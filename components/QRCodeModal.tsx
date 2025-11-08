"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import QRCode from "qrcode";

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  shortCode: string;
}

export function QRCodeModal({ open, onOpenChange, url, shortCode }: QRCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && url) {
      QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
        .then((dataUrl) => {
          setQrDataUrl(dataUrl);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error generating QR code:", err);
          setIsLoading(false);
        });
    }
  }, [open, url]);

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.download = `qrcode-${shortCode}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription>Scan this QR code to open the shortened link</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          {isLoading ? (
            <div className="w-[300px] h-[300px] flex items-center justify-center bg-muted rounded-lg">
              <p className="text-muted-foreground">Generating QR code...</p>
            </div>
          ) : qrDataUrl ? (
            <>
              <img src={qrDataUrl} alt="QR Code" className="rounded-lg border" />
              <Button onClick={handleDownload} className="mt-4" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">Failed to generate QR code</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

