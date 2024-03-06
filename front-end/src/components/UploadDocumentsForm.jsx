import { useState, useRef, useEffect } from "react";
import { ChevronLeft, FileText, Menu } from "lucide-react";

export function UploadDocumentsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [document, setDocument] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const formRef = useRef(null);
  const inputRef = useRef(null);

  const [formState, setFormState] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const handleFileInput = (event) => {
    setDocument(event.target.files[0]);
  };



  const ingest = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!document) {
      setErrorMessage("Selecione um documento para enviar");
      setIsLoading(false);
      return;
    }

    const isDocumentUploaded = uploadedDocuments.find(
      (doc) => doc.name === document.name,
    );

    if (isDocumentUploaded) {
      setErrorMessage("Este documento já foi enviado");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", document);
      
      const url = sessionStorage.getItem("ragChat@sessiorId")
        ? `/retriveal/ingest/${sessionStorage.getItem("ragChat@sessiorId")}`
        : "/retriveal/ingest";
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        console.log("Document ingested successfully");

        const data = await response.json()

        // Salva o nome do arquivo e o tamanho do arquivo no estado uploadedDocuments
        setUploadedDocuments((prevState) => {
          return [...prevState, { name: document.name, size: document.size }];
        });

        // Salva essas informações no sessionStorage
        sessionStorage.setItem(
          "uploadedDocuments",
          JSON.stringify(uploadedDocuments),
        );

        // Salva id recebido no sessionStorage
        if (!sessionStorage.getItem("ragChat@sessiorId"))
          sessionStorage.setItem("ragChat@sessiorId", data.uuid);

        setErrorMessage("");
        setDocument(null);
        if (inputRef.current) inputRef.current.value = "";
      } else if (response.status < 500) {
        console.error("Error ingesting document");
        console.log(await response.text())
        setErrorMessage("Erro ao enviar o documento! Recurso não encontrado.");
      }
    } catch (error) {
      console.error("Error ingesting document", error);
      setErrorMessage(
        "Erro ao enviar o documento! Tente novamente mais tarde.",
      );
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const savedDocuments = sessionStorage.getItem("uploadedDocuments");
    if (savedDocuments) {
      setUploadedDocuments(JSON.parse(savedDocuments));
    }

    if (window.innerWidth) setFormState(window.innerWidth > 768)

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        setFormState(true);
      } else {
        setFormState(false);
      }
    });

  }, []);

  return (
    <>
      <Menu className="w-8 h-8 aspect-square md:sr-only absolute top-4 left-4" onClick={e => setFormState(prev => !prev)} />

      <form
        onSubmit={ingest}
        ref={formRef}
        className={`absolute h-full top-0 bg-black/80 md:bg-transparent md:static flex flex-col md:w-full flex-1 p-4 gap-2.5 min-w-[200px] ${formState ? "animate-slideIn md:animate-none" : "-translate-x-full transition-all bg-transparent"}`}
      >

        <ChevronLeft className="w-8 h-8 aspect-square md:sr-only self-end" onClick={e => setFormState(prev => !prev)} />

        <input
          type="file"
          id="document-input"
          className="sr-only"
          accept=".pdf,.doc,.docx"
          onInput={handleFileInput}
          ref={inputRef}
        />

        <label htmlFor="document-input">
          <div className="w-48 md:w-full aspect-video flex flex-col gap-1 items-center p-2.5 justify-center ring-2 ring-white rounded cursor-pointer">
            <FileText />
            <span className="text-center text-xs">
              {document && document.name
                ? document.name.length > 15
                  ? document.name.substring(0, 15) +
                  "..." +
                  document.name.substring(document.name.length - 5)
                  : document.name
                : "Faça o upload de um documento"}
            </span>
          </div>
        </label>

        <button
          type="submit"
          className="shrink-0 p-2.5 bg-[#7159c1] rounded w-full hover:brightness-110 transition-all disabled:hover:brightness-75 disabled:brightness-75"
          disabled={isLoading || !document}
        >
          <div
            role="status"
            className={`${isLoading ? "" : "hidden"} flex justify-center`}
          >
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
          </div>
          <span className={isLoading ? "hidden" : ""}>Enviar</span>
        </button>

        <div className="flex flex-col gap-2.5 w-full">
          {uploadedDocuments.map((doc, index) => (
            <div
              key={index}
              className="flex justify-between items-center text-xs p-2.5 ring-2 ring-white rounded"
            >
              <FileText />
              <span>
                {doc.name.length > 10
                  ? doc.name.substring(0, 10) +
                  "..." +
                  doc.name.substring(doc.name.length - 5)
                  : doc.name}
              </span>
            </div>
          ))}
        </div>

        {errorMessage && (
          <div className="flex flex-col gap-2.5 w-full">
            <span className="text-red-500">{errorMessage}</span>
          </div>
        )}
      </form>
    </>
  );
}
