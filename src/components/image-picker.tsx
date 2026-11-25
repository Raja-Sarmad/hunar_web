"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { UploadsAPI, mediaUrl } from "@/lib/api";

export default function ImagePicker({
  label = "Service image",
  value,
  onChange,
  hint = "JPG, PNG or WebP · max 5MB",
}: {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onFile = async (file: File | null) => {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }
    setBusy(true);
    try {
      const res = await UploadsAPI.image(file);
      onChange(res.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const preview = value ? mediaUrl(value) : "";

  return (
    <div className="imgPick">
      <div className="imgPickLabel">{label}</div>
      <div className="imgPickBox">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="imgPickPreview" />
        ) : (
          <div className="imgPickEmpty">
            <ImagePlus size={22} />
            <span>No image yet</span>
          </div>
        )}
        <div className="imgPickActions">
          <button
            type="button"
            className="ad-btn ad-btn-primary"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus size={14} /> {busy ? "Uploading…" : value ? "Change" : "Upload"}
          </button>
          {value ? (
            <button
              type="button"
              className="ad-btn ad-btn-danger"
              disabled={busy}
              onClick={() => onChange("")}
            >
              <Trash2 size={14} /> Remove
            </button>
          ) : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => onFile(e.target.files?.[0] || null)}
      />
      <p className="imgPickHint">{hint}</p>
      {error ? <p className="ad-error">{error}</p> : null}
    </div>
  );
}
