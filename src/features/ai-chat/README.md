# AI Chat Frontend Integration

This directory contains the frontend implementation for the AI Chat feature that integrates seamlessly with the Django `ai_chat` backend.

## Features

### ✅ Real-time Communication
- **WebSocket Integration**: Live chat with automatic reconnection
- **Session Management**: Create, load, and manage multiple chat sessions
- **Streaming Responses**: Real-time AI response streaming
- **Connection Status**: Visual indicators for connection state

### ✅ Session Management
- **Multiple Sessions**: Switch between different chat conversations
- **Persistent History**: Messages are saved and restored
- **Session Settings**: Configure model, temperature, and tools per session
- **Export/Import**: Save chat sessions as JSON files

### ✅ Backend Integration
- **Django API**: Full integration with `ai_chat` Django app
- **Authentication**: Token-based authentication
- **Model Selection**: Choose from available LLM models
- **Preset Support**: Use predefined chat configurations

## Components

### `ChatProvider`
React context provider that manages chat state and API interactions.

```tsx
import { ChatProvider } from '@/features/ai-chat';

function App() {
  return (
    <ChatProvider onMapUpdate={handleMapUpdate}>
      <YourAppComponents />
    </ChatProvider>
  );
}
```

### `ChatInterface`
Main chat UI component with session management and real-time messaging.

```tsx
import { ChatInterface } from '@/features/ai-chat';

function MapPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsChatOpen(true)}>Open Chat</button>
      <ChatInterface 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}
```

### `useChat` Hook
Hook to access chat functionality throughout your app.

```tsx
import { useChat } from '@/features/ai-chat';

function CustomComponent() {
  const { 
    state, 
    createSession, 
    sendMessage, 
    connectWebSocket 
  } = useChat();
  
  // Use chat functionality
}
```

## API Integration

### Environment Variables
Set these in your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### Authentication
The API automatically uses tokens from localStorage:
- `authToken` (preferred)
- `token` (fallback)

### WebSocket Connection
Automatically connects to Django Channels WebSocket endpoints:
- Chat sessions: `ws://localhost:8000/ws/ai-chat/session/{sessionId}/?token={token}`
- Session list: `ws://localhost:8000/ws/ai-chat/sessions/?token={token}`

## Usage Examples

### Basic Chat Integration
```tsx
import { ChatProvider, ChatInterface, useChat } from '@/features/ai-chat';

function App() {
  return (
    <ChatProvider>
      <MainLayout />
    </ChatProvider>
  );
}

function MainLayout() {
  const [showChat, setShowChat] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowChat(true)}>
        Open AI Chat
      </button>
      
      <ChatInterface 
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />
    </div>
  );
}
```

### Programmatic Session Management
```tsx
function CustomChatController() {
  const { 
    state, 
    createSession, 
    loadSession, 
    sendMessage 
  } = useChat();
  
  const handleQuickStart = async () => {
    // Create a new session with a specific title
    const session = await createSession(
      "Data Analysis Session",
      "You are a helpful data analyst."
    );
    
    // Send a message
    await sendMessage("Analyze the current dataset");
  };
  
  const handleLoadPreviousSession = async () => {
    // Load an existing session
    await loadSession("session-uuid-here");
  };
  
  return (
    <div>
      <button onClick={handleQuickStart}>Quick Start</button>
      <button onClick={handleLoadPreviousSession}>Load Previous</button>
      
      {/* Show current session info */}
      {state.currentSession && (
        <div>
          Current: {state.currentSession.title}
          Messages: {state.messages.length}
        </div>
      )}
    </div>
  );
}
```

### WebSocket Management
```tsx
function AdvancedChatComponent() {
  const { 
    state, 
    connectWebSocket, 
    disconnectWebSocket,
    sendMessageWebSocket 
  } = useChat();
  
  useEffect(() => {
    // Connect when component mounts
    if (state.currentSession) {
      connectWebSocket(state.currentSession.id);
    }
    
    // Cleanup on unmount
    return () => disconnectWebSocket();
  }, [state.currentSession?.id]);
  
  const handleSendMessage = (message: string) => {
    if (state.isConnected) {
      // Send via WebSocket for real-time experience
      sendMessageWebSocket(message);
    } else {
      // Fallback to HTTP API
      sendMessage(message);
    }
  };
  
  return (
    <div>
      <div>Status: {state.isConnected ? 'Connected' : 'Disconnected'}</div>
      {/* Your chat UI */}
    </div>
  );
}
```

## Integration with Map Features

The chat system can be integrated with geospatial features:

```tsx
function MapWithChat() {
  const handleMapUpdate = (analysis: AnalysisResult) => {
    // Apply analysis results to map
    console.log('Received analysis:', analysis);
    // Update map layers, show visualizations, etc.
  };
  
  return (
    <ChatProvider onMapUpdate={handleMapUpdate}>
      <MapComponent />
      <ChatInterface />
    </ChatProvider>
  );
}
```

## Troubleshooting

### Common Issues

1. **WebSocket Connection Fails**
   - Check if Django server is running with ASGI
   - Verify `NEXT_PUBLIC_WS_URL` environment variable
   - Ensure authentication token is valid

2. **API Calls Fail**
   - Check `NEXT_PUBLIC_API_URL` environment variable
   - Verify Django server is running
   - Check if authentication token is set in localStorage

3. **Messages Not Appearing**
   - Check browser console for WebSocket errors
   - Verify session is created before sending messages
   - Check if user is authenticated

### Development Tips

- Use browser dev tools to monitor WebSocket connections
- Check Django logs for backend errors
- Use `state.error` to display error messages to users
- Test both WebSocket and HTTP fallback modes

## Backend Dependencies

This frontend requires the Django `ai_chat` app to be properly configured:

1. Django Channels for WebSocket support
2. Redis for channel layers
3. LLM server integration
4. Proper CORS settings for frontend domain

See the backend README for setup instructions. 