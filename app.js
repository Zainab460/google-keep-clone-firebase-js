class Note {
  constructor(id, title, text) {
    this.id = id;
    this.title = title;
    this.text = text;
  }
}

class App {
  // FORM BINDING STARTS
  constructor() {
    this.notes = JSON.parse(localStorage.getItem("notes")) || [];
    this.$selectedNoteId = "";
    this.miniSidebar = true;

    this.$activeForm = document.querySelector(".active-form");
    this.$inactiveForm = document.querySelector(".inactive-form");
    this.$takeNote = document.querySelector("#take-note");
    this.$noteTitle = document.querySelector("#note-title");
    this.$notes = document.querySelector(".notes");
    this.$form = document.querySelector(".form");
    this.$closeModalForm = document.querySelector("#modal-btn");

    this.$modal = document.querySelector(".modal");
    this.$modalForm = document.querySelector("#modal-form");
    this.$modalTitle = document.querySelector("#modal-title");
    this.$modalText = document.querySelector("#modal-text");
    this.$sidebar = document.querySelector(".sidebar");
    this.sidebarActiveItem = document.querySelector(".active-item");

    this.$app = document.querySelector("#app");
    this.$firebaseAuthContainer = document.querySelector(
      "#firebaseui-auth-container"
    );
    this.$authUserText = document.querySelector(".auth-user");
    this.$logoutButton = document.querySelector(".logout");

    this.ui = new firebaseui.auth.AuthUI(auth);
    this.handleAuth();

    this.addEventListeners();
    this.render();
  }

