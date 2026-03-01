"use client"

import { useCallback, useState, useRef } from "react"
import { Upload, Video, X, Film, FileText, Headphones } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoUploaderProps {
  onFileSelected: (file: File) => void
  disabled?: boolean
}

export function VideoUploader({ onFileSelected, disabled }: VideoUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      setError(null)
      if (!file.type.startsWith("video/")) {
        setError("Please select a video file (MP4, MOV, or WebM)")
        return
      }
      if (file.size > 100 * 1024 * 1024) {
        setError("File is too large. Maximum size is 100 MB.")
        return
      }
      setSelectedFile(file)
      onFileSelected(file)
    },
    [onFileSelected]
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (e.dataTransfer.files?.[0]) {
        handleFile(e.dataTransfer.files[0])
      }
    },
    [handleFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        handleFile(e.target.files[0])
      }
    },
    [handleFile]
  )

  const clearFile = useCallback(() => {
    setSelectedFile(null)
    if (inputRef.current) inputRef.current.value = ""
  }, [])

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (selectedFile) {
    return (
      <div className="p-4 bg-neon-purple/10 border border-neon-purple/20 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-neon-purple/20 flex items-center justify-center flex-shrink-0">
            <Film className="w-6 h-6 text-neon-purple" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-star-white truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-star-faint">{formatSize(selectedFile.size)}</p>
          </div>
          {!disabled && (
            <button
              onClick={clearFile}
              aria-label="Remove selected file"
              className="p-1.5 rounded-lg hover:bg-space-700 transition-colors"
            >
              <X className="w-4 h-4 text-star-dim" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "relative p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all",
        dragActive
          ? "border-neon-purple bg-neon-purple/10"
          : "border-space-600 bg-space-800 hover:border-neon-purple/40 hover:bg-space-700",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-14 h-14 rounded-2xl bg-neon-purple/10 flex items-center justify-center">
          {dragActive ? (
            <Video className="w-7 h-7 text-neon-purple" />
          ) : (
            <Upload className="w-7 h-7 text-neon-purple/60" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-star-white">
            {dragActive ? "Drop resource here" : "Upload training resource"}
          </p>
          <p className="text-xs text-star-faint mt-1">MP4, MOV, WebM up to 100MB</p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-[10px] text-star-faint/70"><FileText className="w-3 h-3" />PDF</span>
            <span className="flex items-center gap-1 text-[10px] text-star-faint/70"><Headphones className="w-3 h-3" />Audio</span>
            <span className="flex items-center gap-1 text-[10px] text-star-faint/70"><Video className="w-3 h-3" />Video</span>
          </div>
        </div>
        {error && (
          <p className="text-xs text-retro-coral mt-2 font-medium">{error}</p>
        )}
      </div>
    </div>
  )
}
