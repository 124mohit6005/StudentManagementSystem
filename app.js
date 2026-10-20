const seedStudents = [
  { name: 'Sophie Moore', email: 'sophie.moore@northwood.edu', id: 'STU-2048', course: 'Psychology', year: 'Year 2', attendance: 96, status: 'Active', photo: 'photo-1534528741775-53994a69daeb', tone: '#d8e8d9' },
  { name: 'Phoenix Baker', email: 'phoenix.baker@northwood.edu', id: 'STU-2047', course: 'Computer Science', year: 'Year 3', attendance: 88, status: 'Active', photo: 'photo-1500648767791-00dcc994a43e', tone: '#e9dfd1' },
  { name: 'Lana Steiner', email: 'lana.steiner@northwood.edu', id: 'STU-2046', course: 'Visual Arts', year: 'Year 1', attendance: 72, status: 'On leave', photo: 'photo-1531123897727-8f129e1688ce', tone: '#ead7d5' },
  { name: 'Demi Wilkinson', email: 'demi.wilkinson@northwood.edu', id: 'STU-2045', course: 'Biology', year: 'Year 4', attendance: 98, status: 'Active', photo: 'photo-1534751516642-a1af1ef26a56', tone: '#e5e2d3' },
  { name: 'Candice Wu', email: 'candice.wu@northwood.edu', id: 'STU-2044', course: 'English Literature', year: 'Year 2', attendance: 91, status: 'Active', photo: 'photo-1534528741775-53994a69daeb', tone: '#d6e5e2' },
];

