import { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import { useAuthStore } from '../../store/useAuthStore';
import { formatTime } from '../../utils/formatTime';

const ChatArea = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages, subscribeToTypingEvents, unsubscribeFromTypingEvents, typingUsers } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    subscribeToTypingEvents();

    return () => {
      unsubscribeFromMessages();
      unsubscribeFromTypingEvents();
    };
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages, subscribeToTypingEvents, unsubscribeFromTypingEvents]);

  useEffect(() => {
    if (messagesEndRef.current && messages) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto bg-background p-4 items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background relative z-0">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-background to-background/50 scroll-smooth">
        {messages.map((message) => {
          const fromMe = message.senderId === authUser._id;
          const chatClassName = fromMe ? 'flex justify-end' : 'flex justify-start';
          const bubbleClassName = fromMe ? 'bg-primary text-white rounded-br-none' : 'bg-cards text-text-main rounded-bl-none border border-borders';
          const avatarUrl = fromMe ? authUser.profilePic : selectedUser.profilePic;
          const profilePic = avatarUrl || `https://ui-avatars.com/api/?name=${fromMe ? authUser.username : selectedUser.username}&background=3B82F6&color=fff&size=64`;

          return (
            <div key={message._id} className={`${chatClassName} w-full`}>
              <div className={`flex gap-3 max-w-[80%] lg:max-w-[60%] ${fromMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className="flex-shrink-0 mt-auto">
                  <img src={profilePic} alt="Avatar" className="w-8 h-8 rounded-full border border-borders bg-cards" />
                </div>
                
                {/* Message Bubble */}
                <div className="flex flex-col gap-1">
                  <div className={`p-3 rounded-2xl shadow-sm ${bubbleClassName}`}>
                    {message.image && (
                      <img 
                        src={message.image} 
                        alt="attachment" 
                        className="sm:max-w-[250px] rounded-lg mb-2 cursor-pointer border border-white/10" 
                      />
                    )}
                    {message.audio && (
                      <audio
                        src={message.audio}
                        controls
                        className="h-10 max-w-[200px] sm:max-w-[250px] mb-1"
                      />
                    )}
                    {message.text && <p className="text-sm leading-relaxed">{message.text}</p>}
                  </div>
                  <div className={`text-[10px] text-muted flex items-center gap-1 ${fromMe ? 'justify-end' : 'justify-start'} px-1`}>
                    {formatTime(message.createdAt)}
                    {fromMe && (
                      <span className="ml-1">
                        {message.read ? (
                          <span className="text-primary font-bold tracking-tighter">✓✓</span>
                        ) : (
                          <span className="text-muted tracking-tighter">✓</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Typing Indicator */}
        {typingUsers.includes(selectedUser._id) && (
          <div className="flex justify-start w-full">
            <div className="flex gap-3 max-w-[80%] lg:max-w-[60%] flex-row">
              <div className="flex-shrink-0 mt-auto">
                <img src={selectedUser.profilePic || `https://ui-avatars.com/api/?name=${selectedUser.username}&background=3B82F6&color=fff&size=64`} alt="Avatar" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-borders bg-cards" />
              </div>
              <div className="p-4 rounded-2xl shadow-sm bg-cards border border-borders rounded-bl-none flex items-center gap-1">
                <span className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-muted rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatArea;
