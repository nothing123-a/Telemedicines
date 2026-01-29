"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlayCircle } from "lucide-react";

export default function MusicModal({ open, onClose, url, name, onPlay, onPause, onEnded }) {
  if (!url) return null;

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-emerald-900/50 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="scale-95 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="ease-in duration-200"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-95 opacity-0"
          >
            <Dialog.Panel className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full text-center">
              <Dialog.Title className="text-lg font-bold text-emerald-800 mb-2">
                {name || "Mood-Based Music 🎵"}
              </Dialog.Title>
              <p className="text-emerald-700 mb-4">
                We thought this calming music might help you feel a bit better.
              </p>

              <audio 
                controls 
                className="w-full rounded"
                onPlay={onPlay}
                onPause={onPause}
                onEnded={onEnded}
              >
                <source src={url} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>

              <button
                onClick={onClose}
                className="mt-4 text-sm text-emerald-600 underline hover:text-emerald-800"
              >
                Close
              </button>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}