const students = [...seedStudents];
const studentRows = document.querySelector('#studentRows');
const studentSearch = document.querySelector('#studentSearch');
const statusFilter = document.querySelector('#statusFilter');
const emptyState = document.querySelector('#emptyState');
const modal = document.querySelector('#studentModal');
const toast = document.querySelector('#toast');
const overviewView = document.querySelector('#overviewView');
const sectionView = document.querySelector('#sectionView');
let toastTimeout;
let calendarMonth = new Date(2025, 4, 1);
let activeMessage = 0;
const attendanceStatuses = new Map(seedStudents.map((student, index) => [student.id, ['Present', 'Present', 'Absent', 'Late', 'Present'][index]]));
const courses = [
  { name: 'Biology', department: 'Science', teacher: 'Dr. Maya Chen', room: 'Lab 204', students: 38, color: 'green', icon: 'flask-conical' },
  { name: 'Computer Science', department: 'Technology', teacher: 'Marcus Johnson', room: 'Room 312', students: 42, color: 'blue', icon: 'code-xml' },
  { name: 'English Literature', department: 'Humanities', teacher: 'Amara Okafor', room: 'Room 108', students: 34, color: 'rose', icon: 'book-open' },
  { name: 'Mathematics', department: 'Mathematics', teacher: 'Ethan Park', room: 'Room 221', students: 46, color: 'orange', icon: 'sigma' },
  { name: 'Psychology', department: 'Social sciences', teacher: 'Dr. Nina Patel', room: 'Room 115', students: 29, color: 'lilac', icon: 'brain' },
  { name: 'Visual Arts', department: 'Creative arts', teacher: 'Sofia Laurent', room: 'Studio 03', students: 24, color: 'teal', icon: 'palette' },
];
const messages = [
  { name: 'Maya Thompson', subject: 'Question about the spring attendance report', time: '10:24 AM', initials: 'MT', color: 'green', body: 'Hi Olivia, I noticed a discrepancy in the attendance totals for Year 2. Could you let me know when the latest report will be ready? Thank you!' },
  { name: 'James Wilson', subject: 'Field trip permission forms', time: 'Yesterday', initials: 'JW', color: 'orange', body: 'We are still waiting on a few permission forms for the science museum trip. Can you share the latest list with me?' },
  { name: 'Priya Shah', subject: 'Updated course materials', time: 'Yesterday', initials: 'PS', color: 'lilac', body: 'The revised materials for next week are ready. I have uploaded the new reading list for your review.' },
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function renderStudents() {
  const query = studentSearch.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;
  const filteredStudents = students.filter((student) => {
    const matchesQuery = `${student.name} ${student.email} ${student.id} ${student.course}`.toLowerCase().includes(query);
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
    return matchesQuery && matchesStatus;
  });

  studentRows.innerHTML = filteredStudents.map((student) => {
    const lowAttendance = student.attendance < 80;
    const rowBackground = student.photo
      ? `https://images.unsplash.com/${student.photo}?auto=format&fit=crop&w=96&q=80`
      : '';
    const initials = student.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
    return `
      <tr>
        <td><label class="checkbox-wrap"><input type="checkbox" class="student-checkbox" aria-label="Select ${escapeHtml(student.name)}"><span></span></label></td>
        <td><div class="student-cell"><img class="student-avatar" src="${rowBackground}" alt="" style="background:${escapeHtml(student.tone || '#e9f1e8')}" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="student-avatar-fallback" hidden>${escapeHtml(initials)}</span><span class="student-meta"><strong>${escapeHtml(student.name)}</strong><span>${escapeHtml(student.email)}</span></span></div></td>
        <td class="student-id">${escapeHtml(student.id)}</td>
        <td>${escapeHtml(student.course)}</td>
        <td>${escapeHtml(student.year)}</td>
        <td><div class="attendance-cell"><span>${student.attendance}%</span><span class="attendance-mini-track"><i class="${lowAttendance ? 'low' : ''}" style="width:${student.attendance}%"></i></span></div></td>
        <td><span class="status-pill ${student.status === 'On leave' ? 'on-leave' : ''}">${escapeHtml(student.status)}</span></td>
        <td><button class="row-menu" type="button" aria-label="More options for ${escapeHtml(student.name)}" data-student="${escapeHtml(student.name)}"><i data-lucide="ellipsis"></i></button></td>
      </tr>`;
  }).join('');

  emptyState.classList.toggle('hidden', filteredStudents.length > 0);
  studentRows.classList.toggle('hidden', filteredStudents.length === 0);
  document.querySelector('#resultSummary').textContent = `Showing ${filteredStudents.length} of ${students.length + 243} students`;
  document.querySelector('#studentCount').textContent = `${students.length + 243} students`;
  document.querySelector('#totalStudents').textContent = students.length + 243;
  document.querySelector('.nav-count').textContent = students.length + 243;
  document.querySelectorAll('.row-menu').forEach((button) => {
    button.addEventListener('click', () => showToast(`Student profile: ${button.dataset.student}`));
  });
  if (window.lucide) window.lucide.createIcons();
}

function showToast(message) {
  document.querySelector('#toastMessage').textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove('is-visible'), 2700);
}

