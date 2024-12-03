// todo
document.addEventListener("DOMContentLoaded", function () {
  const projectId = document.getElementById("project-id").value; // 프로젝트 ID를 가져옵니다.
  fetchTodos(projectId); // 페이지 로드 시 투두리스트를 조회합니다.
  // 온보딩 시작
  startOnboarding();

  // 캘린더 초기화
  initCalendar2();
  fetchSchedules(projectId);
  setupEventListeners2();
});

function addNewTodoInput() {
  const addTodo = document.getElementById("add-todo");
  addTodo.style.display = "none";

  const todoList = document.getElementById("todo-list");
  const newTodoItem = document.createElement("li");
  newTodoItem.className = "todo-item";

  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.className = "todo-input";
  inputField.placeholder = "할 일을 입력하세요";
  inputField.addEventListener("keypress", function (event) {
    if (event.key === "Enter" && inputField.value.trim() !== "") {
      addTodoItem(inputField.value);
      saveTodoToServer(inputField.value);
      newTodoItem.remove();
      addTodo.style.display = "block";
    }
  });

  newTodoItem.appendChild(inputField);
  todoList.appendChild(newTodoItem);
  inputField.focus();
}

function addTodoItem(text, todoId, todoStatus) {
  const todoList = document.getElementById("todo-list");

  const todoItem = document.createElement("li");
  todoItem.className = "todo-item";
  todoItem.setAttribute("data-todos-todo_id", todoId); // todoId 저장
  todoItem.setAttribute("data-todos-status", todoStatus); // status 저장

  const todoText = document.createElement("span");
  todoText.className = "todo-text";
  todoText.innerText = text;

  const editButton = document.createElement("button");
  editButton.className = "todo-edit";
  editButton.innerText = "수정";

  editButton.onclick = function () {
    if (editButton.innerText === "수정") {
      const editInput = document.createElement("input");
      editInput.type = "text";
      editInput.className = "todo-input";
      editInput.value = todoText.innerText;

      editInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter" && editInput.value.trim() !== "") {
          todoText.innerText = editInput.value;
          todoItem.replaceChild(todoText, editInput);
          editButton.innerText = "수정";
          updateTodoToServer(todoId, editInput.value); // 수정된 내용을 서버로 전송
        }
      });

      todoItem.replaceChild(editInput, todoText);
      editInput.focus();
      editButton.innerText = "저장";
    } else {
      const editInput = todoItem.querySelector(".todo-input");
      if (editInput && editInput.value.trim() !== "") {
        todoText.innerText = editInput.value;
        todoItem.replaceChild(todoText, editInput);
        editButton.innerText = "수정";
        updateTodoToServer(todoId, editInput.value); // 수정된 내용을 서버로 전송
      }
    }
  };

  const completeButton = document.createElement("button");
  completeButton.className = "todo-complete";

  // 현재 상태 읽기
  const initStatus = todoItem.getAttribute("data-todos-status");

  // 초기 상태 UI 설정
  if (initStatus === "true") {
    todoText.style.textDecoration = "line-through";
    todoText.style.color = "grey";
    completeButton.innerText = "미완료";
    editButton.style.display = "none"; // 수정 버튼 숨기기
  } else {
    todoText.style.textDecoration = "none";
    todoText.style.color = "black";
    completeButton.innerText = "완료";
  }

  completeButton.onclick = function () {
    // 현재 상태를 동적으로 읽기
    const currentStatus = todoItem.getAttribute("data-todos-status");

    // 상태 반전
    const newStatus = currentStatus === "true" ? "false" : "true";
    todoItem.setAttribute("data-todos-status", newStatus);

    // 서버에 상태 변경 요청
    changeStatus(todoId, newStatus);
  };

  const deleteButton = document.createElement("button");
  deleteButton.className = "todo-delete";
  deleteButton.innerText = "삭제";

  deleteButton.onclick = function () {
    deleteTodoFromServer(todoId);
  };

  todoItem.appendChild(todoText);
  todoItem.appendChild(editButton);
  todoItem.appendChild(completeButton);
  todoItem.appendChild(deleteButton);
  todoList.appendChild(todoItem);
}

