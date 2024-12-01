// 쿠키 읽기 함수
function getCookie(name) {
  const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
    const [key, value] = cookie.split("=");
    acc[key] = value;
    return acc;
  }, {});
  return cookies[name];
}

// 쿠키 저장 함수
function setCookie(name, value, days = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()}`;
}

// 스프린트 네비게이션 변수
let currentSprintIndex = 1;

// 스프린트 네비게이션 함수
function navigateSprints(direction) {
  const sprints = document.querySelectorAll(".sprint-container");
  const navBtnLt = document.querySelector(".nav-btn-lt");
  const navBtnGt = document.querySelector(".nav-btn-gt");

  // 현재 스프린트를 숨기기
  sprints[currentSprintIndex - 1].style.display = "none";

  // 스프린트 인덱스 업데이트
  currentSprintIndex += direction;

  // 새로 선택된 스프린트 표시
  sprints[currentSprintIndex - 1].style.display = "block";

  // 현재 스프린트 인덱스를 프로젝트 ID와 함께 쿠키에 저장
  setCookie(`currentSprintIndex_${projectId}`, currentSprintIndex);

  // 버튼 상태 업데이트
  updateNavButtons();
}

// 네비게이션 버튼 상태 업데이트
function updateNavButtons() {
  const sprints = document.querySelectorAll(".sprint-container");
  const navBtnLt = document.querySelector(".nav-btn-lt");
  const navBtnGt = document.querySelector(".nav-btn-gt");

  // 왼쪽 버튼 표시 여부
  if (currentSprintIndex === 1) {
    navBtnLt.style.display = "none"; // 첫 번째 스프린트에서는 숨김
  } else {
    navBtnLt.style.display = "inline-block"; // 첫 번째가 아니면 표시
  }

  // 오른쪽 버튼 표시 여부
  if (currentSprintIndex === sprints.length) {
    navBtnGt.style.display = "none"; // 마지막 스프린트에서는 숨김
  } else {
    navBtnGt.style.display = "inline-block"; // 마지막이 아니면 표시
  }
}

// 초기화 함수
document.addEventListener("DOMContentLoaded", function () {
  const sprints = document.querySelectorAll(".sprint-container");

  // 쿠키에서 저장된 인덱스를 불러옴
  let savedIndex = parseInt(getCookie(`currentSprintIndex_${projectId}`), 10);

  // 유효한 저장된 인덱스가 없으면 기본값으로 설정
  if (!savedIndex || savedIndex <= 0 || savedIndex > sprints.length) {
    savedIndex = 1; // 기본값
    setCookie(`currentSprintIndex_${projectId}`, savedIndex);
  }

  currentSprintIndex = savedIndex;

  // 초기 스프린트 표시
  sprints.forEach((sprint, index) => {
    sprint.style.display = index + 1 === currentSprintIndex ? "block" : "none";
  });

  // 버튼 상태 초기화
  updateNavButtons();
});

// 스프린트 생성 모달 열기 함수
function openSprintCreateModal() {
  document.getElementById("sprint_create_modal").style.display = "flex";
}

document.addEventListener("DOMContentLoaded", function () {
  const sprintForm = document.querySelector("#sprint_create_modal form");

  // Enter 키 입력 방지
  sprintForm.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // 기본 동작 방지
    }
  });
  const backlogContainer = document.getElementById("product-backlog-container");
  backlogContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("product-backlog-item")) {
      event.target.classList.toggle("selected");
      updateSelectedBacklogs();
    }
  });
});
function updateSelectedBacklogs() {
  const selectedItems = document.querySelectorAll(
    ".product-backlog-item.selected"
  );
  const selectedIds = Array.from(selectedItems).map(
    (item) => item.dataset.backlogId
  );
  document.getElementById("selected-backlog-ids").value = selectedIds.join(",");
}

//스프린트 생성시 검사해서 백엔드로 보내기
function submitSprintForm() {
  const sprintName = document.getElementById("sprint-name").value.trim();
  const sprintStartDate = document.getElementById("sprint-start-date").value;
  const sprintEndDate = document.getElementById("sprint-end-date").value;
  const productBacklogSelect = document.querySelectorAll(
    ".product-backlog-item.selected"
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정하여 날짜만 비교

  if (!sprintName) {
    showMessageModal("오류", "스프린트 이름이 비어있습니다.");
    return;
  }

  if (!sprintStartDate || !sprintEndDate) {
    showMessageModal("오류", "스프린트 기간이 지정되지 않았습니다.");
    return;
  }

  // 날짜 객체로 변환
  const startDate = new Date(sprintStartDate);
  const endDate = new Date(sprintEndDate);

  // 종료일이 시작일보다 빠른 경우 확인
  if (endDate < startDate) {
    showMessageModal("오류", "종료일이 시작일보다 빠릅니다.");
    return;
  }
  // 시작일이 현재 날짜보다 빠른 경우 확인
  if (startDate < today) {
    showMessageModal("오류", "스프린트 시작일이 현재 날짜보다 빠릅니다.");
    return;
  }

  if (productBacklogSelect.length === 0) {
    showMessageModal("오류", "프로덕트 백로그를 생성해야합니다.");
    return;
  }

  const backlogIds = Array.from(productBacklogSelect).map(
    (item) => item.dataset.backlogId
  );
  document.getElementById("selected-backlog-ids").value = backlogIds.join(",");

  // 모든 필드가 올바르게 입력되었을 때 폼 제출
  document.querySelector("#sprint_create_modal form").submit();
}

// 스프린트 생성 모달 닫기 함수
function closeSprintCreateModal() {
  document.getElementById("sprint_create_modal").style.display = "none";
}

// 스프린트 백로그 생성 모달 열기 함수
function openSprintBacklogModal(sprintId, productBacklogId) {
  const form = document.getElementById("add-sprint-backlog-form");

  // 동적으로 URL 설정
  const actionUrl = `/sprint/create-sprint-backlog/${sprintId}/${productBacklogId}`;
  form.action = actionUrl;

  // 숨겨진 필드에 스프린트 ID와 백로그 ID 설정
  document.getElementById("sprint-backlog-sprint-id").value = sprintId;
  document.getElementById("sprint-backlog-product-id").value = productBacklogId;

  // 모달 표시
  document.getElementById("sprint_backlog_modal").style.display = "flex";
}

// 스프린트 백로그 생성 모달 닫기 함수
function closeSprintBacklogModal() {
  document.getElementById("sprint_backlog_modal").style.display = "none";
}

// 스프린트 백로그 추가 함수
function addSprintBacklog() {
  const backlogName = document.getElementById("backlog-name").value.trim();
  const assignee = document.getElementById("assignee").value;

  if (!backlogName) {
    showMessageModal("오류", "스프린트 백로그 이름을 입력해주세요.");
    return;
  }

  if (!assignee) {
    showMessageModal("오류", "담당자를 지정해주세요.");
    return;
  }

  // 모든 필드가 올바르게 입력되었을 때 폼 제출
  document.getElementById("add-sprint-backlog-form").submit();
}

/////////////////////////////////////////////////////////////////////////////////////
// 스프린트 설정 팝업 모달 열기/닫기
function toggleSprintOptionsModal(
  event,
  sprintId,
  sprintName,
  startDate,
  endDate,
  editUrl
) {
  const modal = document.getElementById("sprint-options-modal");
  modal.style.display = modal.style.display === "none" ? "block" : "none";
  // 팝업 모달의 위치를 버튼 왼쪽에 맞게 설정
  modal.style.top = event.clientY + "px";
  modal.style.left = event.clientX - modal.offsetWidth + "px";

  modal.dataset.sprintId = sprintId;
  document.getElementById("edit-sprint-btn").onclick = function () {
    openSprintEditModal(sprintId, sprintName, startDate, endDate, editUrl);
  };
}

function submitEditSprintForm() {
  const productBacklogContainer = document.getElementById(
    "edit-product-backlog-container"
  );
  const selectedBacklogs = [];
  const backlogItems = productBacklogContainer.getElementsByClassName(
    "product-backlog-item"
  );

  for (let i = 0; i < backlogItems.length; i++) {
    const item = backlogItems[i];
    if (item.classList.contains("assigned")) {
      selectedBacklogs.push(item.dataset.backlogId);
    }
  }

  // 선택된 백로그가 없으면 경고 메시지 표시
  if (selectedBacklogs.length === 0) {
    showMessageModal("오류", "최소 하나의 프로덕트 백로그를 선택해야 합니다.");
    return;
  }

  // 폼에 선택된 백로그 ID를 히든 인풋으로 추가
  const editForm = document.getElementById("edit-sprint-form");
  // 기존의 히든 인풋 제거
  const existingInputs = editForm.querySelectorAll('input[name="backlogs"]');
  existingInputs.forEach((input) => input.remove());

  selectedBacklogs.forEach(function (backlogId) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "backlogs";
    input.value = backlogId;
    editForm.appendChild(input);
  });

  // 폼 제출
  editForm.submit();
}

// 백로그 설정 팝업 모달 열기/닫기
function toggleBacklogOptionsModal(event, backlogId, content, userId) {
  const modal = document.getElementById("backlog-options-modal");
  modal.style.display = modal.style.display === "none" ? "block" : "none";

  // 팝업 모달 위치 설정
  modal.style.top = event.clientY + "px";
  modal.style.left = event.clientX - modal.offsetWidth + "px";

  const form = document.getElementById("edit-sprint-backlog-form");
  form.action = `/sprint/edit-backlog-details/${backlogId}`;

  // 수정 폼의 action과 필드 설정
  document.getElementById("edit-backlog-id").value = backlogId;
  document.getElementById("edit-backlog-name").value = content;
  document.getElementById("edit-assignee").value = userId;

  currentBacklogId = backlogId;
}
// Small modal 닫기 함수 (small 모달에서 수정시 small 모달이 안닫혀서 생성)
function closeSmallModal() {
  document.querySelectorAll(".small-modal").forEach((modal) => {
    modal.style.display = "none";
  });
}

// 스프린트 수정 모달 열기 함수
function openSprintEditModal(
  sprintId,
  sprintName,
  startDate,
  endDate,
  editUrl
) {
  closeSmallModal();

  document.getElementById("edit-sprint-id").value = sprintId;
  document.getElementById("edit-sprint-name").value = sprintName;
  document.getElementById("edit-sprint-start-date").value = startDate;
  document.getElementById("edit-sprint-end-date").value = endDate;

  // 폼 액션 URL 설정
  const editForm = document.getElementById("edit-sprint-form");
  editForm.action = editUrl;
  // 프로덕트 백로그 컨테이너 초기화
  const productBacklogContainer = document.getElementById(
    "edit-product-backlog-container"
  );
  productBacklogContainer.innerHTML = ""; // 기존 내용 제거

  // 현재 스프린트를 sprintsData에서 찾기
  var currentSprint = sprintsData.find(function (sprint) {
    return sprint.sprint_id === sprintId;
  });

  // 현재 스프린트에 할당된 프로덕트 백로그 ID 리스트 생성
  var assignedBacklogIds = currentSprint.product_backlogs.map(function (
    backlog
  ) {
    return backlog.product_backlog_id;
  });

  // 모든 관련 프로덕트 백로그 가져오기 (현재 스프린트에 할당되었거나 할당되지 않은 백로그)
  var relevantBacklogs = [];

  // 현재 스프린트에 할당된 백로그 추가
  currentSprint.product_backlogs.forEach(function (backlog) {
    relevantBacklogs.push({
      product_backlog_id: backlog.product_backlog_id,
      content: backlog.content,
      assigned: true,
    });
  });

  // 할당되지 않은 백로그 추가
  unassignedBacklogsData.forEach(function (backlog) {
    relevantBacklogs.push({
      product_backlog_id: backlog.product_backlog_id,
      content: backlog.product_backlog_content,
      assigned: false,
    });
  });

  // 프로덕트 백로그 리스트 생성
  relevantBacklogs.forEach(function (backlog) {
    var backlogItem = document.createElement("div");
    backlogItem.className = "product-backlog-item";
    backlogItem.dataset.backlogId = backlog.product_backlog_id;
    backlogItem.textContent = backlog.content;
    if (backlog.assigned) {
      backlogItem.classList.add("assigned"); // 할당된 백로그 스타일 적용
    }

    // 클릭 이벤트 리스너 추가
    backlogItem.addEventListener("click", function () {
      backlogItem.classList.toggle("assigned");
    });

    productBacklogContainer.appendChild(backlogItem);
  });

  document.getElementById("sprint_edit_modal").style.display = "flex";
}

// 스프린트 수정 모달 닫기 함수
function closeSprintEditModal() {
  document.getElementById("sprint_edit_modal").style.display = "none";
}

function deleteSprint() {
  // Small modal 닫기
  closeSmallModal();
  // 모달 메시지 변경
  document.getElementById("confirmDeleteMessage").innerHTML =
    "스프린트를 삭제하면 스프린트에 대한 회고도 <br>함께 삭제됩니다.<br>정말로 이 스프린트를 삭제하시겠습니까?";
  // 확인 버튼에 스프린트 삭제 함수 연결
  document.querySelector(".modal-confirm-btn").onclick = confirmDelete;
  // 삭제 확인 모달 표시
  document.getElementById("confirmDeleteModal").style.display = "flex";
}

function confirmDelete() {
  //스프린트 삭제 확인 함수
  const sprintId = document.getElementById("sprint-options-modal").dataset
    .sprintId;

  fetch(`/sprint/delete-sprint/${sprintId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        showMessageModal("성공", "스프린트가 삭제되었습니다.");
        setTimeout(() => location.reload(), 2000);
      } else {
        showMessageModal("오류", "스프린트 삭제에 실패했습니다.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showMessageModal("오류", "스프린트 삭제 중 오류가 발생했습니다.");
    });

  // 삭제 확인 모달 닫기
  closeConfirmDeleteModal();
  closeSprintOptionsModal();
}

