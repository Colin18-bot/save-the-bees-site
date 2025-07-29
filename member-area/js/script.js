import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.6/+esm';

const SUPABASE_URL = 'https://uihngfpmoasnofyrvpmw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpaG5nZnBtb2Fzbm9meXJ2cG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzE2MTEsImV4cCI6MjA2Nzk0NzYxMX0.JO8y5G4lxGoyJozZfyxK-8VkJ5UusQzzkQxEYy8RVGo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);



// Attach logout logic
document.addEventListener('DOMContentLoaded', () => {
  // ✅ LOGOUT BUTTON HANDLER
  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const { error } = await supabase.auth.signOut();
      if (error) {
        alert("Failed to log out: " + error.message);
        console.error(error);
      } else {
        window.location.href = 'https://www.beezknees.co.uk/';
      }
    });
  }

  // === SIDEBAR TOGGLE ===
  const hamburger = document.querySelector(".hamburger");
  const sidebar = document.querySelector(".sidebar");

  if (hamburger && sidebar) {
    hamburger.addEventListener("click", () => {
      const isOpen = sidebar.classList.toggle("active");
      hamburger.classList.toggle("active");
      hamburger.setAttribute("aria-expanded", isOpen);
    });

    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        sidebar.classList.remove("active");
        hamburger.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });

    const currentPath = window.location.pathname.split("/").pop();
    document.querySelectorAll(".nav-link").forEach(link => {
      const linkHref = link.getAttribute("href").split("/").pop();
      link.classList.toggle("active", linkHref === currentPath);
    });
  }

  // === CALENDAR === //
   document.addEventListener("DOMContentLoaded", function () {
    const monthSelect = document.getElementById("monthSelect");
    const yearSelect = document.getElementById("yearSelect");
    const calendarGrid = document.getElementById("calendarGrid");
    const calendarMonthYear = document.getElementById("calendarMonthYear");

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    function renderCalendar() {
      // Clear previous days (keep weekday headers)
      while (calendarGrid.children.length > 7) {
        calendarGrid.removeChild(calendarGrid.lastChild);
      }

      const selectedMonth = parseInt(monthSelect.value);
      const selectedYear = parseInt(yearSelect.value);

      calendarMonthYear.textContent = `${monthNames[selectedMonth]} ${selectedYear}`;

      const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

      const today = new Date();
      const isCurrentMonth = today.getMonth() === selectedMonth && today.getFullYear() === selectedYear;

      // Blank cells before 1st of the month
      for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement("div");
        calendarGrid.appendChild(blank);
      }

      // Add actual day cells
      for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("div");
        cell.textContent = day;
        cell.classList.add("calendar-day");

        if (isCurrentMonth && day === today.getDate()) {
          cell.classList.add("today");
        }

        // Make days interactive
        cell.style.cursor = "pointer";
        cell.addEventListener("click", () => {
          alert(`You clicked ${day} ${monthNames[selectedMonth]} ${selectedYear}`);
          // Replace alert with modal / inspection view if needed
        });

        calendarGrid.appendChild(cell);
      }
    }

    renderCalendar();

    monthSelect.addEventListener("change", renderCalendar);
    yearSelect.addEventListener("change", renderCalendar);
  });

  // === HIVE LIST DISPLAY ===
  const exampleHives = [
    {
      id: 'Hive A',
      type: 'National',
      status: 'Active',
      apiary: 'apiary-1',
      lastInspection: '2025-07-01 – Queen seen, strong colony'
    },
    {
      id: 'Hive B',
      type: 'Langstroth',
      status: 'Inactive',
      apiary: 'apiary-2',
      lastInspection: '2025-06-28 – Needs feeding'
    },
    {
      id: 'Hive C',
      type: 'WBC',
      status: 'Archived',
      apiary: 'apiary-1',
      lastInspection: '2025-06-10 – Combined with Hive A'
    }
  ];

  const hiveList = document.getElementById("hiveList");
  const apiaryFilterHives = document.getElementById("apiaryFilter");
  const noHivesMessage = document.getElementById("noHivesMessage");

  if (hiveList && apiaryFilterHives) {
    function renderHives(hives, selectedApiary) {
      hiveList.innerHTML = "";
      const filtered = hives.filter(h => selectedApiary === "all" || h.apiary === selectedApiary);

      if (filtered.length === 0) {
        noHivesMessage?.classList.remove("hidden");
        return;
      } else {
        noHivesMessage?.classList.add("hidden");
      }

      filtered.forEach(hive => {
        const card = document.createElement("div");
        card.className = "hive-card";
        card.dataset.apiary = hive.apiary;
        card.innerHTML = `
          <h3>${hive.id}</h3>
          <p><strong>Type:</strong> ${hive.type}</p>
          <p><strong>Status:</strong> ${hive.status}</p>
          <p><strong>Last Inspection:</strong> ${hive.lastInspection}</p>
          <div class="action-buttons">
            <a href="view-inspection.html?hive=${hive.id}" class="btn-secondary">View</a>
            <a href="inspect-hive.html?hive=${hive.id}" class="btn-secondary">Inspect</a>
            <a href="edit-hive.html?hive=${hive.id}" class="btn-secondary">Edit</a>
            <button class="btn-secondary" onclick="alert('Clone ${hive.id}')">Clone</button>
            <button class="btn-secondary" onclick="alert('Archive ${hive.id}')">Archive</button>
            <button class="btn-danger" onclick="confirm('Delete ${hive.id}?')">Delete</button>
          </div>
        `;
        hiveList.appendChild(card);
      });
    }

    function populateApiaryFilter(hives) {
      const apiaries = [...new Set(hives.map(h => h.apiary))];
      apiaries.forEach(apiary => {
        const option = document.createElement("option");
        option.value = apiary;
        option.textContent = apiary.replace("apiary-", "Apiary ");
        apiaryFilterHives.appendChild(option);
      });
    }

    apiaryFilterHives.addEventListener("change", () => {
      renderHives(exampleHives, apiaryFilterHives.value);
    });

    populateApiaryFilter(exampleHives);
    renderHives(exampleHives, "all");
  }

  // === TO-DO LOGIC ===
  let selectedTaskType = '';
  const taskList = [];

  window.selectTask = function (taskType) {
    selectedTaskType = taskType;
    document.getElementById('selected-task-label').textContent = taskType;

    const form = document.getElementById('task-form');
    form.classList.remove('hidden');
    form.classList.add('active');

    document.querySelectorAll('.task-buttons button').forEach(btn => {
      btn.classList.toggle('active', btn.textContent === taskType);
    });
  };

  window.resetForm = function () {
    const form = document.getElementById('task-form');
    form.classList.add('hidden');
    form.classList.remove('active');

    document.getElementById('selected-task-label').textContent = 'Selected Task';
    document.querySelectorAll('.task-buttons button').forEach(btn => btn.classList.remove('active'));
  };

  const taskForm = document.getElementById('task-form');
  if (taskForm) {
    taskForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const task = {
        type: selectedTaskType,
        date: document.getElementById('due-date').value,
        apiary: document.getElementById('apiary').value,
        hive: document.getElementById('hive').value,
        status: document.getElementById('status').value,
        notes: document.getElementById('notes').value
      };

      taskList.push(task);
      renderTaskList();
      this.reset();
      resetForm();
    });
  }

  function renderTaskList() {
    const container = document.getElementById('task-list');
    if (!container) return;

    container.innerHTML = '';
    taskList.forEach((task, index) => {
      if (task.status === 'Complete') return;

      const item = document.createElement('div');
      item.className = 'task-item';
      item.innerHTML = `
        <h4 class="task-title">${task.type}</h4>
        <p class="task-meta"><strong>Due:</strong> ${task.date}</p>
        <p class="task-meta"><strong>Apiary:</strong> ${task.apiary}</p>
        <p class="task-meta"><strong>Hive:</strong> ${task.hive}</p>
        <p class="task-meta"><strong>Status:</strong> ${task.status}</p>
        <p class="task-notes">Notes: ${task.notes}</p>
        <button class="btn-secondary" onclick="completeTask(${index})">Mark Complete</button>
      `;

      container.appendChild(item);
    });
  }

  window.completeTask = function (index) {
    taskList[index].status = 'Complete';
    renderTaskList();
  };

  // === LOGBOOK LOGIC ===
 window.selectLogType = function (type) {
  const form = document.getElementById('log-form');
  form.classList.remove('hidden');
  form.classList.add('active');


  document.getElementById('selected-log-label').textContent = type;
  document.querySelectorAll('.log-type-fields').forEach(el => el.style.display = 'none');

  switch(type) {
    case 'Fed Bees':
      document.getElementById('fedbees-fields').style.display = 'block'; break;
    case 'Mite Assessment':
      document.getElementById('mite-fields').style.display = 'block'; break;
    case 'Treatment':
      document.getElementById('treatment-fields').style.display = 'block'; break;
    case 'Requeen':
      document.getElementById('requeen-fields').style.display = 'block'; break;
    // These types show no extra fields but still activate the form
    case 'Winter Prep.':
    case 'Dead Hive':
    case 'Harvesting':
    case 'Other':
      break;
  }

  document.querySelectorAll('.logbook-buttons button').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === type);
  });
};

  window.toggleOther = function (field) {
    const map = {
      breed: 'breed-other',
      source: 'source-other',
      marking: 'marking-other'
    };
    const select = document.getElementById(`${field}-select`);
    const other = document.getElementById(map[field]);
    other.style.display = select.value === 'Other' ? 'block' : 'none';
  };

  window.resetLogbookForm = function () {
    document.getElementById('log-form').classList.remove('active');
    document.querySelectorAll('.logbook-buttons button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.log-type-fields').forEach(el => el.style.display = 'none');
  };

  const logForm = document.getElementById('log-form');
  if (logForm) {
    logForm.addEventListener('submit', function (e) {
      e.preventDefault();
      alert("✅ Logbook entry saved!");
      this.reset();
      resetLogbookForm();
    });
  }
});