function fetchTodos(projectId) {
  fetch(`/project_main/get_todo/${projectId}`)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const todoList = document.getElementById("todo-list"); // 수정: ID 맞춤
      todoList.innerHTML = ""; // 기존 리스트 초기화

      if (data && Array.isArray(data)) {
        data.forEach((todos) => {
          addTodoItem(todos.todo, todos.todo_id, todos.status); // 여기서도 todos.todo 사용
        });
      } else {
        console.error("Invalid data format received:", data);
      }
    })
    .catch((error) => {
      console.error("Error fetching todos:", error); // 에러 확인
    });
}

// 투두리스트를 서버에 저장하는 함수
function saveTodoToServer(todoContent) {
  const projectId = document.getElementById("project-id").value; // 프로젝트 ID를 가져옵니다.
  fetch(`/project_main/todo/${projectId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ todo_content: todoContent }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "success") {
        const projectId = document.getElementById("project-id").value;
        fetchTodos(projectId); // 투두리스트 갱신
      } else {
        console.error("Failed to save todo");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// 투두리스트 업데이트 함수
function updateTodoToServer(todoId, newContent) {
  fetch(`/project_main/update_todo/${todoId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ todo_content: newContent }),
  })
    .then((response) => response.json())
    .then((data) => {
      const projectId = document.getElementById("project-id").value;
      fetchTodos(projectId); // 투두리스트 갱신
    })
    .catch((error) => {
      console.error("Error updating todo:", error);
    });
}

function deleteTodoFromServer(todoId) {
  fetch(`/project_main/delete_todo/${todoId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "success") {
        const projectId = document.getElementById("project-id").value;
        fetchTodos(projectId); // 투두리스트 갱신
      } else {
        console.error("Failed to delete todo");
      }
    })
    .catch((error) => {
      console.error("Error deleting todo:", error);
    });
}

// 상태변경 변경
function changeStatus(todoId, status) {
  fetch(`/project_main/change_status/${todoId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: status }),
  })
    .then((response) => response.json())
    .then((data) => {
      const projectId = document.getElementById("project-id").value;
      fetchTodos(projectId); // 투두리스트 갱신
    })
    .catch((error) => {
      console.error("Error changing status:", error);
    });
}

/////////////////////////////////////////////////////////////////////////
// 2주 캘린더

const schedules = []; 

function initCalendar2() {
  renderCalendar2();
}

function setupEventListeners2() {
  document.getElementById("prevBtn").addEventListener("click", function () {
    showPreviousWeek();
  });

  document.getElementById("nextBtn").addEventListener("click", function () {
    showNextWeek();
  });

  document.getElementById("todayBtn").addEventListener("click", function () {
    showThisWeek();
  });
}

let currentWeekStart = new Date(); // 현재 기준 주의 시작일 (일요일)
currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay()); // 주의 일요일로 설정

// 캘린더 렌더링 함수
function renderCalendar2() {
  const calendarDates = document.getElementById("calendarDates");

  // 초기화
  calendarDates.innerHTML = "";

  // 기준 주로부터 2주 동안 날짜 생성
  let calendarDays = [];
  let currentDate = new Date(currentWeekStart);

  for (let i = 0; i < 14; i++) {
    calendarDays.push(new Date(currentDate)); // 날짜 배열에 추가
    currentDate.setDate(currentDate.getDate() + 1); // 다음 날로 이동
  }

  // 날짜를 그리드로 표시
  calendarDays.forEach((date) => {
    const dateDiv = document.createElement("div");
    dateDiv.classList.add("date");

    // 날짜 표시
    const dateSpan = document.createElement("span");
    const month = date.getMonth() + 1; // 0-based index, 그래서 +1을 해줍니다
    const day = date.getDate();
    dateSpan.textContent = `${month}/${day}`; // 월/일 형식으로 표시

    dateSpan.style.color = date.toDateString() === new Date().toDateString() ? "red" : "black"; // 오늘은 빨간색, 나머지는 검정색
    dateSpan.style.fontWeight = "bold";

    dateDiv.appendChild(dateSpan);

    // 일정 렌더링
    schedules.forEach((schedule) => {
      const start = new Date(schedule.start_date);
      const end = new Date(schedule.due_date);

      // 날짜 비교 (시간 제거)
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      if (date >= start && date <= end) {
        const scheduleDiv = document.createElement("div");
        const modifiedTitle = schedule.team ? `[팀] ${schedule.title} ` : schedule.title;
        scheduleDiv.textContent = modifiedTitle;
        scheduleDiv.style.backgroundColor = schedule.color;
        scheduleDiv.style.color = "black";
        scheduleDiv.classList.add("schedule");

        dateDiv.appendChild(scheduleDiv);
      }
    });

    calendarDates.appendChild(dateDiv);
  });
}

