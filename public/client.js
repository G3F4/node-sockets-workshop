document.addEventListener('DOMContentLoaded', () => {
  const renderTemplateById = id => {
    const rootNode = document.getElementById('root');
    const template = document.getElementById(id);
    const node = template.content.cloneNode(true);

    rootNode.innerHTML = '';
    rootNode.appendChild(node);
  };
  const renderLandingView = () => {
    renderTemplateById('landing');

    const loginParticipantNode = document.getElementById('loginParticipant');
    const loginTrainerNode = document.getElementById('loginTrainer');

    loginParticipantNode.addEventListener('click', renderParticipantLoginView);

    loginTrainerNode.addEventListener('click', renderTrainerLoginView);
  };
  const renderParticipantLoginView = () => {
    renderTemplateById('participantLogin');

    const participantLoginFormNode = document.getElementById('participantLoginForm');

    participantLoginFormNode.addEventListener('submit', event => {
      event.preventDefault();

      const formData = new FormData(event.target);

      sendAction('PARTICIPANT_LOGIN', {
        name: formData.get('name'),
        group: formData.get('group'),
      });
    });
  };
  const renderTrainerLoginView = () => {
    renderTemplateById('trainerLogin');

    const trainerLoginFormNode = document.getElementById('trainerLoginForm');

    trainerLoginFormNode.addEventListener('submit', event => {
      event.preventDefault();

      const formData = new FormData(event.target);

      sendAction('TRAINER_LOGIN', {
        name: formData.get('name'),
      });
    });
  };
  const renderIssueSubmitView = () => {
    renderTemplateById('issueSubmit');

    const issueSubmitFormNode = document.getElementById('issueSubmitForm');

    issueSubmitFormNode.addEventListener('submit', event => {
      event.preventDefault();

      const formData = new FormData(event.target);

      sendAction('TRAINER_NEEDED', {
        problem: formData.get('problem'),
      });
    });
  };
  const renderIssueReceivedView = () => {
    renderTemplateById('issueReceived');
  };
  const renderIssueTakenView = trainerName => {
    renderTemplateById('issueTaken');
    const issueTakenHeaderNode = document.getElementById('issueTakenHeader');
    const issueSolvedButtonNode = document.getElementById('issueSolved');

    issueSolvedButtonNode.addEventListener('click', () => {
      sendAction('ISSUE_SOLVED');
      renderIssueSubmitView();
    });

    issueTakenHeaderNode.textContent = `Trener ${trainerName} przyjął Twoje zgłoszenie, zaraz podejdzie.`;
  };
  const renderTrainerDashboardView = data => {
    renderTemplateById('trainerDashboard');

    const issueListItemTemplate = document.getElementById('issueListItem');
    const issueListNode = document.getElementById('issueList');

    data.forEach(it => {
      const issueListItemNode = document.importNode(issueListItemTemplate.content, true);
      const takeIssueButtonNode = issueListItemNode.querySelector('.issueListItemActions button');

      issueListItemNode.querySelector('.issueListItemName').textContent = it.userName;
      issueListItemNode.querySelector('.issueListItemGroup').textContent = it.userGroup;
      issueListItemNode.querySelector('.issueListItemProblem').textContent = it.problem;
      issueListItemNode.querySelector('.issueListItemStatus').textContent = it.status;
      issueListNode.appendChild(issueListItemNode);

      if (it.status === 'PENDING') {
        takeIssueButtonNode.addEventListener('click', () => {
          sendAction('ISSUE_TAKEN', it.id);
        });
      } else {
        takeIssueButtonNode.classList.add('hide');
      }
    });
  };

  renderLandingView();

  const socketProtocol = location.protocol === 'https:' ? 'wss': 'ws';
  const href = document.location.href.split('//')[1];
  const params = `userId:${window.localStorage.getItem('userId')}`;
  const ws = new WebSocket(`${socketProtocol}://${href}?${params}`);
  const sendAction = (action, payload) => {
    ws.send(JSON.stringify({ action, payload }));
  };

  ws.onopen = event => {
    console.info(['WebSocket.onopen'], event);
  };
  ws.onclose = event => {
    console.info(['WebSocket.onclose'], event);
  };
  ws.onmessage = event => {
    const { action, payload } = JSON.parse(event.data);
    console.info(['WebSocket.onmessage'], { action, payload });

    switch (action) {
      case 'PARTICIPANT_LOGGED': {
        renderIssueSubmitView();
        break;
      }
      case 'TRAINER_LOGGED': {
        renderTrainerDashboardView(payload);
        break;
      }
      case 'ISSUE_RECEIVED': {
        renderIssueReceivedView();
        break;
      }
      case 'ISSUE_TAKEN': {
        renderIssueTakenView(payload);
        break;
      }
      case 'ISSUES': {
        renderTrainerDashboardView(payload);
        break;
      }
    }
  };
  ws.onerror = event => {
    console.error(['WebSocket.onerror'], event);
  };
});
