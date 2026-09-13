import { useEffect, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { Users, Search } from "lucide-react";
import clsx from "clsx";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOnline = showOnlineOnly ? onlineUsers.includes(user._id) : true;
    return matchesSearch && matchesOnline;
  });

  if (isUsersLoading) {
    return (
      <aside className="h-full w-full border-r border-borders bg-sidebar flex flex-col transition-all duration-200">
        <div className="p-4 flex items-center justify-center h-full">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </aside>
    );
  }

  return (
    <aside className="h-full w-full border-r border-borders bg-sidebar flex flex-col transition-all duration-200 z-10 shadow-sm">
      <div className="p-4 border-b border-borders w-full">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-muted" />
          <span className="font-semibold text-text-main">Contacts</span>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-borders rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
          />
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Online filter toggle */}
        <div className="mt-3 flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2 text-sm text-muted select-none">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="accent-primary w-4 h-4 rounded cursor-pointer"
            />
            Show online only
          </label>
          <span className="text-xs text-muted">({Math.max(0, onlineUsers.length - 1)} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full flex-1 py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={clsx(
              "w-full p-3 flex items-center gap-3 hover:bg-borders/50 transition-colors cursor-pointer",
              selectedUser?._id === user._id ? "bg-borders border-l-4 border-primary" : "border-l-4 border-transparent"
            )}
          >
            <div className="relative">
              <img
                src={user.profilePic || `https://ui-avatars.com/api/?name=${user.username}&background=3B82F6&color=fff&size=64`}
                alt={user.username}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border border-borders bg-background"
              />

              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success rounded-full ring-2 ring-cards" />
              )}
            </div>

            <div className="block text-left min-w-0 flex-1">
              <div className="flex justify-between items-center">
                <div className="font-medium text-text-main truncate">{user.username}</div>
                {user.unreadCount > 0 && selectedUser?._id !== user._id && (
                  <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {user.unreadCount}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted truncate">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-muted py-8 text-sm">No contacts found</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
