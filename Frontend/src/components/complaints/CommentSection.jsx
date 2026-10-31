// Frontend/src/components/complaints/CommentSection.jsx
import React, { useState } from 'react';
import { Send, Shield, Lock, MessageSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { formatDateTime } from '../../utils/dateUtils';
import { Badge } from '../common/Badge';

export function CommentSection({
  complaintId,
  complaintWardId,
  comments = [],
  onAddComment,
  isLoading = false,
}) {
  const { user, isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ward restriction logic
  const isSameWard = user && user.ward_id === complaintWardId;
  const isPrivileged = user && (user.role === 'ADMIN' || user.role === 'WARD_COUNCILLOR' || user.role === 'DEPARTMENT_HANDLER');
  const canComment = isAuthenticated && (isSameWard || isPrivileged);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(commentText.trim());
      setCommentText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="comments" className="bg-white rounded-xl border border-[#E7E5E4] p-6 shadow-2xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#F97316]" />
          <h3 className="text-sm font-bold text-[#171717] uppercase tracking-wider">
            Ward Discussion & Official Notes ({comments.length})
          </h3>
        </div>
        <span className="text-xs text-[#737373]">
          Ward-restricted community thread
        </span>
      </div>

      {/* Comment Form or Restriction Notice */}
      {canComment ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3">
            <Avatar src={user?.avatar_url} name={user?.full_name} size="md" />
            <div className="flex-1">
              <textarea
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share a constructive update, observation, or confirmation..."
                className="w-full text-sm rounded-lg border border-[#E7E5E4] p-3 focus:outline-none focus:ring-2 focus:ring-[#F97316] placeholder:text-[#A8A29E]"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Send}
              isLoading={isSubmitting}
              disabled={!commentText.trim()}
            >
              Post Comment
            </Button>
          </div>
        </form>
      ) : isAuthenticated ? (
        <div className="p-4 bg-neutral-50 rounded-lg border border-[#E7E5E4] flex items-center gap-3 text-xs text-[#737373]">
          <Lock className="w-4 h-4 text-[#A8A29E] shrink-0" />
          <span>
            This complaint belongs to another ward. You can view it, but participation is restricted to eligible ward members.
          </span>
        </div>
      ) : (
        <div className="p-4 bg-orange-50/60 rounded-lg border border-orange-200 text-xs text-[#171717] text-center">
          Please sign in with your verified ward account to join this discussion.
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4 pt-2">
        {comments.length === 0 ? (
          <p className="text-xs text-[#737373] text-center py-4">
            No comments yet. Registered residents of this ward can post observations here.
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-xl border transition-all ${
                comment.is_official
                  ? 'bg-orange-50/40 border-orange-200'
                  : 'bg-white border-[#E7E5E4]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <Avatar
                    src={comment.author_avatar}
                    name={comment.author_name}
                    size="sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#171717]">
                        {comment.author_name}
                      </span>
                      {comment.is_official && (
                        <Badge variant="primary" size="xs">
                          Official Update
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-[#737373]">
                      {comment.author_role?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] text-[#737373]">
                  {formatDateTime(comment.created_at)}
                </span>
              </div>

              <p className="text-xs text-[#171717] leading-relaxed pl-9 whitespace-pre-wrap">
                {comment.comment_text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
