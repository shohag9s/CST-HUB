// Global App Data Store
let students = JSON.parse(localStorage.getItem('cmt_students_db')) || [];
let attendanceRecords = JSON.parse(localStorage.getItem('cmt_attendance_db')) || {};
let currentViewMode = 'grid';

// Initial Sample Computer Department Data
const sampleData = [
    { id: "1", name: "গাজী শাহরিয়ার", roll: "654321", reg: "1502012345", semester: "6th", shift: "1st Shift", group: "Group A", phone: "01712345678", blood: "A+", cgpa: "3.85", github: "https://github.com" },
    { id: "2", name: "আব্দুল্লাহ আল মামুন", roll: "654322", reg: "1502012346", semester: "4th", shift: "2nd Shift", group: "Group B", phone: "01812345679", blood: "B+", cgpa: "3.60", github: "" },
    { id: "3", name: "ফারজানা আক্তার", roll: "654323", reg: "1502012347", semester: "6th", shift: "1st Shift", group: "Group A", phone: "01912345680", blood: "O+", cgpa: "3.90", github: "" }
];

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    if (students.length === 0) {
        students = sampleData;
        saveData();
    }
    renderStudents();
    updateStats();
    
    // Set todays date in attendance
    const datePicker = document.getElementById('attendance-date');
    if (datePicker) {
        datePicker.value = new Date().toISOString().split('T')[0];
        renderAttendanceTable();
    }
});

function saveData() {
    localStorage.setItem('cmt_students_db', JSON.stringify(students));
    localStorage.setItem('cmt_attendance_db', JSON.stringify(attendanceRecords));
    updateStats();
}

// Navigation Tab Switcher
function switchTab(tabName) {
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

    const titles = {
        'list': 'কম্পিউটার টেকনোলজি শিক্ষার্থী তালিকা',
        'add': 'নতুন শিক্ষার্থী যোগ',
        'attendance': 'উপস্থিতি ট্র্যাকার'
    };

    document.getElementById('page-title').innerText = titles[tabName] || 'CMT Directory';
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    const activeNavIndex = {'list':0, 'add':1, 'attendance':2}[tabName];
    if(activeNavIndex !== undefined) {
        document.querySelectorAll('.nav-item')[activeNavIndex].classList.add('active');
    }

    if(tabName === 'attendance') renderAttendanceTable();
}