// 이전 주 버튼 이벤트
function showPreviousWeek() {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7); // 1주일 전으로 이동
  renderCalendar2();
}

// 다음 주 버튼 이벤트
function showNextWeek() {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7); // 1주일 후로 이동
  renderCalendar2();
}

// 오늘 버튼 이벤트
function showThisWeek() {
  currentWeekStart = new Date(); // 현재 날짜로 설정
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay()); // 일요일로 설정
  renderCalendar2();
}

// 팔레트
const colorMap = {
  1: "#f0ada6",
  2: "#f6c6ad",
  3: "#fffbce",
  4: "#b5e4a2",
  5: "#dee9f8",
  6: "#babdff",
  7: "#e9c8ff",
};

// 일정 조회
function fetchSchedules(projectId){
  fetch(`/project_main/calendar/${projectId}`)
    .then((response) => response.json())
    .then((data) => {
      schedules.length = 0; // 초기화

      data.forEach((schedule) => {
        const{
          title,
          start_date,
          due_date,
          color,
          calendar_id,
          team,
        } = schedule;

        // 날짜만 사용하고 시간은 무시하도록 설정
        const start = new Date(start_date);
        const end = new Date(due_date);

        // 시간 부분을 00:00:00으로 설정하여 날짜만 비교
        start.setHours(0, 0, 0, 0); // 시작일의 시간을 00:00:00으로 설정
        end.setHours(23, 59, 59, 999); // 종료일의 시간을 23:59:59.999으로 설정

        if (!isNaN(start) && !isNaN(end)) {
          schedules.push({
            calendar_id,
            title,
            start_date,
            due_date,
            color: colorMap[color] || "#eeeeee",
            team,
          });
        }
      });

      renderCalendar2();
    })
    .catch((error) => console.error("Error fetching schedules:", error));
}

