"use strict";
// Dữ liệu khởi tạo. Được phép chỉnh sửa hoặc thêm thuộc tính nếu cần.
const items = [
  {
    "id": 1,
    "title": "Viết báo cáo HTML",
    "dueDate": "2026-10-20",
    "priority": "Cao",
    "status": "pending"
  },
  {
    "id": 2,
    "title": "Ôn Flexbox",
    "dueDate": "2026-10-23",
    "priority": "Trung bình",
    "status": "pending"
  },
  {
    "id": 3,
    "title": "Làm bài DOM",
    "dueDate": "2026-10-19",
    "priority": "Cao",
    "status": "done"
  },
  {
    "id": 4,
    "title": "Đọc tài liệu CSS",
    "dueDate": "2026-10-25",
    "priority": "Thấp",
    "status": "pending"
  },
  {
    "id": 5,
    "title": "Thiết kế trang cá nhân",
    "dueDate": "2026-10-21",
    "priority": "Trung bình",
    "status": "done"
  }
];

let nextId = items.length + 1;

// ===== DOM =====
const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const dueInput = document.querySelector("#task-due");
const priorityInput = document.querySelector("#task-priority");
const errorMsg = document.querySelector("#error-msg");
const searchInput = document.querySelector("#search-input");
const statusFilter = document.querySelector("#status-filter");
const taskList = document.querySelector("#task-list");
const emptyMsg = document.querySelector("#empty-msg");

// ===== Tiện ích =====
function priorityClass(priority) {
  if (priority === "Cao") return "cao";
  if (priority === "Thấp") return "thap";
  return "trung-binh";
}

// Ngày hôm nay (giờ địa phương) dạng yyyy-mm-dd
function todayString() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + month + "-" + day;
}

// C3: tìm kiếm (không phân biệt hoa/thường) + lọc trạng thái
function getVisibleItems() {
  const keyword = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;
  return items.filter(function (item) {
    const matchTitle = item.title.toLowerCase().includes(keyword);
    const matchStatus = status === "all" || item.status === status;
    return matchTitle && matchStatus;
  });
}

// C1: hiển thị dữ liệu từ mảng lên DOM
function render() {
  const visible = getVisibleItems();
  taskList.innerHTML = "";

  visible.forEach(function (item) {
    const pc = priorityClass(item.priority);
    const isDone = item.status === "done";

    const li = document.createElement("li");
    li.className = "task-item" + (isDone ? " done" : "");

    const info = document.createElement("div");
    info.className = "task-info";

    const title = document.createElement("div");
    title.className = "task-name";
    title.textContent = item.title;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const badge = document.createElement("span");
    badge.className = "badge " + pc;
    badge.textContent = item.priority;

    meta.append(
      document.createTextNode("Hạn: " + (item.dueDate || "Không có") + " | Ưu tiên: "),
      badge
    );
    info.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const doneBtn = document.createElement("button");
    doneBtn.type = "button";
    doneBtn.className = "btn btn-done";
    doneBtn.textContent = isDone ? "Hoàn tác" : "Hoàn thành";
    doneBtn.addEventListener("click", function () {
      toggleStatus(item.id);
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn btn-delete";
    delBtn.textContent = "Xóa";
    delBtn.addEventListener("click", function () {
      removeItem(item.id);
    });

    actions.append(doneBtn, delBtn);
    li.append(info, actions);
    taskList.appendChild(li);
  });

  emptyMsg.hidden = visible.length > 0;
}

// C4: cập nhật trạng thái theo ID
function toggleStatus(id) {
  const item = items.find(function (it) { return it.id === id; });
  if (item) {
    item.status = item.status === "done" ? "pending" : "done";
    render();
  }
}

// C4: xóa theo ID
function removeItem(id) {
  const index = items.findIndex(function (it) { return it.id === id; });
  if (index !== -1) {
    items.splice(index, 1);
    render();
  }
}

// C2: đọc form, kiểm tra, thêm bản ghi
function addItem(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  if (title === "") {
    errorMsg.textContent = "Vui lòng nhập tên công việc!";
    titleInput.focus();
    return;
  }

  if (dueInput.value !== "" && dueInput.value < todayString()) {
    errorMsg.textContent = "Hạn hoàn thành không được là ngày trong quá khứ!";
    dueInput.focus();
    return;
  }

  errorMsg.textContent = "";
  items.push({
    id: nextId++,
    title: title,
    dueDate: dueInput.value,
    priority: priorityInput.value,
    status: "pending"
  });

  form.reset();
  priorityInput.value = "Trung bình";
  render();
}

// ===== Sự kiện =====
form.addEventListener("submit", addItem);
titleInput.addEventListener("input", function () {
  if (titleInput.value.trim() !== "") errorMsg.textContent = "";
});
searchInput.addEventListener("input", render);
statusFilter.addEventListener("change", render);

// Không cho chọn ngày trong quá khứ trên ô chọn ngày
dueInput.min = todayString();
dueInput.addEventListener("input", function () {
  if (dueInput.value >= todayString()) errorMsg.textContent = "";
});

// Hiển thị lần đầu
render();
