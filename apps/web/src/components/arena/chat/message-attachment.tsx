'use client';

import { cn } from '@lmring/ui';
import { FileIcon, PaperclipIcon, XIcon } from 'lucide-react';
import Image from 'next/image';
import type { FileAttachment } from '@/types/workflow';

interface MessageAttachmentProps {
  data: FileAttachment;
  onRemove?: () => void;
  className?: string;
}

export function MessageAttachment({ data, onRemove, className }: MessageAttachmentProps) {
  const isImage = data.mediaType?.startsWith('image/');

  if (isImage) {
    return (
      <div className={cn('relative group', className)}>
        <Image
          src={data.url}
          alt={data.filename}
          width={96}
          height={96}
          className="h-24 w-24 rounded-lg object-cover border bg-muted"
          unoptimized
        />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Remove ${data.filename}`}
          >
            <XIcon className="h-3 w-3" />
          </button>
        )}
        <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1 py-0.5 rounded-b-lg truncate">
          {data.filename}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative group flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/50 max-w-[200px]',
        className,
      )}
    >
      <div className="flex-shrink-0">
        {data.mediaType?.includes('pdf') ? (
          <FileIcon className="h-5 w-5 text-red-500" />
        ) : (
          <PaperclipIcon className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{data.filename}</p>
        <p className="text-xs text-muted-foreground truncate">{getFileTypeLabel(data.mediaType)}</p>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Remove ${data.filename}`}
        >
          <XIcon className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

interface MessageAttachmentsProps {
  attachments: FileAttachment[];
  onRemove?: (index: number) => void;
  className?: string;
}

export function MessageAttachments({ attachments, onRemove, className }: MessageAttachmentsProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {attachments.map((attachment, index) => (
        <MessageAttachment
          key={attachment.url}
          data={attachment}
          onRemove={onRemove ? () => onRemove(index) : undefined}
        />
      ))}
    </div>
  );
}

function getFileTypeLabel(mediaType: string): string {
  if (!mediaType) return 'File';

  if (mediaType.includes('pdf')) return 'PDF';
  if (mediaType.includes('word') || mediaType.includes('document')) return 'Document';
  if (mediaType.includes('sheet') || mediaType.includes('excel')) return 'Spreadsheet';
  if (mediaType.includes('presentation') || mediaType.includes('powerpoint')) return 'Presentation';
  if (mediaType.includes('text')) return 'Text';
  if (mediaType.includes('json')) return 'JSON';
  if (mediaType.includes('zip') || mediaType.includes('compressed')) return 'Archive';

  const parts = mediaType.split('/');
  if (parts.length === 2) {
    return parts[1]?.toUpperCase() || 'File';
  }

  return 'File';
}
