// ui.js

document.querySelector("#create-note").addEventListener("click", () => {
  editMode = "NEW";
  HOME_MENU.style.display = "none";
  NOTE_EDITOR.style.display = "block";
  SETTINGS_MENU.style.display = "none";
  noteWorkspace.value = "";
  updateWorkspaceIframe("");
  noteTitle.value = "";
});

importBtn.addEventListener("click", () => {
  document.querySelector("#real-import").click();
});

document.querySelector("#main-title").addEventListener("click", () => {
  userData.theme = userData.theme === "dark" ? "light" : "dark";
  updateTheme();
});

document.querySelector("#change-theme").addEventListener("click", () => {
  userData.theme = userData.theme === "dark" ? "light" : "dark";
  updateTheme();
});

document.querySelector("#real-import").addEventListener("change", (e) => {
  const file = e.target.files[0];
  let filePreview;
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const fileContentInString = event.target.result;
      filePreview = JSON.parse(fileContentInString);
      if (!filePreview.notes || !filePreview.theme) {
        Swal.fire({
          title: `Corrupt or damaged file`,
          icon: "error",
        });
        return;
      }
      Object.assign(userData, JSON.parse(fileContentInString));
      loadNotes();
      saveChanges();
      updateTheme();
      Swal.fire({
        title: `${userData.notes.length} notes imported successfully`,
        icon: "success",
      });
    };
    reader.readAsText(file);
  } else {
    console.log("No file selected");
  }
});

exportBtn.addEventListener("click", () => {
  if (userData.notes.length === 0) {
    Swal.fire({
      title: `No notes found to export`,
      icon: "error",
    });
    return;
  }
  Swal.fire({
    title: `${userData.notes.length} notes exported successfully`,
    icon: "success",
  });
  downloadString("MyNotes.json", JSON.stringify(userData));
});

noteWorkspace.addEventListener("input", () => {
  updateWorkspaceIframe(noteWorkspace.value);
});

noteWorkspace.addEventListener("scroll", () => {
  syncScroll(noteWorkspace, workspaceIFrame);
});

document.querySelector("#back-note-editor").addEventListener("click", () => {
  HOME_MENU.style.display = "block";
  NOTE_EDITOR.style.display = "none";
  SETTINGS_MENU.style.display = "none";
  loadNotes();
});

saveNote.addEventListener("click", () => {
  if (editMode === "NEW") {
    userData.notes.push({
      title: noteTitle.value || "Untitled Note",
      content: noteWorkspace.value,
    });
  } else if (editMode === "EDIT") {
    userData.notes[editingNote] = {
      title: noteTitle.value,
      content: noteWorkspace.value,
    };
  }

  NOTE_EDITOR.style.display = "none";
  HOME_MENU.style.display = "block";
  loadNotes();
  saveChanges();
});

function openNote(noteID) {
  editMode = "EDIT";
  editingNote = noteID;
  noteTitle.value = userData.notes[noteID].title;
  noteWorkspace.value = userData.notes[noteID].content;
  NOTE_EDITOR.style.display = "block";
  HOME_MENU.style.display = "none";
  updateWorkspaceIframe(noteWorkspace.value);
}

document.querySelector("#open-settings").addEventListener("click", () => {
  HOME_MENU.style.display = "none";
  NOTE_EDITOR.style.display = "none";
  SETTINGS_MENU.style.display = "block";
});

document.querySelector("#back-settings").addEventListener("click", () => {
  HOME_MENU.style.display = "block";
  SETTINGS_MENU.style.display = "none";
  NOTE_EDITOR.style.display = "none";
  loadNotes();
});

document
  .querySelector("#reset-factory-settings")
  .addEventListener("click", () => {
    Swal.fire({
      title: "Are you sure?",
      text: "All your data will be deleted",
      icon: "question",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Yes",
      denyButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        APP_INFO.resetFactorySettings();
        return;
      } else if (result.isDenied) {
        Swal.fire(
          "Your notes are safe",
          "Factory reset has been canceled",
          "success"
        );
      }
    });
  });

document.querySelector("#version").textContent = APP_INFO.version;

loadNotes();
updateTheme();
