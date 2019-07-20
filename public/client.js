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

      sendEvent({
        action: 'PARTICIPANT_LOGIN',
        payload: {
          name: formData.get('name'),
          group: formData.get('group'),
        },
      });
    });
  };
  const renderTrainerLoginView = () => {
    renderTemplateById('trainerLogin');

    getNodeById('trainerLoginForm').addEventListener('submit', event => {
      event.preventDefault();

      const formData = new FormData(event.target);

      sendEvent({
        action: 'TRAINER_LOGIN',
        payload: {
          name: formData.get('name'),
        },
      });
    });
  };
  const renderIssueSubmitView = () => {
    renderTemplateById('issueSubmit');

    getNodeById('issueSubmitForm').addEventListener('submit', event => {
      event.preventDefault();

      const formData = new FormData(event.target);

      sendEvent({
        action: 'TRAINER_NEEDED',
        payload: {
          problem: formData.get('problem'),
        },
      });
    });
  };
  const renderIssueReceivedView = () => {
    renderTemplateById('issueReceived');
  };
  const renderIssueTakenView = trainerName => {
    renderTemplateById('issueTaken');

    getNodeById('issueSolved').addEventListener('click', () => {
      sendEvent({ action: 'ISSUE_SOLVED' });
      renderIssueSubmitView();
    });

    getNodeById('issueTakenHeader').textContent = `Trener ${trainerName} przyjął Twoje zgłoszenie, zaraz podejdzie.`;
  };
  const renderHintReceivedView = hint => {
    renderTemplateById('hintReceived');

    getNodeById('hint').textContent = hint;

    getNodeById('hintSuccess').addEventListener('click', () => {
      sendEvent({ action: 'ISSUE_SOLVED' });
      renderIssueSubmitView();
    });
    getNodeById('hintFail').addEventListener('click', () => {
      sendEvent({ action: 'HINT_FAIL' });
      renderIssueReceivedView();
    });
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

        sendEvent({
          action: 'HINT_SENT',
          payload: {
            hint: formData.get('hint'),
            userId: it.userId,
          },
        });
      });

      switch (it.status) {
        case 'PENDING': {
          takeIssueButtonNode.addEventListener('click', () => {
            sendEvent({
              action: 'ISSUE_TAKEN',
              payload: it.id,
            });
          });

          issueListHintFormNode.classList.add('hide');

          break;
        }
        case 'TAKEN': {
          takeIssueButtonNode.classList.add('hide');

          break;
        }
        default: {
          takeIssueButtonNode.classList.add('hide');
          issueListHintFormNode.classList.add('hide')
        }
      }
    });
  };

  renderLandingView();

  const socket = new WebSocket('ws://localhost:5000');
  const sendEvent = event => {
    try {
      socket.send(JSON.stringify(event));
    }

    catch (e) {
      console.error(e);
    }
  };

  socket.onopen = event => {
    console.log(['WebSocket.onopen'], event);
  };

  socket.onclose = event => {
    console.log(['WebSocket.onclose'], event);
  };

  socket.onmessage = event => {
    console.log(['WebSocket.onmessage'], event.data);
    const { action, payload } = JSON.parse(event.data);

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
      case 'HINT': {
        renderHintReceivedView(payload);
        break;
      }
    }
  };

  socket.onerror = event => {
    console.error(['WebSocket.onerror'], event);
  };
});