function closeModal() {
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

function openModal() {
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  modal.querySelector('input[name="name"]').focus();
}

function studentTableRows(list) {
  return list.map((student) => `
    <tr>
      <td><div class="student-cell"><span class="directory-initials">${escapeHtml(student.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join(''))}</span><span class="student-meta"><strong>${escapeHtml(student.name)}</strong><span>${escapeHtml(student.email)}</span></span></div></td>
      <td class="student-id">${escapeHtml(student.id)}</td><td>${escapeHtml(student.course)}</td><td>${escapeHtml(student.year)}</td>
      <td><div class="attendance-cell"><span>${student.attendance}%</span><span class="attendance-mini-track"><i class="${student.attendance < 80 ? 'low' : ''}" style="width:${student.attendance}%"></i></span></div></td>
      <td><span class="status-pill ${student.status === 'On leave' ? 'on-leave' : ''}">${escapeHtml(student.status)}</span></td>
    </tr>`).join('');
}

function renderDirectory() {
  const query = sectionView.querySelector('#directorySearch').value.trim().toLowerCase();
  const status = sectionView.querySelector('#directoryStatus').value;
  const filtered = students.filter((student) => {
    const matchesText = `${student.name} ${student.email} ${student.id} ${student.course}`.toLowerCase().includes(query);
    return matchesText && (status === 'all' || student.status === status);
  });
  sectionView.querySelector('#directoryRows').innerHTML = studentTableRows(filtered);
  sectionView.querySelector('#directoryCount').textContent = `${filtered.length} records shown`;
  sectionView.querySelector('#directoryEmpty').classList.toggle('hidden', filtered.length > 0);
}

function renderAttendanceRows() {
  const query = sectionView.querySelector('#attendanceSearch').value.trim().toLowerCase();
  const list = students.filter((student) => `${student.name} ${student.id} ${student.course}`.toLowerCase().includes(query));
  sectionView.querySelector('#attendanceRows').innerHTML = list.map((student) => {
    const status = attendanceStatuses.get(student.id) || 'Not marked';
    return `<tr><td><div class="student-cell"><span class="directory-initials">${escapeHtml(student.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join(''))}</span><span class="student-meta"><strong>${escapeHtml(student.name)}</strong><span>${escapeHtml(student.course)}</span></span></div></td><td class="student-id">${escapeHtml(student.id)}</td><td><select class="attendance-select" data-attendance-id="${escapeHtml(student.id)}" aria-label="Attendance for ${escapeHtml(student.name)}"><option ${status === 'Present' ? 'selected' : ''}>Present</option><option ${status === 'Late' ? 'selected' : ''}>Late</option><option ${status === 'Absent' ? 'selected' : ''}>Absent</option><option ${status === 'Not marked' ? 'selected' : ''}>Not marked</option></select></td></tr>`;
  }).join('');
  sectionView.querySelectorAll('.attendance-select').forEach((select) => {
    select.addEventListener('change', () => {
      attendanceStatuses.set(select.dataset.attendanceId, select.value);
      updateAttendanceSummary();
    });
  });
  updateAttendanceSummary();
}

function updateAttendanceSummary() {
  const values = [...attendanceStatuses.values()];
  sectionView.querySelector('#attendancePresent').textContent = values.filter((status) => status === 'Present').length;
  sectionView.querySelector('#attendanceLate').textContent = values.filter((status) => status === 'Late').length;
  sectionView.querySelector('#attendanceAbsent').textContent = values.filter((status) => status === 'Absent').length;
}

function renderCalendar() {
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1;
    const currentMonth = day > 0 && day <= daysInMonth;
    const number = day <= 0 ? previousMonthDays + day : day > daysInMonth ? day - daysInMonth : day;
    const hasEvent = currentMonth && [5, 12, 19, 22, 27].includes(day);
    const today = currentMonth && year === 2025 && month === 4 && day === 19;
    return `<button class="calendar-day ${currentMonth ? '' : 'outside-month'} ${today ? 'today' : ''}" data-calendar-date="${currentMonth ? `${year}-${month + 1}-${day}` : ''}" ${currentMonth ? '' : 'disabled'}><span>${number}</span>${hasEvent ? '<i></i>' : ''}</button>`;
  }).join('');
  sectionView.querySelector('#calendarLabel').textContent = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  sectionView.querySelector('#calendarDays').innerHTML = cells;
  sectionView.querySelectorAll('.calendar-day[data-calendar-date]').forEach((button) => {
    button.addEventListener('click', () => {
      sectionView.querySelectorAll('.calendar-day.selected').forEach((day) => day.classList.remove('selected'));
      button.classList.add('selected');
      const [, monthNumber, dateNumber] = button.dataset.calendarDate.split('-');
      sectionView.querySelector('#selectedDateLabel').textContent = calendarMonth.toLocaleDateString('en-US', { month: 'long' }) + ` ${dateNumber}`;
    });
  });
}

