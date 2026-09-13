import { ArrowLeft, X } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const isOnline = onlineUsers.includes(selectedUser._id);
  const avatarUrl = selectedUser.profilePic || `https://ui-avatars.com/api/?name=${selectedUser.username}&background=3B82F6&color=fff&size=64`;

  return (
    <div className="p-4 border-b border-borders bg-cards/95 backdrop-blur z-10 shadow-sm sticky top-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedUser(null)} 
            className="p-2 -ml-2 rounded-full hover:bg-borders transition-colors text-muted hover:text-text-main cursor-pointer lg:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <img 
              src={avatarUrl} 
              alt={selectedUser.username} 
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full border border-borders object-cover bg-background" 
            />

            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full ring-2 ring-cards" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-text-main">{selectedUser.username}</h3>
            <p className="text-xs text-muted">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <button 
          onClick={() => setSelectedUser(null)} 
          className="p-2 rounded-full hover:bg-borders transition-colors text-muted hover:text-text-main cursor-pointer hidden lg:block"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
