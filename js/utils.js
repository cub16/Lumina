// utils.js

function saveChanges() {
  localStorage.setItem("userData", JSON.stringify(userData));
}

function cleanUserNotes() {
  userData.notes = userData.notes.filter((note) => note != null);
}

function downloadString(filename, content) {
  const link = document.createElement("a");
  const file = new Blob([content], { type: "text/plain" });
  link.href = URL.createObjectURL(file);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function syncScroll(textareaElement, iframeElement) {
  if (!iframeElement || !iframeElement.contentWindow) {
    console.error("iframe is not properly initialized or loaded.");
    return;
  }

  const scrollTopPercentage =
    textareaElement.scrollTop /
    (textareaElement.scrollHeight - textareaElement.clientHeight);

  iframeElement.contentWindow.scrollTo(
    0,
    scrollTopPercentage *
      (iframeElement.contentDocument.documentElement.scrollHeight -
        iframeElement.clientHeight)
  );
}

function updateAction() {
  updateScreen($noteTitle.value || "Untitled Note", $noteWorkspace.value);
}

function updateScreen(title, content) {
  const titleInMarkdown = marked.parse(`> # ${title}`);
  const noteInMarkdown = marked.parse(content);

  Promise.all([
    fetch(APP_INFO.workspaceFont).then((res) => res.blob()),
    fetch(APP_INFO.workspaceCSS).then((res) => res.text()),
  ])
    .then(([fontBlob, cssText]) => {
      const customFontURL = URL.createObjectURL(fontBlob);

      const combinedHTML = `
      <!DOCTYPE html>
      <html data-theme='${userData.theme}'>
      <head>
        <meta charset="UTF-8">
        <title>Workspace</title>
        <style>
          ${cssText}
          @font-face {
            font-family: "Ubuntu";
            src: url('${customFontURL}');
          }
          *, h1, h2, h3, h4, h5, h6 {
            font-family: "Ubuntu";
          }
        </style>
      </head>
      <body>
        ${titleInMarkdown}
        <div class="container">
          ${noteInMarkdown}
        </div>
      </body>
      </html>
    `;
      const blob = new Blob([combinedHTML], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      $workspaceMarkdown.src = url;
      $workspaceMarkdown.onload = () => {
        syncScroll($noteWorkspace, $workspaceMarkdown);
        URL.revokeObjectURL(url);
        URL.revokeObjectURL(customFontURL);
      };
    })
    .catch((error) => {
      console.error("Error loading font or CSS:", error);
    });
}

function updateTheme() {
  document.body.className = `${userData.theme}-mode`;
  saveChanges();
}

function loadNotes() {
  $NOTES_VIEW.innerHTML = "";
  userData.notes.forEach((note, index) => {
    $NOTES_VIEW.innerHTML += `
      <br />
      <div class="note" onclick="openNote('${index}')">
        <span><br />${note.title}</span>
        <br /><br />
      </div>
      <button onclick="deleteNote('${index}')" class="normal-button red">X</button>
      <br /><br />
    `;
  });
}

function deleteNote(noteID) {
  const deletedNoteTitle = userData.notes[noteID].title;
  notiToast(`Note '${deletedNoteTitle}' deleted!`, "", "success");
  userData.notes.splice(noteID, 1);
  cleanUserNotes();
  loadNotes();
  saveChanges();
}

function notiToast(title, message, icon) {
  Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  }).fire({
    title: title,
    text: message,
    icon: icon,
  });
}
