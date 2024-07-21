// utils.js

function saveChanges() {
  localStorage.setItem("userData", JSON.stringify(userData));
}

function cleanUserNotes() {
  userData.notes = userData.notes.filter(
    (note) => note !== null && note !== undefined
  );
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

function updateWorkspaceIframe(content) {
  let customCSS;
  let customFont;

  const noteInMarkdown = marked.parse(content);

  fetch("style/Ubuntu-Regular.ttf")
    .then((res) => res.blob())
    .then((fontBlob) => {
      customFont = fontBlob;

      fetch("style/frameworks/pico.classless.slate.min.css")
        .then((res) => res.text())
        .then((text) => {
          customCSS = text;
          const combinedHTML = `
              <!DOCTYPE html>
              <html data-theme='${userData.theme}'>
              <head>
                <meta charset="UTF-8">
                <title>Workspace</title>
                <style>
                ${customCSS}
                @font-face {
                  font-family: "Ubuntu";
                  src: url('${URL.createObjectURL(customFont)}');
                }
                *, h1, h2, h3, h4, h5, h6{
                  font-family: "Ubuntu";
                }
                </style>
              </head>
              <body>
                ${noteInMarkdown}
              </body>
              </html>
            `;

          const blob = new Blob([combinedHTML], { type: "text/html" });
          const url = URL.createObjectURL(blob);

          workspaceIFrame.src = url;

          workspaceIFrame.onload = function () {
            syncScroll(noteWorkspace, workspaceIFrame);
          };

          URL.revokeObjectURL(url);
        });
    })
    .catch((error) => {
      console.error("Error loading font or CSS:", error);
    });
}

function updateTheme() {
  const body = document.body;
  const theme = userData.theme;

  body.className = `${theme}-mode`;

  saveChanges();
}

function loadNotes() {
  NOTES_VIEW.innerHTML = "";
  userData.notes.forEach((note, index) => {
    NOTES_VIEW.innerHTML += `
      <br />
      <div class="note" onclick="openNote('${index}')">
                  <span>
                    <br /> ${note.title}</span
                  >
                  <br /><br />
                </div>
                <button onclick="deleteNote('${index}')" class="normal-button red">X</button>
                <br /><br />
      <br />
                `;
  });
}

function deleteNote(noteID) {
  const deletedNoteTitle = userData.notes[noteID].title;
  Swal.fire({
    title: `"${deletedNoteTitle}" deleted successfully`,
    icon: "success",
  });
  userData.notes.splice(noteID, 1);
  cleanUserNotes();
  loadNotes();
  saveChanges();
}
