"use strict";

const items = [
  { id: 1, title: "Viết báo cáo HTML", dueDate: "2026-10-20", priority: "Cao", status: "pending" },
  { id: 2, title: "Ôn Flexbox", dueDate: "2026-10-23", priority: "Trung bình", status: "pending" },
  { id: 3, title: "Làm bài DOM", dueDate: "2026-10-19", priority: "Cao", status: "done" },
  { id: 4, title: "Đọc tài liệu CSS", dueDate: "2026-10-25", priority: "Thấp", status: "pending" },
  { id: 5, title: "Thiết kế trang cá nhân", dueDate: "2026-10-21", priority: "Trung bình", status: "done" }
];

let currentFilter = 'all';
let searchQuery = '';

// DOM Selectors
const taskForm = document.querySelector('#task-form');
const taskTitleInput = document.querySelector('#task-title');
const taskDateInput = document.querySelector('#task-date');
const taskPrioritySelect = document.querySelector('#task-priority');
const errorMsg = document.querySelector('#error-msg');

const searchInput = document.querySelector('#search-input');
const clearSearchBtn = document.querySelector('#clear-search');
const filterBtns = document.querySelectorAll('.btn-filter');
const taskListContainer = document.querySelector('#task-list');
const taskStatsEl = document.querySelector('#task-stats');

// Hàm chuyển định dạng date YYYY-MM-DD sang DD/MM/YYYY
function formatDateToVN(dateString) {
  if (!dateString) return 'Không có';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  if (taskDateInput) taskDateInput.min = today;

  renderTasks();
});

function updateStats() {
  if (!taskStatsEl) return;
  const total = items.length;
  const completed = items.filter(i => i.status === 'done').length;
  taskStatsEl.textContent = `Đã xong: ${completed}/${total}`;
}

function renderTasks() {
  taskListContainer.innerHTML = '';
  updateStats();

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesStatus = true;
    if (currentFilter === 'pending') matchesStatus = (item.status === 'pending');
    else if (currentFilter === 'completed') matchesStatus = (item.status === 'done');

    return matchesSearch && matchesStatus;
  });

  if (filteredItems.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.textContent = searchQuery ? 'Không tìm thấy công việc phù hợp.' : 'Chưa có công việc nào trong danh sách.';
    emptyLi.style.cssText = 'text-align: center; color: #64748b; padding: 20px; background: #f8fafc; border-radius: 8px; font-size: 0.9rem;';
    taskListContainer.appendChild(emptyLi);
    return;
  }

  filteredItems.forEach(item => {
    const li = document.createElement('li');
    li.className = `task-item ${item.status === 'done' ? 'completed' : ''}`;

    let badgeClass = 'badge-trung-binh';
    if (item.priority === 'Cao') badgeClass = 'badge-cao';
    if (item.priority === 'Thấp') badgeClass = 'badge-thap';

    const taskInfo = document.createElement('div');
    taskInfo.className = 'task-info';

    const titleEl = document.createElement('span');
    titleEl.className = 'task-title';
    titleEl.textContent = item.title;

    const metaEl = document.createElement('div');
    metaEl.className = 'task-meta';

    // Định dạng ngày dạng DD/MM/YYYY
    const formattedDate = formatDateToVN(item.dueDate);
    const dateSpan = document.createElement('span');
    dateSpan.textContent = `Hạn: ${formattedDate}`;

    const priorityBadge = document.createElement('span');
    priorityBadge.className = `badge ${badgeClass}`;
    priorityBadge.textContent = item.priority;

    metaEl.appendChild(dateSpan);
    metaEl.appendChild(priorityBadge);

    taskInfo.appendChild(titleEl);
    taskInfo.appendChild(metaEl);

    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn btn-done';
    toggleBtn.textContent = item.status === 'done' ? 'Hoàn tác' : 'Hoàn thành';
    toggleBtn.addEventListener('click', () => toggleTaskStatus(item.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-delete';
    deleteBtn.textContent = 'Xóa';
    deleteBtn.addEventListener('click', () => deleteTask(item.id));

    taskActions.appendChild(toggleBtn);
    taskActions.appendChild(deleteBtn);

    li.appendChild(taskInfo);
    li.appendChild(taskActions);

    taskListContainer.appendChild(li);
  });
}

if (taskForm) {
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const titleValue = taskTitleInput.value.trim();
    const dateValue = taskDateInput.value;
    const priorityValue = taskPrioritySelect.value;

    if (titleValue === '') {
      if (errorMsg) {
        errorMsg.textContent = 'Vui lòng nhập tên công việc!';
        errorMsg.style.display = 'block';
      }
      taskTitleInput.focus();
      return;
    }

    if (errorMsg) errorMsg.style.display = 'none';

    items.unshift({
      id: Date.now(),
      title: titleValue,
      dueDate: dateValue,
      priority: priorityValue,
      status: 'pending'
    });

    renderTasks();
    taskForm.reset();
    if (taskDateInput) taskDateInput.type = 'text';
  });
}

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    if (clearSearchBtn) clearSearchBtn.hidden = searchQuery === '';
    renderTasks();
  });
}

if (clearSearchBtn) {
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.hidden = true;
    searchInput.focus();
    renderTasks();
  });
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    currentFilter = btn.getAttribute('data-filter');
    renderTasks();
  });
});

function toggleTaskStatus(id) {
  const task = items.find(item => item.id === id);
  if (task) {
    task.status = (task.status === 'done') ? 'pending' : 'done';
    renderTasks();
  }
}

function deleteTask(id) {
  const task = items.find(item => item.id === id);
  if (!task) return;

  if (confirm(`Bạn có chắc chắn muốn xóa công việc "${task.title}"?`)) {
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items.splice(index, 1);
      renderTasks();
    }
  }
}