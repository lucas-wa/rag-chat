import { ChatWindow } from "./components/ChatWindow";
import { UploadDocumentsForm } from "./components/UploadDocumentsForm";

export default function App() {

  return (
    <div className="flex min-h-screen bg-[#131318] text-white">
      <UploadDocumentsForm></UploadDocumentsForm>
      <ChatWindow
        endpoint={import.meta.env.VITE_PUBLIC_API_URL + "/retriveal/stream"}
      ></ChatWindow>
    </div>
  );
}