function renderMessages() {
  const message = messages[activeMessage];
  sectionView.querySelector('#messageList').innerHTML = messages.map((item, index) => `
    <button class="message-item ${index === activeMessage ? 'is-selected' : ''}" data-message-index="${index}"><span class="message-avatar ${item.color}">${item.initials}</span><span class="message-preview"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.subject)}</span><small>${escapeHtml(item.time)}</small></span></button>`).join('');
  sectionView.querySelectorAll('.message-item').forEach((button) => button.addEventListener('click', () => {
    activeMessage = Number(button.dataset.messageIndex);
    renderMessages();
  }));
  sectionView.querySelector('#messageDetail').innerHTML = `<div class="message-detail-heading"><span class="message-avatar ${message.color}">${message.initials}</span><div><strong>${escapeHtml(message.name)}</strong><span>${escapeHtml(message.time)} · To Olivia</span></div><button class="more-button" aria-label="Message options"><i data-lucide="ellipsis"></i></button></div><h3>${escapeHtml(message.subject)}</h3><p>${escapeHtml(message.body)}</p><form id="replyForm" class="reply-form"><label for="replyText">Reply</label><textarea id="replyText" required placeholder="Write a reply..."></textarea><div><span>Replies are sent to ${escapeHtml(message.name.split(' ')[0])}</span><button class="primary-button" type="submit"><i data-lucide="send"></i><span>Send reply</span></button></div></form>`;
  sectionView.querySelector('#replyForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const reply = sectionView.querySelector('#replyText').value.trim();
    if (reply) {
      messages.splice(activeMessage + 1, 0, { name: 'You', subject: `Re: ${message.subject}`, time: 'Just now', initials: 'OR', color: 'teal', body: reply });
      activeMessage += 1;
      renderMessages();
      showToast('Your reply has been sent.');
    }
  });
}

function openMessageComposer() {
  sectionView.querySelector('#messageDetail').innerHTML = `<div class="message-detail-heading"><span class="message-avatar teal">OR</span><div><strong>New message</strong><span>From Olivia Rhye</span></div></div><form id="composeForm" class="compose-form"><label class="form-field"><span>To</span><input name="recipient" required placeholder="Staff member name"></label><label class="form-field"><span>Subject</span><input name="subject" required placeholder="What is this about?"></label><label class="form-field"><span>Message</span><textarea name="body" required placeholder="Write your message..."></textarea></label><div class="reply-form-actions"><span>Message your school community</span><button class="primary-button" type="submit"><i data-lucide="send"></i><span>Send message</span></button></div></form>`;
  sectionView.querySelector('#composeForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const recipient = String(formData.get('recipient')).trim();
    const subject = String(formData.get('subject')).trim();
    messages.unshift({ name: recipient, subject, time: 'Just now', initials: recipient.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase(), color: 'teal', body: String(formData.get('body')).trim() });
    activeMessage = 0;
    renderMessages();
    showToast(`Message sent to ${recipient}.`);
  });
  if (window.lucide) window.lucide.createIcons();
}

