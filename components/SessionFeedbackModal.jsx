"use client";
import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export default function SessionFeedbackModal({ isOpen, onClose, onFeedback, doctorName }) {
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (satisfied) => {
    if (!rating) {
      alert("Please select a rating before submitting feedback.");
      return;
    }
    setSubmitting(true);
    await onFeedback(satisfied, rating, comment);
    setSubmitting(false);
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-emerald-900/50 backdrop-blur-sm" />
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
            <Dialog.Panel className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full">
              <Dialog.Title className="text-xl font-bold text-emerald-800 mb-4 text-center">
                Session Feedback
              </Dialog.Title>
              
              <p className="text-emerald-700 mb-6 text-center">
                How was your session with Dr. {doctorName}?
              </p>
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-emerald-700 text-center">
                  📝 Your feedback helps us improve our service. If you're not satisfied, we'll try to connect you with another available doctor.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="text-center mb-2">
                  <p className="text-sm text-emerald-600 font-medium">Rate your experience:</p>
                </div>
                <div className="flex justify-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 transition-all duration-200 hover:scale-110 ${
                        rating >= star 
                          ? 'text-yellow-400 hover:text-yellow-500' 
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    >
                      <svg 
                        className="w-8 h-8" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                {rating && (
                  <p className="text-center text-sm text-emerald-600">
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </p>
                )}
                
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Any additional comments..."
                  className="w-full p-3 border border-emerald-200 rounded-lg resize-none"
                  rows={3}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={submitting}
                  className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Satisfied
                </button>
                
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Need Different Help
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}