///////////////////////////////////////////////////////////////////////////
function startOnboarding() {
  const onboardingSteps = [
      // 탑바 설명
      {
          element: document.querySelector(".topbar"),
          text: "상단 메뉴를 통해 프로젝트, 캘린더, 가이드 페이지, <br>알림, 마이페이지로 이동할 수 있어요.",
          highlightClass: "onboarding-highlight-topbar", // 탑바 전용 강조 스타일
          overlay: true, // 오버레이 표시
      },
      // 프로젝트명 강조
      {
          element: document.querySelector(".sidebar-header"),
          text: "좌측 상단에서 현재 접속 중인 프로젝트명을 <br>확인할 수 있습니다.",
          highlightClass: "onboarding-highlight-sidebar-header", // 프로젝트명 강조 스타일
          overlay: "transparent", // 오버레이 배경 투명
      },
      // 메뉴 강조
      {
          element: document.querySelector(".sidebar ul"),
          text: "좌측 메뉴에서 프로젝트의 각 과정을 선택하여 <br>이동할 수 있습니다.",
          highlightClass: "onboarding-highlight-sidebar-menu", // 메뉴 강조 스타일
          overlay: "transparent", // 오버레이 배경 투명
      },
      // 메인 페이지 내용
      {
          element: document.querySelector(".progress-section"),
          text: "우리팀의 스프린트 백로그가 얼마나 달성되었는지 <br>확인할 수 있어요.",
          overlay: true, // 오버레이 표시
      },
      {
          element: document.querySelector(".task-box"),
          text: "현재 진행중인 스프린트에서 내가 담당하는 스프린트 <br>백로그의 목록을 확인할 수 있어요.",
          overlay: true, // 오버레이 표시
      },
      {
          element: document.querySelector(".todo-box"),
          text: "내가 해야하는 일들을 간단히 관리할 수 있어요.",
          overlay: true, // 오버레이 표시
      },
      {
          element: document.querySelector(".calendar-box"),
          text: "2주 캘린더에서 나와 우리팀의 일정을 볼 수 있어요.",
          tooltipPosition: "top", // 툴팁 위치를 위쪽으로 설정
          overlay: true, // 오버레이 표시
      },
  ];

  let currentStep = 0;
  const overlay = document.getElementById("onboarding-overlay");
  const tooltip = document.getElementById("onboarding-tooltip");
  const tooltipText = document.getElementById("onboarding-text");
  const nextButton = document.getElementById("onboarding-next-button");

  const showStep = (stepIndex) => {
      const step = onboardingSteps[stepIndex];
      if (!step) {
          endOnboarding();
          return;
      }
      // 오버레이 배경 조정
      if (step.overlay === "transparent") {
          overlay.style.backgroundColor = "transparent"; // 투명 설정
      } else {
          overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)"; // 기본 어두운 배경
      }
      const element = step.element;
      if (element) {
          // 강조 스타일 적용
          if (step.highlightClass) {
              element.classList.add(step.highlightClass);
          } else {
              element.classList.add("onboarding-highlight");
          }

          // 툴팁 내용 설정
          tooltipText.innerHTML = step.text;

          // 툴팁 위치 계산
          const rect = element.getBoundingClientRect();
          tooltip.style.position = "absolute";

          if (step.tooltipPosition === "top") {
              tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10 + window.scrollY}px`; // 위쪽
              tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + window.scrollX}px`; // 중앙 정렬
          } else if (step.highlightClass === "onboarding-highlight-topbar") {
              tooltip.style.top = `${rect.bottom + window.scrollY + 10}px`; // 탑바 아래
              tooltip.style.left = `${rect.right - tooltip.offsetWidth}px`; // 오른쪽 정렬
          } else if (step.highlightClass === "onboarding-highlight-sidebar-header") {
              tooltip.style.top = `${rect.top + window.scrollY + 10}px`; // 사이드바 위쪽
              tooltip.style.left = `${rect.right + 10}px`; // 오른쪽 정렬
          } else if (step.highlightClass === "onboarding-highlight-sidebar-menu") {
              tooltip.style.top = `${rect.top + window.scrollY + 10}px`; // 사이드바 위쪽
              tooltip.style.left = `${rect.right + 10}px`; // 오른쪽 정렬
          } else {
              tooltip.style.top = `${rect.bottom + window.scrollY + 10}px`;
              tooltip.style.left = `${rect.left + window.scrollX}px`;
          }

          // 버튼 텍스트 및 동작 변경
          if (stepIndex === onboardingSteps.length - 1) {
              nextButton.textContent = "완료"; // 버튼 텍스트를 "완료"로 변경
          } else {
              nextButton.textContent = "다음"; // 버튼 텍스트를 "다음"으로 설정
          }
      }
  };

  const nextStep = () => {
      const previousStep = onboardingSteps[currentStep];
      if (previousStep && previousStep.element) {
          if (previousStep.highlightClass) {
              previousStep.element.classList.remove(previousStep.highlightClass);
          } else {
              previousStep.element.classList.remove("onboarding-highlight");
          }
      }

      currentStep++;
      showStep(currentStep);
  };

  const endOnboarding = () => {
      overlay.classList.add("hidden");
      tooltip.style.display = "none";

      onboardingSteps.forEach((step) => {
          if (step.element && step.highlightClass) {
              step.element.classList.remove(step.highlightClass);
          } else if (step.element) {
              step.element.classList.remove("onboarding-highlight");
          }
      });
  };

  nextButton.addEventListener("click", nextStep);

  // 첫 방문 시 온보딩 시작
  if (!document.cookie.includes("onboarding_done_main=true")) {
      overlay.classList.remove("hidden");
      document.cookie = "onboarding_done_main=true; path=/; max-age=31536000"; // 1년 유지
      showStep(currentStep);
  }
}
