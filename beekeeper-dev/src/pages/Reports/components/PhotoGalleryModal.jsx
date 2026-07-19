import React from "react";

export default function PhotoGalleryModal({
  gallery,
  setGallery,
  onDownload,
  onShare,
}) {
  const item = gallery.items[gallery.index];
  const total = gallery.items.length;

  const goTo = (nextIndex) => {
    const wrapped = (nextIndex + total) % total;
    setGallery({ ...gallery, index: wrapped });
  };

  return (
    <div
      className="photo-modal fixed inset-0 z-[9999] bg-black/90 p-4 text-white"
      role="dialog"
      aria-modal="true"
    >
      <div className="mx-auto flex h-full max-w-6xl flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <p className="text-sm text-white/70">
              {gallery.index + 1} of {total}
            </p>
            <h2 className="text-lg font-bold">{item.title}</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onDownload}
              className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
            >
              Download
            </button>

            <button
              type="button"
              onClick={onShare}
              className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
            >
              Share
            </button>

            <button
              type="button"
              onClick={() => setGallery(null)}
              className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>

        <div className="relative mt-4 flex min-h-0 flex-1 items-center justify-center">
          {total > 1 && (
            <button
              type="button"
              onClick={() => goTo(gallery.index - 1)}
              className="absolute left-0 z-10 rounded-full bg-white/10 px-4 py-3 text-2xl font-bold hover:bg-white/20"
              aria-label="Previous photo"
            >
              ‹
            </button>
          )}

          <img
            src={item.url}
            alt={`${item.title} photo ${item.index + 1}`}
            className="max-h-full max-w-full rounded-2xl object-contain"
          />

          {total > 1 && (
            <button
              type="button"
              onClick={() => goTo(gallery.index + 1)}
              className="absolute right-0 z-10 rounded-full bg-white/10 px-4 py-3 text-2xl font-bold hover:bg-white/20"
              aria-label="Next photo"
            >
              ›
            </button>
          )}
        </div>

        {item.caption && (
          <div className="mt-4 max-h-28 overflow-auto rounded-xl bg-white/10 p-3 text-sm text-white/90">
            <p className="font-semibold">Inspection notes</p>
            <p className="mt-1 whitespace-pre-wrap">{item.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}