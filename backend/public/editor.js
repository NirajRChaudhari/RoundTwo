document.addEventListener("DOMContentLoaded", function () {
  const socket = io();

  const editor = document.getElementById("editor");

  let currentText = "";

  const docName = window.location.pathname.split("/")[1] || "defaultDoc";

  const updateDocument = (text) => {
    currentText = text;
    editor.innerHTML = text;
    updateButtonStates();
  };

  socket.on("doc", updateDocument);

  socket.emit("join", docName);

  function debounce(func, timeout = 300) {
    let timer;

    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  }

  const sendEdit = () => {
    const newText = editor.innerHTML;

    if (newText !== currentText) {
      socket.emit("edit", {
        docName,
        text: newText,
      });

      currentText = newText;
    }
  };

  const debouncedSendEdit = debounce(sendEdit, 300);

  editor.addEventListener("input", debouncedSendEdit);

  const applyStyle = (command, value = null) => {
    document.execCommand(command, false, value);
    sendEdit();

    updateButtonStates();
  };

  function updateButtonStates() {
    const commands = ["bold", "italic", "underline"];

    commands.forEach((command) => {
      const button = document.getElementById(`${command}Btn`);

      if (document.queryCommandState(command)) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
  }

  ["bold", "italic", "underline"].forEach((command) => {
    const button = document.getElementById(`${command}Btn`);

    button.addEventListener("click", () => applyStyle(command));
  });

  editor.addEventListener("mouseup", updateButtonStates);

  editor.addEventListener("mousedown", updateButtonStates);
});