  handleAuth() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.$authUserText.innerHTML = user.displayName;
        this.redirectToApp();
      } else {
        this.redirectToAuth();
      }
    });
  }

  redirectToApp() {
    this.$firebaseAuthContainer.style.display = "none";
    this.$app.style.display = "block";
  }
  redirectToAuth() {
    this.$firebaseAuthContainer.style.display = "block";
    this.$app.style.display = "none";

    this.ui.start("#firebaseui-auth-container", {
      signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      ],
    });
  }
  handleLogout() {
    firebase
      .auth()
      .signOut()
      .then(() => {
        this.redirectToAuth();
      })
      .catch((error) => {
        console.log("ERROR OCCURED", error);
      });
  }
  addEventListeners() {
    document.body.addEventListener("click", (event) => {
      this.handleFormClick(event);
      this.closeModal(event);
      this.openModal(event);
      this.handleArchiving(event);
    });

    this.$form.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = this.$takeNote.value;
      const text = this.$noteTitle.value;
      this.addNote({ title, text });
      this.closeActiveForm();
    });

    this.$modalForm.addEventListener("submit", (event) => {
      event.preventDefault();
    });
    this.$sidebar.addEventListener("mouseover", (event) => {
      this.handleToggleSidebar();
    });
    this.$sidebar.addEventListener("mouseout", (event) => {
      this.handleToggleSidebar();
    });

    this.$logoutButton.addEventListener("click", (event) => {
      this.handleLogout();
    });
  }
  handleFormClick(event) {
    const isActiveFormClickedOn = this.$activeForm.contains(event.target);
    const isInactiveFormClickedOn = this.$inactiveForm.contains(event.target);
    const title = this.$takeNote.value;
    const text = this.$noteTitle.value;

    if (isInactiveFormClickedOn) {
      this.openActiveForm();
    } else if (!isInactiveFormClickedOn && !isActiveFormClickedOn) {
      this.addNote({ title, text });
      this.closeActiveForm();
    }
  }
  openActiveForm() {
    this.$activeForm.style.display = "block";
    this.$inactiveForm.style.display = "none";
    this.$noteTitle.focus();
  }
  closeActiveForm() {
    this.$inactiveForm.style.display = "block";
    this.$activeForm.style.display = "none";
    this.$takeNote.value = "";
    this.$noteTitle.value = "";
  }

  openModal(event) {
    const $selectedNote = event.target.closest(".note");
    if ($selectedNote && !event.target.closest(".archive")) {
      this.selectedNoteId = $selectedNote.id;
      this.$modalTitle.value = $selectedNote.children[1].innerHTML;
      this.$modalText.value = $selectedNote.children[2].innerHTML;
      this.$modal.classList.add("open-modal");
    } else {
      return;
    }
  }
  closeModal(event) {
    const isModalFormClickedOn = this.$modalForm.contains(event.target);
    const isCloseModalBtnClickedOn = this.$closeModalForm.contains(
      event.target
    );
    if (
      (!isModalFormClickedOn || isCloseModalBtnClickedOn) &&
      this.$modal.classList.contains("open-modal")
    ) {
      this.editNote(this.selectedNoteId, {
        title: this.$modalTitle.value,
        text: this.$modalText.value,
      });
      this.$modal.classList.remove("open-modal");
    }
  }
  handleArchiving(event) {
    const $selectedNote = event.target.closest(".note");
    if ($selectedNote && event.target.closest(".archive")) {
      this.selectedNoteId = $selectedNote.id;
      this.deleteNote(this.selectedNoteId);
    } else {
      return;
    }
  }
  // FORM BINDING ENDS

  // ADD A NOTE STARTS
  addNote({ title, text }) {
    if (text != "") {
      const newNote = new Note(cuid(), title, text);
      this.notes = [...this.notes, newNote];
      this.render();
    }
  }

  editNote(id, { title, text }) {
    this.notes = this.notes.map((note) => {
      if (note.id == id) {
        note.title = title;
        note.text = text;
      }
      return note;
    });
    this.render();
  }

  deleteNote(id) {
    this.notes = this.notes.filter((note) => note.id != id);
    this.render();
  }
  handleMouseOverNote(element) {
    const $note = document.querySelector("#" + element.id);
    const $checkNote = $note.querySelector(".check-circle");
    const $noteFooter = $note.querySelector(".note-footer");
    $checkNote.style.visibility = "visible";
    $noteFooter.style.visibility = "visible";
  }
  handleMouseOutNote(element) {
    const $note = document.querySelector("#" + element.id);
    const $checkNote = $note.querySelector(".check-circle");
    const $noteFooter = $note.querySelector(".note-footer");
    $checkNote.style.visibility = "hidden";
    $noteFooter.style.visibility = "hidden";
  }

  handleToggleSidebar() {
    if (this.miniSidebar) {
      this.$sidebar.style.width = "250px";
      this.sidebarActiveItem.classList.add("side-active-item");
      this.miniSidebar = false;
      this.$sidebar.classList.add("sidebar-hover");
    } else if (!this.miniSidebar) {
      this.$sidebar.style.width = "80px";
      this.sidebarActiveItem.classList.remove("side-active-item");
      this.miniSidebar = true;
      this.$sidebar.classList.remove("sidebar-hover");
    }
  }
  saveNotes() {
    localStorage.setItem("notes", JSON.stringify(this.notes));
  }
  render() {
    this.saveNotes();
    this.displayNotes();
  }
  // onmouseover="app.handleMouseOverNote(this)" onmouseout="app.handleMouseOutNote(this)"

  displayNotes() {
    this.$notes.innerHTML = this.notes
      .map(
        (note) =>
          `
        <div class="note" id=${note.id} onmouseover="app.handleMouseOverNote(this)" onmouseout="app.handleMouseOutNote(this)">
          <span>
            <i class="material-icons check-circle">check_circle</i>
          </span>
          <div class="title">${note.title}</div>
          <div class="text">${note.text}</div>
          <div class="note-footer">
            <div class="tooltip">
              <span class="space"><i class="material-icons-outlined hover">add_alert</i></span>
              <span class="tooltip-text">Remind me</span>
            </div>
            <div class="tooltip">
              <span class="space"><i class="material-icons-outlined hover">person_add</i></span>
              <span class="tooltip-text">Collaborator</span>
            </div>
            <div class="tooltip">
              <span class="space"><i class="material-icons-outlined hover">palette</i></span>
              <span class="tooltip-text">Change Color</span>
            </div>
            <div class="tooltip">
              <span class="space"><i class="material-icons-outlined hover">image</i></span>
              <span class="tooltip-text">Add Image</span>
            </div>
            <div class="tooltip archive">
              <span class="space"><i class="material-icons-outlined hover">archive</i></span>
              <span class="tooltip-text ">Archive</span>
            </div>
            <div class="tooltip">
              <span class="space"><i class="material-icons-outlined hover">more_vert</i></span>
              <span class="tooltip-text">More</span>
            </div>
          </div>

        </div>
        
      </div>

    
      `
      )
      .join("");
  }
}

const app = new App();
