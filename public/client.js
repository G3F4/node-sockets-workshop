document.addEventListener('DOMContentLoaded', () => {
  const renderTemplateById = id => {
    const rootNode = getNodeById('root');
    const template = getNodeById(id);
    const node = template.content.cloneNode(true);

    rootNode.innerHTML = '';
    rootNode.appendChild(node);
  };
  const getNodeById = id => document.getElementById(id);
  const renderLandingView = () => {
    renderTemplateById('landing');

    getNodeById('loginParticipant').addEventListener('click', renderParticipantLoginView);
    getNodeById('loginTrainer').addEventListener('click', renderTrainerLoginView);
  };
  const renderParticipantLoginView = () => {
    renderTemplateById('participantLogin');

    getNodeById('participantLoginForm').addEventListener('submit', event => {
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

    getNodeById('trainerLoginForm').addEventListener('submit', event => {
      event.preventDefault();

      const formData = new FormData(event.target);

      sendAction('TRAINER_LOGIN', {
        name: formData.get('name'),
      });
    });
  };
  const renderIssueSubmitView = () => {
    renderTemplateById('issueSubmit');

    getNodeById('issueSubmitForm').addEventListener('submit', event => {
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

    getNodeById('issueSolved').addEventListener('click', () => {
      sendAction('ISSUE_SOLVED');
      renderIssueSubmitView();
    });

    getNodeById('issueTakenHeader').textContent = `Trener ${trainerName} przyjął Twoje zgłoszenie, zaraz podejdzie.`;
  };
  const renderHintReceivedView = hint => {
    renderTemplateById('hintReceived');

    getNodeById('hintSuccess').addEventListener('click', () => {
      sendAction('ISSUE_SOLVED');
      renderIssueSubmitView();
    });
    getNodeById('hintFail').addEventListener('click', () => {
      sendAction('HINT_FAIL');
      renderIssueReceivedView();
    });

    getNodeById('hint').textContent = hint;
  };
  const renderTrainerDashboardView = data => {
    renderTemplateById('trainerDashboard');

    const issueListItemTemplate = getNodeById('issueListItem');
    const issueListNode = getNodeById('issueList');

    data.forEach(it => {
      const issueListItemNode = document.importNode(issueListItemTemplate.content, true);
      const takeIssueButtonNode = issueListItemNode.querySelector('.issueListItemActions button');
      const issueListHintFormNode = issueListItemNode.querySelector('.issueListHintForm');

      issueListItemNode.querySelector('.issueListItemName').textContent = it.userName;
      issueListItemNode.querySelector('.issueListItemGroup').textContent = it.userGroup;
      issueListItemNode.querySelector('.issueListItemProblem').textContent = it.problem;
      issueListItemNode.querySelector('.issueListItemStatus').textContent = it.status;
      issueListNode.appendChild(issueListItemNode);

      issueListHintFormNode.addEventListener('submit', event => {
        event.preventDefault();

        const formData = new FormData(event.target);

        sendAction('HINT_SENT', {
          hint: formData.get('hint'),
          userId: it.userId,
        });
      });

      if (it.status === 'PENDING') {
        takeIssueButtonNode.addEventListener('click', () => {
          sendAction('ISSUE_TAKEN', it.id);
        });
        issueListHintFormNode.classList.add('hide');
      } else if (it.status === 'TAKEN') {
        takeIssueButtonNode.classList.add('hide');
      } else if (it.status === 'SOLVED') {
        takeIssueButtonNode.classList.add('hide');
        issueListHintFormNode.classList.add('hide');
      } else {
        takeIssueButtonNode.classList.add('hide');
        issueListHintFormNode.classList.add('hide');
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
      case 'HINT_RECEIVED': {
        renderHintReceivedView(payload);
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
