import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useChat } from "ai/react";
import { useRef, useState, ReactElement, useEffect } from "react";

import { ChatMessageBubble } from "./ChatMessageBubble";
import { UploadDocumentsForm } from "./UploadDocumentsForm";

export function ChatWindow({
  endpoint,
  placeholder,
  showIngestForm,
  showIntermediateStepsToggle
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sourcesForMessages, setSourcesForMessages] = useState({});

  const handleInputChange = (e) =>
    setInput(e.currentTarget.value);

  const sendMessage = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    if (sessionStorage.getItem("ragChat@sessiorId") === null) {
      toast("É necessário enviar um arquivo!", {
        theme: "dark",
      });
    }

    if (!input) {
      setIsLoading(false);
      return;
    }

    const tmp = "Me responda isso em português: " + input;

    setInput("");

    if (!messages.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setMessages(
      messages.concat({
        id: messages.length.toString(),
        content: input,
        role: "user",
      }),
    );

    try {
      const response = await fetch(
        `/retriveal/stream/${sessionStorage.getItem("ragChat@sessiorId")}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringfy({ content: tmp }),
        },
      );


      const json = response.data;

      if (response.status === 200) {
        setMessages((prevState) => {
          const prev = [...prevState];

          prev.push({
            id: prev.length.toString(),
            content: json.replace("</s>", " "),
            role: "assistant",
          });

          return prev;
        });
      } else {
        if (json.error) {
          toast(json.error, {
            theme: "dark",
          });
          throw new Error(json.error);
        }
      }
    } catch (error) {
      toast(error.message, {
        theme: "dark",
      });
    }

    setIsLoading(false);
  };

  // Preciso que quando essa página for fechada o sessionStorage, alertar o usuário que ele perderá os dados
  // e enviar uma requisição para o servidor para que ele apague os dados do usuário
  useEffect(() => {

    const listener = e => {
      const session = sessionStorage.getItem("ragChat@sessiorId");

      if (!session) return;
      try {
        navigator.sendBeacon(`/session/${session}`);
        sessionStorage.removeItem("ragChat@sessiorId");
        sessionStorage.removeItem("uploadedDocuments");
      } catch (error) {
        console.log(error);
      }
    }

    window.addEventListener("unload", listener);

    return () => window.removeEventListener("unload", listener)
  }, []);

  return (
    <div
      className={`flex w-full flex-2 flex-col items-center p-4 grow overflow-hidden md:border-l-2 md:border-l-white`}
    >
      <div className="flex flex-col-reverse w-full mb-4 overflow-auto transition-[flex-grow] ease-in-out grow">
        {messages.length > 0
          ? [...messages].reverse().map((m, i) => {
            const sourceKey = (messages.length - 1 - i).toString();
            return (<ChatMessageBubble
                      key={m.id}
                      message={m}
                      sources={sourcesForMessages[sourceKey]}
                    ></ChatMessageBubble>)
          })
          : ""}
      </div>

      <form onSubmit={sendMessage} className="flex w-full flex-col">
        <div className="flex w-full mt-4">
          <input
            className="grow mr-2 p-2.5 rounded outline-none"
            value={input}
            placeholder={"Me faça uma pergunta!"}
            onChange={handleInputChange}
          />
          <button
            type="submit"
            className="shrink-0 px-4 bg-[#7159c1] rounded hover:brightness-110 transition-all"
          >
            <div role="status" className={`flex justify-center`}>
              {isLoading ? (
                <>
                  <svg
                    aria-hidden="true"
                    className="w-6 h-6 text-white animate-spin dark:text-white fill-sky-800"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </>
              ) : (
                <span>Send</span>
              )}
            </div>
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}