// 삭제 확인 모달 닫기 함수
function closeConfirmDeleteModal() {
  document.getElementById("confirmDeleteModal").style.display = "none";
}

// 메시지 모달 열기 함수
function showMessageModal(title, message) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalMessage").textContent = message;
  document.getElementById("messageModal").style.display = "flex";
}

// 메시지 모달 닫기 함수
function closeMessageModal() {
  document.getElementById("messageModal").style.display = "none";
}

//백로그 삭제 확인 모달
function deleteBacklog() {
  // Small modal 닫기
  closeSmallModal();

  // 모달 메시지 변경
  document.getElementById("confirmDeleteMessage").textContent =
    "정말로 이 스프린트 백로그를 삭제하시겠습니까?";

  // 확인 버튼에 백로그 삭제 함수 연결
  document.querySelector(".modal-confirm-btn").onclick = confirmBacklogDelete;

  // 삭제 확인 모달 표시
  document.getElementById("confirmDeleteModal").style.display = "flex";
}

// 페이지 로드 시 URL 파라미터에 따라 오류 메시지 표시
window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get("status");

  if (status === "-1") {
    showMessageModal("오류", "스프린트 날짜가 겹칩니다.");
  } else if (status === "1") {
    showMessageModal("성공", "스프린트가 성공적으로 추가되었습니다!");
  }
  // URL에서 status 파라미터 제거
  urlParams.delete("status");
  const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
  window.history.replaceState({}, document.title, newUrl);
};

