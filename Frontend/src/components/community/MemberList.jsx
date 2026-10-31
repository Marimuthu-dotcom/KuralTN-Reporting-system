// Frontend/src/components/community/MemberList.jsx
import React from 'react';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';

export function MemberList({ members = [] }) {
  return (
    <div className="space-y-3">
      {members.map((m) => (
        <div
          key={m.id || m.user_id}
          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Avatar src={m.avatar_url} name={m.full_name} size="sm" />
            <div>
              <span className="block text-xs font-bold text-[#171717]">{m.full_name}</span>
              <span className="block text-[10px] text-[#737373]">
                {m.designation || m.role?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {m.is_verified && (
            <Badge variant="success" size="xs">
              Verified
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
}
