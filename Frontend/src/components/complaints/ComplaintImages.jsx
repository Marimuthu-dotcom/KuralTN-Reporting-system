// Frontend/src/components/complaints/ComplaintImages.jsx
import React, { useState } from 'react';
import { Modal } from '../common/Modal';

export function ComplaintImages({ images = [] }) {
  const [activeImage, setActiveImage] = useState(null);

  if (!images || images.length === 0) {
    return (
      <div className="p-4 bg-neutral-50 rounded-xl border border-[#E7E5E4] text-center text-xs text-[#737373]">
        No photo attachments uploaded for this complaint.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img) => (
          <div
            key={img.id}
            onClick={() => setActiveImage(img)}
            className="group relative rounded-xl overflow-hidden border border-[#E7E5E4] aspect-video bg-neutral-100 cursor-pointer shadow-2xs hover:shadow-md transition-all"
          >
            <img
              src={img.image_url}
              alt={img.caption || 'Complaint image'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {img.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-[11px] text-white truncate">
                {img.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Full preview modal */}
      <Modal
        isOpen={!!activeImage}
        onClose={() => setActiveImage(null)}
        title={activeImage?.caption || 'Photo Evidence'}
        maxWidth="max-w-3xl"
      >
        {activeImage && (
          <div className="space-y-3">
            <div className="rounded-lg overflow-hidden max-h-[70vh] bg-black flex items-center justify-center">
              <img
                src={activeImage.image_url}
                alt="Enlarged view"
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
            {activeImage.caption && (
              <p className="text-xs text-[#737373] text-center italic">
                {activeImage.caption}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