// 스프린트 백로그 수정 모달 열기 함수
function openSprintBacklogEditModal() {
  closeSmallModal(); // small modal 닫기
  document.getElementById("sprint_backlog_edit_modal").style.display = "flex";
}

// 스프린트 백로그 수정 모달 닫기 함수
function closeSprintBacklogEditModal() {
  document.getElementById("sprint_backlog_edit_modal").style.display = "none";
}

// 스프린트 백로그 수정 저장 함수
function saveBacklogChanges() {
  document.getElementById("edit-sprint-backlog-form").submit();
  closeSprintBacklogEditModal();
}

function confirmBacklogDelete() {
  if (currentBacklogId) {
    fetch(`/sprint/delete-backlog/${currentBacklogId}`, {
      method: "POST",
    })
      .then((response) => {
        if (response.ok) {
          showMessageModal("성공", "스프린트 백로그가 삭제되었습니다.");
          setTimeout(() => location.reload(), 2000); // 모달 표시 후 2초 뒤 새로고침
        } else {
          showMessageModal("오류", "스프린트 백로그 삭제에 실패했습니다.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        showMessageModal(
          "오류",
          "스프린트 백로그 삭제 중 오류가 발생했습니다."
        );
      });
  }

  closeConfirmDeleteModal();
  closeBacklogOptionsModal();
}
// 팝업 모달 닫기
function closeSprintOptionsModal() {
  document.getElementById("sprint-options-modal").style.display = "none";
}

function closeBacklogOptionsModal() {
  document.getElementById("backlog-options-modal").style.display = "none";
}

// 화면 클릭 시 팝업 모달 닫기
window.addEventListener("click", function (event) {
  const sprintOptionsModal = document.getElementById("sprint-options-modal");
  const backlogOptionsModal = document.getElementById("backlog-options-modal");

  if (
    !event.target.closest(".header-options-btn") &&
    !event.target.closest("#sprint-options-modal")
  ) {
    closeSprintOptionsModal();
  }
  if (
    !event.target.closest(".options-btn") &&
    !event.target.closest("#backlog-options-modal")
  ) {
    closeBacklogOptionsModal();
  }
});

// 스프린트가 없는 경우 nav-btn 숨기기
window.addEventListener("DOMContentLoaded", function () {
  const sprintContainerNone = document.querySelector(".sprint-container-none");
  const navButtons = document.querySelectorAll(".nav-btn");

  if (sprintContainerNone) {
    navButtons.forEach((button) => {
      button.style.display = "none";
    });
  }
});

function moveBacklogs(sprintId, projectId) {
  fetch(`/sprint/move-backlogs/${sprintId}/${projectId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })
    .then((response) => {
      if (response.ok) {
        showMessageModal("성공", "백로그가 다음 스프린트로 이전되었습니다.");
        setTimeout(() => location.reload(), 2000);
      } else {
        showMessageModal("오류", "백로그 이전에 실패했습니다.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showMessageModal("오류", "백로그 이전 중 오류가 발생했습니다.");
    });
}

function startOnboarding() {
  const onboardingSteps = [
    {
      element: document.querySelector(".create-sprint-btn"),
      text: "스프린트를 생성하려면 이 버튼을 클릭하세요.",
      tooltipPosition: "bottom", // 툴팁 위치
    },
    {
      element: document.querySelector(".sprint-navigation"),
      text: "스프린트가 생성되면 여기에서 관리할 수 있습니다. <br>스프린트가 여러 개인 경우 양 옆 버튼을 눌러 이동할 <br>수 있습니다.",
      tooltipPosition: "bottom", // 툴팁 위치
    },
    {
      element: document.querySelector(".product-backlog"),
      text: "프로덕트 백로그 섹션에서 프로젝트에서 생성된 백로그 <br>목록을 관리할 수 있습니다.",
      tooltipPosition: "top", // 툴팁 위치
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

    const element = step.element;

    if (element) {
      // 강조 스타일 적용
      element.classList.add("onboarding-highlight");

      // 툴팁 내용 설정
      tooltipText.innerHTML = step.text;

      // 툴팁 위치 계산
      const rect = element.getBoundingClientRect();
      const tooltipWidth = tooltip.offsetWidth;
      const tooltipHeight = tooltip.offsetHeight;

      let tooltipTop, tooltipLeft;

      switch (step.tooltipPosition) {
        case "top":
          tooltipTop = rect.top - tooltipHeight - 10;
          tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "bottom":
          tooltipTop = rect.bottom + 10;
          tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "left":
          tooltipTop = rect.top + rect.height / 2 - tooltipHeight / 2;
          tooltipLeft = rect.left - tooltipWidth - 10;
          break;
        case "right":
          tooltipTop = rect.top + rect.height / 2 - tooltipHeight / 2;
          tooltipLeft = rect.right + 10;
          break;
        default:
          tooltipTop = rect.bottom + 10;
          tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
      }

      // 화면 밖으로 나가는 경우 조정
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (tooltipLeft + tooltipWidth > viewportWidth) {
        tooltipLeft = viewportWidth - tooltipWidth - 10;
      }
      if (tooltipTop + tooltipHeight > viewportHeight) {
        tooltipTop = rect.top - tooltipHeight - 10;
      }
      if (tooltipLeft < 0) {
        tooltipLeft = 10;
      }
      if (tooltipTop < 0) {
        tooltipTop = rect.bottom + 10;
      }

      // 툴팁 위치 적용
      tooltip.style.top = `${tooltipTop}px`;
      tooltip.style.left = `${tooltipLeft}px`;
    }
  };

  const nextStep = () => {
    const previousStep = onboardingSteps[currentStep];
    if (previousStep && previousStep.element) {
      previousStep.element.classList.remove("onboarding-highlight");
    }

    currentStep++;
    if (currentStep < onboardingSteps.length - 1) {
      nextButton.innerText = "다음"; // 다음 버튼
    } else if (currentStep === onboardingSteps.length - 1) {
      nextButton.innerText = "완료"; // 마지막 단계에서 완료 버튼
    }

    showStep(currentStep);
  };

  nextButton.addEventListener("click", nextStep);

  // 첫 방문 시 온보딩 시작
  if (!document.cookie.includes("onboarding_done_sprint=true")) {
    overlay.classList.remove("hidden");
    showStep(currentStep);
  }
}

const endOnboarding = () => {
  const overlay = document.getElementById("onboarding-overlay");
  const tooltip = document.getElementById("onboarding-tooltip");
  overlay.classList.add("hidden");
  tooltip.style.display = "none";

  // 온보딩 완료 상태 저장
  document.cookie = "onboarding_done_sprint=true; path=/; max-age=31536000"; // 1년 유지
};

document.addEventListener("DOMContentLoaded", function () {
  startOnboarding();
});
