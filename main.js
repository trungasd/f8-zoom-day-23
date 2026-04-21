const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const openModal = $(".add-btn");
const formModal = $("#addTaskModal");
const closeModal = $(".modal-close");
const cancelModal = $(".btn-cancel");
const todoForm = $(".todo-app-form");
const todoList = $("#todoList");
const searchInput = $(".search-input");
const tabBtns = $$(".tab-button");

let editIndex = null;
let currentTab = "active";

//Khi click vào tab
tabBtns.forEach((btn) => {
  btn.onclick = function () {
    $(".tab-button.active").classList.remove("active");
    this.classList.add("active");
    currentTab = this.dataset.type;
    renderByTab();
  };
});

//Xử lý render theo tab
function renderByTab() {
  let tasks = todoTasks;

  if (currentTab === "completed") {
    tasks = tasks.filter((task) => task.isCompleted);
  } else {
    tasks = tasks.filter((task) => !task.isCompleted);
  }

  renderTasks(tasks);
}

//Tìm kiếm Task
searchInput.oninput = function (event) {
  let tasks = todoTasks;
  const searchValue = event.target.value.toLowerCase().trim();

  if (currentTab === "completed") {
    tasks = tasks.filter((task) => task.isCompleted);
  } else {
    tasks = tasks.filter((task) => !task.isCompleted);
  }

  if (searchValue) {
    tasks = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchValue) ||
        task.description.toLowerCase().includes(searchValue),
    );
  }

  renderTasks(tasks);
};

//Xử lý mở form
function openFormModal() {
  formModal.className = "modal-overlay show";
  setTimeout(() => {
    $("#taskTitle").focus();
  }, 100);
}

//Xử lý đóng form
function closeFormModal() {
  formModal.className = "modal-overlay";

  const formTitle = formModal.querySelector(".modal-title");
  if (formTitle) {
    formTitle.textContent = formTitle.dataset.original || formTitle.textContent;
    delete formTitle.dataset.original;
  }

  const btnSubmit = formModal.querySelector(".btn-submit");
  if (btnSubmit) {
    btnSubmit.textContent = btnSubmit.dataset.original || btnSubmit.textContent;
    delete btnSubmit.dataset.original;
  }

  todoForm.reset();
  editIndex = null;
}

//Mở form Modal
openModal.onclick = openFormModal;

//Đóng form Modal
closeModal.onclick = closeFormModal;
cancelModal.onclick = closeFormModal;

const todoTasks = JSON.parse(localStorage.getItem("todoTasks") || "[]");

//Xử lý khi form Submit
todoForm.onsubmit = function (event) {
  event.preventDefault();

  //Lấy toàn bộ form data
  const formData = Object.fromEntries(new FormData(todoForm));

  const titleNew = formData.title.toLowerCase().trim();

  //Kiểm tra xem tiêu đề đã tồn tại chưa
  const isLikeWord = todoTasks.some((task, index) => {
    if (editIndex !== null && index == editIndex) return false;
    return task.title.toLowerCase().trim() === titleNew;
  });

  if (isLikeWord) {
    return alert("Tiêu đề đã tồn tại");
  }

  //Kiểm tra xem có phải đang edit không
  if (editIndex !== null) {
    todoTasks[editIndex] = formData;
  } else {
    formData.isCompleted = false;
    todoTasks.unshift(formData);
  }

  saveTasks();
  closeFormModal();
  renderByTab();
};

//Lưu dữ liệu vào localStorage
function saveTasks() {
  localStorage.setItem("todoTasks", JSON.stringify(todoTasks));
}

//Xử lý khi click vào task
todoList.onclick = function (event) {
  const editBtn = event.target.closest(".edit-btn");
  const deleteBtn = event.target.closest(".delete-btn");
  const completeBtn = event.target.closest(".complete-btn");

  //Cập nhật Task
  if (editBtn) {
    const taskIndex = editBtn.dataset.index;
    const task = todoTasks[taskIndex];

    editIndex = taskIndex;

    for (const key in task) {
      const value = task[key];
      const inputElement = $(`[name=${key}]`);
      if (inputElement) {
        inputElement.value = value;
      }
    }

    const formTitle = formModal.querySelector(".modal-title");
    if (formTitle) {
      formTitle.dataset.original = formTitle.textContent;
      formTitle.textContent = "Edit Task";
    }

    const btnSubmit = formModal.querySelector(".btn-submit");
    if (btnSubmit) {
      btnSubmit.dataset.original = btnSubmit.textContent;
      btnSubmit.textContent = "Save Changes";
    }

    openFormModal();
  }

  //Xóa Task
  if (deleteBtn) {
    const taskIndex = deleteBtn.dataset.index;
    const task = todoTasks[taskIndex];

    if (confirm(`Bạn có chắc chắn xóa task '${task.title}' không ?`)) {
      todoTasks.splice(taskIndex, 1);
      saveTasks();
      renderByTab();
    }
  }

  //Hoàn thành Task
  if (completeBtn) {
    const taskIndex = completeBtn.dataset.index;
    const task = todoTasks[taskIndex];

    task.isCompleted = !task.isCompleted;
    saveTasks();
    renderByTab();
  }
};

//Render dữ liệu ra màn hình
function renderTasks(tasks = todoTasks) {
  if (!tasks.length) {
    todoList.innerHTML = "<p>Không có công việc nào</p>";
    return;
  }

  const html = tasks
    .map((task) => {
      const index = todoTasks.indexOf(task);
      return `
        <div class="task-card ${task.color} ${task.isCompleted ? "completed" : ""}">
            <div class="task-header">
                <h3 class="task-title">${task.title}</h3>
                <button class="task-menu">
                <i class="fa-solid fa-ellipsis fa-icon"></i>
                <div class="dropdown-menu">
                    <div class="dropdown-item edit-btn ${task.isCompleted ? "disabled" : ""}" data-index="${index}">
                    <i class="fa-solid fa-pen-to-square fa-icon"></i>
                    Edit
                    </div>
                    <div class="dropdown-item complete complete-btn" data-index="${index}">
                    <i class="fa-solid fa-check fa-icon"></i>
                    ${task.isCompleted ? "Mark as Active" : "Mark as Complete"}
                    </div>
                    <div class="dropdown-item delete delete-btn" data-index="${index}">
                    <i class="fa-solid fa-trash fa-icon"></i>
                    Delete
                    </div>
                </div>
                </button>
            </div>
            <p class="task-description">
                ${task.description}
            </p>
            <div class="task-time">${task.startTime} - ${task.endTime}</div>
        </div>`;
    })
    .join("");

  todoList.innerHTML = html;
}

renderByTab();