function viewMarkup(view) {
  const header = (eyebrow, title, description, action = '') => `<div class="section-view-heading"><div><p class="eyebrow"><span class="eyebrow-line"></span>${eyebrow}</p><h1>${title}</h1><p class="welcome-subtitle">${description}</p></div>${action}</div>`;
  if (view === 'Students') return `${header('STUDENT DIRECTORY', 'All students', 'Search profiles, review attendance, and manage enrollment.', '<button class="primary-button" id="directoryAddButton"><i data-lucide="plus"></i><span>Add student</span></button>')}<section class="panel section-panel"><div class="table-toolbar"><label class="search-box"><i data-lucide="search"></i><input id="directorySearch" type="search" placeholder="Search students..."></label><div class="table-controls"><label class="filter-select"><i data-lucide="list-filter"></i><select id="directoryStatus" aria-label="Filter by status"><option value="all">All statuses</option><option>Active</option><option>On leave</option></select><i data-lucide="chevron-down"></i></label><button class="export-button directory-export"><i data-lucide="download"></i><span>Export</span></button></div></div><div class="table-scroll"><table><thead><tr><th>STUDENT</th><th>ID</th><th>COURSE</th><th>YEAR</th><th>ATTENDANCE</th><th>STATUS</th></tr></thead><tbody id="directoryRows"></tbody></table><div id="directoryEmpty" class="empty-state hidden"><span><i data-lucide="search-x"></i></span><strong>No students found</strong><p>Try another search or status.</p></div></div><div class="table-footer"><span id="directoryCount"></span><span>Showing recently added student records</span></div></section>`;
  if (view === 'Attendance') return `${header('DAILY ROLL CALL', 'Attendance', 'Record today’s attendance and keep the register up to date.', '<button class="primary-button" id="markAllPresent"><i data-lucide="user-check"></i><span>Mark all present</span></button>')}<div class="summary-grid section-summary-grid"><article class="summary-card"><div class="summary-topline"><span>Present</span><span class="summary-icon green"><i data-lucide="user-check"></i></span></div><div class="summary-value-row"><strong id="attendancePresent">0</strong></div></article><article class="summary-card"><div class="summary-topline"><span>Late</span><span class="summary-icon orange"><i data-lucide="clock-3"></i></span></div><div class="summary-value-row"><strong id="attendanceLate">0</strong></div></article><article class="summary-card"><div class="summary-topline"><span>Absent</span><span class="summary-icon rose"><i data-lucide="user-round-x"></i></span></div><div class="summary-value-row"><strong id="attendanceAbsent">0</strong></div></article></div><section class="panel section-panel"><div class="students-heading"><div><h2>Monday, May 19, 2025</h2><p>Update a student’s status using the attendance menu.</p></div><label class="search-box"><i data-lucide="search"></i><input id="attendanceSearch" type="search" placeholder="Find a student..."></label></div><div class="table-scroll"><table><thead><tr><th>STUDENT</th><th>ID</th><th>STATUS</th></tr></thead><tbody id="attendanceRows"></tbody></table></div></section>`;
  if (view === 'Courses') return `${header('ACADEMIC PROGRAMS', 'Courses', 'Browse active classes and jump straight to their student roster.', '<span class="table-count course-total">6 active courses</span>')}<label class="search-box course-search"><i data-lucide="search"></i><input id="courseSearch" type="search" placeholder="Search courses or departments..."></label><div class="course-grid" id="courseGrid"></div>`;
  if (view === 'Reports') return `${header('SCHOOL INSIGHTS', 'Reports', 'A clear snapshot of enrollment and attendance this term.')}<div class="summary-grid section-summary-grid"><article class="summary-card"><div class="summary-topline"><span>Enrolled students</span><span class="summary-icon green"><i data-lucide="users-round"></i></span></div><div class="summary-value-row"><strong>${students.length + 243}</strong><span class="change-pill positive">+8.2%</span></div><p class="summary-note">Across all four year groups</p></article><article class="summary-card"><div class="summary-topline"><span>Average attendance</span><span class="summary-icon orange"><i data-lucide="calendar-check-2"></i></span></div><div class="summary-value-row"><strong>89.4%</strong></div><p class="summary-note">Up 2.4% from last term</p></article><article class="summary-card"><div class="summary-topline"><span>Active courses</span><span class="summary-icon lavender"><i data-lucide="notebook-tabs"></i></span></div><div class="summary-value-row"><strong>18</strong></div><p class="summary-note">Across six departments</p></article></div><section class="panel section-panel report-panel"><div><span class="summary-icon green"><i data-lucide="file-spreadsheet"></i></span><h2>Student roster export</h2><p>Download the current student records as a CSV file for your school reports.</p><button class="primary-button" id="reportExport"><i data-lucide="download"></i><span>Download student CSV</span></button></div><div class="report-stamp"><i data-lucide="chart-no-axes-combined"></i><span>SPRING TERM</span><strong>2024–25</strong></div></section>`;
  if (view === 'Calendar') return `${header('SCHOOL SCHEDULE', 'Calendar', 'Keep key dates, events, and school activities in one place.', '<button class="export-button" id="calendarToday"><i data-lucide="calendar-days"></i><span>Today</span></button>')}<section class="panel calendar-panel"><div class="calendar-heading"><button class="icon-button" id="calendarPrevious" aria-label="Previous month"><i data-lucide="chevron-left"></i></button><h2 id="calendarLabel"></h2><button class="icon-button" id="calendarNext" aria-label="Next month"><i data-lucide="chevron-right"></i></button></div><div class="calendar-weekdays"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div><div class="calendar-days" id="calendarDays"></div><div class="calendar-agenda"><div class="agenda-title"><h3>Selected day</h3><span id="selectedDateLabel">May 19</span></div><article><span class="agenda-time">09:00</span><span class="agenda-marker green-marker"></span><div><strong>Morning assembly</strong><span>Main hall · All year groups</span></div></article><article><span class="agenda-time">13:30</span><span class="agenda-marker orange-marker"></span><div><strong>Faculty meeting</strong><span>Room 204 · Teaching staff</span></div></article></div></section>`;
  if (view === 'Messages') return `${header('SCHOOL INBOX', 'Messages', 'Conversations with your school community.', '<button class="primary-button" id="composeMessage"><i data-lucide="square-pen"></i><span>Compose</span></button>')}<section class="panel messages-panel"><div class="message-list" id="messageList"></div><div class="message-detail" id="messageDetail"></div></section>`;
  return `${header('PREFERENCES', 'Settings', 'Manage your school profile and notification preferences.')}<form id="settingsForm" class="panel settings-panel"><div class="settings-group"><div><h2>School profile</h2><p>These details appear across your workspace.</p></div><label class="form-field"><span>School name</span><input name="schoolName" value="Northwood High" required></label><label class="form-field"><span>Campus</span><input name="campus" value="West Campus" required></label><label class="form-field"><span>Academic year</span><select name="academicYear"><option>2024–2025</option><option>2025–2026</option><option>2026–2027</option></select></label></div><div class="settings-group"><div><h2>Notifications</h2><p>Choose which school updates reach your inbox.</p></div><label class="setting-toggle"><span><strong>Attendance alerts</strong><small>Notify me about students with repeated absences</small></span><input type="checkbox" name="attendanceAlerts" checked></label><label class="setting-toggle"><span><strong>New student updates</strong><small>Notify me when a student profile is created</small></span><input type="checkbox" name="studentAlerts" checked></label><label class="setting-toggle"><span><strong>Weekly summary</strong><small>Send a Monday overview of school activity</small></span><input type="checkbox" name="weeklySummary"></label></div><div class="settings-actions"><span id="settingsSaved" aria-live="polite"></span><button class="primary-button" type="submit"><i data-lucide="save"></i><span>Save changes</span></button></div></form>`;
}