// Render Student Directory
function renderStudents(filteredData = null) {
    const list = filteredData || students;
    const container = document.getElementById('students-container');
    const emptyState = document.getElementById('empty-state');

    container.innerHTML = '';

    if (list.length === 0) {
        emptyState.classList.remove('hidden');
        container.classList.add('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    container.classList.remove('hidden');

    if (currentViewMode === 'grid') {
        container.className = 'grid-view';
        list.forEach(student => {
            const card = document.createElement('div');
            card.className = 'student-card';
            card.innerHTML = `
                <div class="card-top">
                    <div class="avatar">${student.name.charAt(0)}</div>
                    <div class="card-title">
                        <h3 onclick="viewProfile('${student.id}')">${student.name}</h3>
                        <span class="badge badge-shift">${student.shift}</span>
                        <span class="badge badge-group">${student.group || 'Group A'}</span>
                    </div>
                </div>
                <div class="card-details">
                    <div class="detail-row"><span>রোল:</span> <span>${student.roll}</span></div>
                    <div class="detail-row"><span>রেজিঃ:</span> <span>${student.reg}</span></div>
                    <div class="detail-row"><span>সেমিস্টার:</span> <span>${student.semester}</span></div>
                    <div class="detail-row"><span>CGPA:</span> <span>${student.cgpa || 'N/A'}</span></div>
                </div>
                <div class="card-actions">
                    <button class="btn-view" onclick="viewProfile('${student.id}')"><i class="fa-solid fa-eye"></i> বিস্তারিত</button>
                    <button class="btn-edit" onclick="editStudent('${student.id}')"><i class="fa-solid fa-pen"></i> এডিট</button>
                    <button class="btn-delete" onclick="deleteStudent('${student.id}')"><i class="fa-solid fa-trash"></i> ডিলিট</button>
                </div>
            `;
            container.appendChild(card);
        });
    } else {
        container.className = '';
        const table = document.createElement('table');
        table.className = 'table-view';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>নাম</th>
                    <th>রোল</th>
                    <th>সেমিস্টার</th>
                    <th>শিফট</th>
                    <th>CGPA</th>
                    <th>অ্যাকশন</th>
                </tr>
            </thead>
            <tbody>
                ${list.map(s => `
                    <tr>
                        <td><strong style="cursor:pointer;" onclick="viewProfile('${s.id}')">${s.name}</strong></td>
                        <td>${s.roll}</td>
                        <td>${s.semester}</td>
                        <td><span class="badge badge-shift">${s.shift}</span></td>
                        <td>${s.cgpa || 'N/A'}</td>
                        <td>
                            <button class="btn-view" style="padding:4px 8px;" onclick="viewProfile('${s.id}')"><i class="fa-solid fa-eye"></i></button>
                            <button class="btn-edit" style="padding:4px 8px;" onclick="editStudent('${s.id}')"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-delete" style="padding:4px 8px;" onclick="deleteStudent('${s.id}')"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        container.appendChild(table);
    }
}

// Toggle View Mode
function setViewMode(mode) {
    currentViewMode = mode;
    document.getElementById('view-grid-btn').classList.toggle('active', mode === 'grid');
    document.getElementById('view-table-btn').classList.toggle('active', mode === 'table');
    filterStudents();
}

// Filtering & Search
function filterStudents() {
    const searchVal = document.getElementById('search-input').value.toLowerCase();
    const semesterVal = document.getElementById('filter-semester').value;
    const shiftVal = document.getElementById('filter-shift').value;

    const filtered = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchVal) || s.roll.includes(searchVal) || s.reg.includes(searchVal);
        const matchesSemester = semesterVal === '' || s.semester === semesterVal;
        const matchesShift = shiftVal === '' || s.shift === shiftVal;
        return matchesSearch && matchesSemester && matchesShift;
    });

    renderStudents(filtered);
}

// Handle Form Submission
function handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('student-id').value;
    
    const studentData = {
        id: id || Date.now().toString(),
        name: document.getElementById('student-name').value,
        roll: document.getElementById('student-roll').value,
        reg: document.getElementById('student-reg').value,
        semester: document.getElementById('student-semester').value,
        shift: document.getElementById('student-shift').value,
        group: document.getElementById('student-group').value,
        phone: document.getElementById('student-phone').value,
        blood: document.getElementById('student-blood').value,
        cgpa: document.getElementById('student-cgpa').value,
        github: document.getElementById('student-github').value
    };

    if (id) {
        const idx = students.findIndex(s => s.id === id);
        students[idx] = studentData;
        showToast("শিক্ষার্থীর তথ্য আপডেট করা হয়েছে!");
    } else {
        students.push(studentData);
        showToast("নতুন শিক্ষার্থী সফলভাবে যোগ করা হয়েছে!");
    }

    saveData();
    resetForm();
    switchTab('list');
    renderStudents();
}

function editStudent(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;

    document.getElementById('student-id').value = student.id;
    document.getElementById('student-name').value = student.name;
    document.getElementById('student-roll').value = student.roll;
    document.getElementById('student-reg').value = student.reg;
    document.getElementById('student-semester').value = student.semester;
    document.getElementById('student-shift').value = student.shift;
    document.getElementById('student-group').value = student.group || 'Group A';
    document.getElementById('student-phone').value = student.phone || '';
    document.getElementById('student-blood').value = student.blood || 'N/A';
    document.getElementById('student-cgpa').value = student.cgpa || '';
    document.getElementById('student-github').value = student.github || '';

    document.getElementById('form-title').innerText = "শিক্ষার্থীর তথ্য এডিট করুন";
    switchTab('add');
}

function deleteStudent(id) {
    if (confirm("আপনি কি নিশ্চিতভাবে এই শিক্ষার্থীর তথ্য মুছে ফেলতে চান?")) {
        students = students.filter(s => s.id !== id);
        saveData();
        renderStudents();
        showToast("তথ্য মুছে ফেলা হয়েছে!");
    }
}

function resetForm() {
    document.getElementById('student-form').reset();
    document.getElementById('student-id').value = '';
    document.getElementById('form-title').innerText = "কম্পিউটার বিভাগের নতুন স্টুডেন্ট রেজিস্ট্রেশন";
}

// Profile Modal View
function viewProfile(id) {
    const s = students.find(item => item.id === id);
    if (!s) return;

    const modalBody = document.getElementById('modal-body-content');
    modalBody.innerHTML = `
        <div style="text-align:center; margin-bottom:20px;">
            <div class="avatar" style="width:70px; height:70px; font-size:2rem; margin: 0 auto 10px auto;">${s.name.charAt(0)}</div>
            <h2>${s.name}</h2>
            <p class="subtitle">Computer Technology (${s.shift}) - ${s.group || 'Group A'}</p>
        </div>
        <hr style="border: 0; border-top: 1px solid var(--border-color); margin-bottom:15px;">
        <div class="card-details" style="font-size:1rem; gap:12px;">
            <div class="detail-row"><span>রোল নম্বর:</span> <span>${s.roll}</span></div>
            <div class="detail-row"><span>রেজিস্ট্রেশন নম্বর:</span> <span>${s.reg}</span></div>
            <div class="detail-row"><span>সেমিস্টার:</span> <span>${s.semester}</span></div>
            <div class="detail-row"><span>বর্তমান GPA/CGPA:</span> <span>${s.cgpa || 'N/A'}</span></div>
            <div class="detail-row"><span>মোবাইল:</span> <span>${s.phone || 'N/A'}</span></div>
            <div class="detail-row"><span>রক্তের গ্রুপ:</span> <span>${s.blood || 'N/A'}</span></div>
            <div class="detail-row"><span>GitHub / Portfolio:</span> <span>${s.github ? `<a href="${s.github}" target="_blank">প্রোফাইল দেখুন</a>` : 'N/A'}</span></div>
        </div>
    `;

    document.getElementById('profile-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('profile-modal').style.display = 'none';
}

// Attendance Logic (Date-wise)
function renderAttendanceTable() {
    const date = document.getElementById('attendance-date').value;
    const body = document.getElementById('attendance-table-body');
    
    if (!date) {
        body.innerHTML = '<tr><td colspan="5" style="text-align:center;">অনুগ্রহ করে একটি তারিখ নির্বাচন করুন।</td></tr>';
        return;
    }

    const dayRecord = attendanceRecords[date] || {};

    body.innerHTML = students.map(s => {
        const status = dayRecord[s.id] || 'present';
        const inputName = `att_${date}_${s.id}`;

        return `
            <tr>
                <td>${s.roll}</td>
                <td><strong>${s.name}</strong></td>
                <td>${s.semester}</td>
                <td>${s.shift} (${s.group || 'A'})</td>
                <td>
                    <label style="cursor:pointer; margin-right:15px;">
                        <input type="radio" name="${inputName}" value="present" ${status === 'present' ? 'checked' : ''}> উপস্থিত
                    </label>
                    <label style="cursor:pointer;">
                        <input type="radio" name="${inputName}" value="absent" ${status === 'absent' ? 'checked' : ''}> অনুপস্থিত
                    </label>
                </td>
            </tr>
        `;
    }).join('');
}

function saveAttendance() {
    const date = document.getElementById('attendance-date').value;
    if(!date) return alert("অনুগ্রহ করে তারিখ নির্বাচন করুন");

    if(!attendanceRecords[date]) {
        attendanceRecords[date] = {};
    }

    students.forEach(s => {
        const inputName = `att_${date}_${s.id}`;
        const selected = document.querySelector(`input[name="${inputName}"]:checked`);
        if(selected) {
            attendanceRecords[date][s.id] = selected.value;
        }
    });

    saveData();
    showToast(`${date} তারিখের উপস্থিতি সেভ করা হয়েছে!`);
}

// Import / Export Data
function exportCSV() {
    if (students.length === 0) return alert("কোনো ডেটা নেই!");
    let csv = "ID,Name,Roll,Reg,Semester,Shift,Group,Phone,Blood,CGPA,GitHub\n";
    students.forEach(s => {
        csv += `"${s.id}","${s.name}","${s.roll}","${s.reg}","${s.semester}","${s.shift}","${s.group || ''}","${s.phone || ''}","${s.blood || ''}","${s.cgpa || ''}","${s.github || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cmt_students_data_${Date.now()}.csv`;
    a.click();
}

function exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(students));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `cmt_students_backup_${Date.now()}.json`;
    a.click();
}

function importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const importedData = JSON.parse(evt.target.result);
            if (Array.isArray(importedData)) {
                students = importedData;
                saveData();
                renderStudents();
                showToast("ডেটা সফলভাবে ইমপোর্ট করা হয়েছে!");
            } else {
                alert("ভুল ফাইল ফরম্যাট!");
            }
        } catch(err) {
            alert("JSON ফাইলটি পড়তে সমস্যা হয়েছে!");
        }
    };
    reader.readAsText(file);
}

function loadSampleData() {
    students = sampleData;
    saveData();
    renderStudents();
    showToast("স্যাম্পল ডেটা লোড করা হয়েছে!");
}

// Dark Mode Toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    document.getElementById('theme-icon').className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    document.getElementById('theme-text').innerText = isDark ? "লাইট মোড" : "ডার্ক মোড";
}

// Dashboard Analytics Counter
function updateStats() {
    document.getElementById('stat-total').innerText = students.length;
    document.getElementById('stat-shift1').innerText = students.filter(s => s.shift === '1st Shift').length;
    document.getElementById('stat-shift2').innerText = students.filter(s => s.shift === '2nd Shift').length;
}

// Toast Display Helper
function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}