function renderCourses() {
  const query = sectionView.querySelector('#courseSearch').value.trim().toLowerCase();
  const filtered = courses.filter((course) => `${course.name} ${course.department} ${course.teacher}`.toLowerCase().includes(query));
  sectionView.querySelector('#courseGrid').innerHTML = filtered.map((course) => `<article class="course-card"><div class="course-card-top"><span class="course-icon ${course.color}"><i data-lucide="${course.icon}"></i></span><span class="table-count">${course.department}</span></div><h2>${course.name}</h2><p>${course.teacher} · ${course.room}</p><div class="course-card-footer"><span><i data-lucide="users-round"></i>${course.students} students</span><a href="#students" data-course-search="${escapeHtml(course.name)}">View roster <i data-lucide="arrow-up-right"></i></a></div></article>`).join('');
  sectionView.querySelector('#courseGrid').querySelectorAll('[data-course-search]').forEach((link) => link.addEventListener('click', () => {
    window.setTimeout(() => {
      const search = document.querySelector('#studentSearch');
      search.value = link.dataset.courseSearch;
      search.dispatchEvent(new Event('input'));
    }, 0);
  }));
  sectionView.querySelector('#courseGrid').classList.toggle('is-empty', filtered.length === 0);
  if (window.lucide) window.lucide.createIcons();
}

function setupSection(view) {
  if (view === 'Students') {
    sectionView.querySelector('#directoryAddButton').addEventListener('click', openModal);
    sectionView.querySelector('#directorySearch').addEventListener('input', renderDirectory);
    sectionView.querySelector('#directoryStatus').addEventListener('change', renderDirectory);
    sectionView.querySelector('.directory-export').addEventListener('click', exportStudents);
    renderDirectory();
  } else if (view === 'Attendance') {
    sectionView.querySelector('#attendanceSearch').addEventListener('input', renderAttendanceRows);
    sectionView.querySelector('#markAllPresent').addEventListener('click', () => {
      students.forEach((student) => attendanceStatuses.set(student.id, 'Present'));
      renderAttendanceRows();
      showToast('All listed students marked present.');
    });
    renderAttendanceRows();
  } else if (view === 'Courses') {
    sectionView.querySelector('#courseSearch').addEventListener('input', renderCourses);
    renderCourses();
  } else if (view === 'Reports') {
    sectionView.querySelector('#reportExport').addEventListener('click', exportStudents);
  } else if (view === 'Calendar') {
    sectionView.querySelector('#calendarPrevious').addEventListener('click', () => { calendarMonth.setMonth(calendarMonth.getMonth() - 1); renderCalendar(); });
    sectionView.querySelector('#calendarNext').addEventListener('click', () => { calendarMonth.setMonth(calendarMonth.getMonth() + 1); renderCalendar(); });
    sectionView.querySelector('#calendarToday').addEventListener('click', () => { calendarMonth = new Date(2025, 4, 1); renderCalendar(); showToast('Showing today, May 19.'); });
    renderCalendar();
  } else if (view === 'Messages') {
    renderMessages();
    sectionView.querySelector('#composeMessage').addEventListener('click', openMessageComposer);
  } else if (view === 'Settings') {
    const saved = JSON.parse(localStorage.getItem('campusly-settings') || '{}');
    for (const [name, value] of Object.entries(saved)) {
      const field = sectionView.querySelector(`[name="${name}"]`);
      if (field) field.type === 'checkbox' ? field.checked = value : field.value = value;
    }
    sectionView.querySelector('#settingsForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const settings = Object.fromEntries(new FormData(event.currentTarget));
      for (const checkbox of event.currentTarget.querySelectorAll('input[type="checkbox"]')) settings[checkbox.name] = checkbox.checked;
      localStorage.setItem('campusly-settings', JSON.stringify(settings));
      document.querySelector('.school-details strong').textContent = settings.schoolName;
      document.querySelector('.school-details > span').textContent = settings.campus;
      sectionView.querySelector('#settingsSaved').textContent = 'Changes saved';
      showToast('Your settings have been saved.');
    });
  }
  if (window.lucide) window.lucide.createIcons();
}

function navigateTo(view, updateHistory = true) {
  const allowedViews = ['Overview', 'Students', 'Attendance', 'Courses', 'Reports', 'Calendar', 'Messages', 'Settings'];
  const nextView = allowedViews.includes(view) ? view : 'Overview';
  overviewView.classList.toggle('hidden', nextView !== 'Overview');
  sectionView.classList.toggle('hidden', nextView === 'Overview');
  document.querySelector('#currentView').textContent = nextView;
  document.querySelectorAll('.nav-item').forEach((link) => link.classList.toggle('is-active', link.dataset.view === nextView));
  document.querySelector('#sidebar').classList.remove('is-open');
  if (nextView !== 'Overview') {
    sectionView.innerHTML = viewMarkup(nextView);
    setupSection(nextView);
  }
  if (updateHistory && window.location.hash !== `#${nextView.toLowerCase()}`) window.history.pushState({ view: nextView }, '', `#${nextView.toLowerCase()}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function exportStudents() {
  const headers = ['Name', 'Email', 'Student ID', 'Course', 'Year', 'Attendance', 'Status'];
  const rows = students.map((student) => [student.name, student.email, student.id, student.course, student.year, `${student.attendance}%`, student.status]);
  const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
  const downloadUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'campusly-students.csv';
  link.click();
  URL.revokeObjectURL(downloadUrl);
  showToast('Student list exported as CSV.');
}

studentSearch.addEventListener('input', renderStudents);
statusFilter.addEventListener('change', renderStudents);
document.querySelector('#addStudentButton').addEventListener('click', openModal);
document.querySelector('#closeModalButton').addEventListener('click', closeModal);
document.querySelector('#cancelModalButton').addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    studentSearch.focus();
  }
});

document.querySelector('#studentForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const name = String(formData.get('name')).trim();
  students.unshift({
    name,
    email: String(formData.get('email')).trim(),
    id: `STU-${String(2049 + students.length - seedStudents.length).padStart(4, '0')}`,
    course: String(formData.get('course')),
    year: String(formData.get('year')),
    attendance: 100,
    status: 'Active',
    tone: '#e9f1e8',
  });
  event.currentTarget.reset();
  studentSearch.value = '';
  statusFilter.value = 'all';
  renderStudents();
  if (document.querySelector('#currentView').textContent === 'Students') renderDirectory();
  if (document.querySelector('#currentView').textContent === 'Attendance') renderAttendanceRows();
  closeModal();
  showToast(`${name} was added to your students.`);
});

document.querySelector('#selectAll').addEventListener('change', (event) => {
  document.querySelectorAll('.student-checkbox').forEach((checkbox) => {
    checkbox.checked = event.currentTarget.checked;
  });
});

document.querySelector('#exportButton').addEventListener('click', exportStudents);

document.querySelectorAll('.nav-item').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    navigateTo(link.dataset.view);
  });
});

document.addEventListener('click', (event) => {
  const routeLink = event.target.closest('a[href^="#"]');
  if (!routeLink || routeLink.classList.contains('nav-item')) return;
  const view = {
    '#overview': 'Overview', '#students': 'Students', '#attendance': 'Attendance',
    '#courses': 'Courses', '#reports': 'Reports', '#calendar': 'Calendar',
    '#messages': 'Messages', '#settings': 'Settings',
  }[routeLink.getAttribute('href')];
  if (view) {
    event.preventDefault();
    navigateTo(view);
  }
});

window.addEventListener('popstate', () => {
  const slug = window.location.hash.slice(1).toLowerCase();
  const view = [...document.querySelectorAll('.nav-item')].find((link) => link.getAttribute('href') === `#${slug}`)?.dataset.view || 'Overview';
  navigateTo(view, false);
});

document.querySelector('#mobileMenuButton').addEventListener('click', () => {
  document.querySelector('#sidebar').classList.toggle('is-open');
});

document.querySelector('#chartPeriod').addEventListener('change', (event) => {
  const currentLine = document.querySelector('.current-line');
  const area = document.querySelector('.chart-area');
  const isTerm = event.currentTarget.value === 'term';
  const yearPath = 'M0 143 C38 137 43 119 82 123 S128 132 165 108 S211 115 247 91 S293 99 330 76 S376 91 412 65 S458 75 495 53 S541 66 577 39 S623 48 660 24';
  const termPath = 'M0 125 C45 115 55 130 110 99 S175 111 220 82 S285 91 330 68 S385 84 440 51 S510 60 555 36 S620 40 660 18';
  const nextPath = isTerm ? termPath : yearPath;
  currentLine.setAttribute('d', nextPath);
  area.setAttribute('d', `${nextPath} V180 H0Z`);
});

renderStudents();
const initialSlug = window.location.hash.slice(1).toLowerCase();
const initialView = [...document.querySelectorAll('.nav-item')].find((link) => link.getAttribute('href') === `#${initialSlug}`)?.dataset.view || 'Overview';
navigateTo(initialView, false);
if (window.lucide) window.lucide.createIcons();