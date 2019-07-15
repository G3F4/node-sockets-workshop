document.addEventListener('DOMContentLoaded', () => {
  const renderLandingView = () => {
    const rootNode = document.getElementById('root');
    const landingTemplate = document.getElementById('landing');
    const landingNode = document.importNode(landingTemplate.content, true);

    rootNode.innerHTML = '';
    rootNode.appendChild(landingNode);

    const loginParticipantNode = document.getElementById('loginParticipant');
    const loginTrainerNode = document.getElementById('loginTrainer');

    loginParticipantNode.addEventListener('click', renderParticipantLoginView);

    loginTrainerNode.addEventListener('click', renderTrainerLoginView);
  };
  const renderParticipantLoginView = () => {
    const rootNode = document.getElementById('root');
    const participantLoginTemplate = document.getElementById('participantLogin');
    const participantLoginNode = document.importNode(participantLoginTemplate.content, true);

    rootNode.innerHTML = '';
    rootNode.appendChild(participantLoginNode);

    const participantLoginFormNode = document.getElementById('participantLoginForm');

    participantLoginFormNode.addEventListener('submit', event => {
      event.preventDefault();

      const formData = new FormData(event.target);

      ws.send(JSON.stringify({
        action: 'PARTICIPANT_LOGIN',
        payload: {
          name: formData.get('name'),
          group: formData.get('group'),
        },
      }))
    });
  };
  const renderTrainerLoginView = () => {
    const rootNode = document.getElementById('root');
    const trainerLoginTemplate = document.getElementById('trainerLogin');
    const trainerLoginNode = document.importNode(trainerLoginTemplate.content, true);

    rootNode.innerHTML = '';
    rootNode.appendChild(trainerLoginNode);

    const trainerLoginFormNode = document.getElementById('trainerLoginForm');

    trainerLoginFormNode.addEventListener('submit', event => {
      event.preventDefault();

      const formData = new FormData(event.target);

      ws.send(JSON.stringify({
        action: 'TRAINER_LOGIN',
        payload: {
          name: formData.get('name'),
          code: formData.get('code'),
        },
      }))
    });
  };
  const renderIssueSubmitView = () => {
    const rootNode = document.getElementById('root');
    const issueSubmitTemplate = document.getElementById('issueSubmit');
    const issueSubmitNode = document.importNode(issueSubmitTemplate.content, true);

    rootNode.innerHTML = '';
    rootNode.appendChild(issueSubmitNode);

    const issueSubmitFormNode = document.getElementById('issueSubmitForm');

    issueSubmitFormNode.addEventListener('submit', event => {
      event.preventDefault();

      const formData = new FormData(event.target);

      ws.send(JSON.stringify({
        action: 'TRAINER_NEEDED',
        payload: {
          problem: formData.get('problem'),
        },
      }))
    });
  };
  const renderIssueReceivedView = () => {
    const rootNode = document.getElementById('root');
    const issueReceivedTemplate = document.getElementById('issueReceived');
    const issueReceivedNode = document.importNode(issueReceivedTemplate.content, true);

    rootNode.innerHTML = '';
    rootNode.appendChild(issueReceivedNode);
  };
  const renderIssueTakenView = trainerName => {
    const rootNode = document.getElementById('root');
    const issueTakenTemplate = document.getElementById('issueTaken');
    const issueTakenNode = document.importNode(issueTakenTemplate.content, true);
    const issueTakenHeaderNode = issueTakenNode.getElementById('issueTakenHeader');
    const issueSolvedButtonNode = issueTakenNode.getElementById('issueSolved');

    issueSolvedButtonNode.addEventListener('click', () => {
      ws.send(JSON.stringify({
        action: 'ISSUE_SOLVED',
      }));
      renderIssueSubmitView();
    });

    issueTakenHeaderNode.textContent = `Trener ${trainerName} przyjął Twoje zgłoszenie, zaraz podejdzie.`;
    rootNode.innerHTML = '';
    rootNode.appendChild(issueTakenNode);
  };
  const renderTrainerDashboardView = data => {
    const rootNode = document.getElementById('root');
    const trainerDashboardTemplate = document.getElementById('trainerDashboard');
    const issueListItemTemplate = document.getElementById('issueListItem');
    const trainerDashboardNode = document.importNode(trainerDashboardTemplate.content, true);

    rootNode.innerHTML = '';
    rootNode.appendChild(trainerDashboardNode);

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
          console.log(['it'], it);
          ws.send(JSON.stringify({
            action: 'ISSUE_TAKEN',
            payload: it.id,
          }));
        });
      } else {
        takeIssueButtonNode.classList.add('hide');
      }
    });
  };

  renderLandingView();

  const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss': 'ws'}://${document.location.href.split('//')[1]}`);

  ws.onopen = event => {
    console.log(['WebSocket.onopen'], event);
  };
  ws.onclose = event => {
    console.log(['WebSocket.onclose'], event);
  };
  ws.onmessage = event => {
    const { action, payload } = JSON.parse(event.data);
    console.log(['WebSocket.onmessage'], { action, payload });

    switch (action) {
      case 'PARTICIPANT_LOGGED': {
        console.log('uczestnik zalogowany');
        renderIssueSubmitView();
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
      case 'TRAINER_LOGGED': {
        console.log('trener zalogowany');
        renderTrainerDashboardView(payload);
        break;
      }
      case 'ISSUES': {
        console.log('trener zalogowany');
        renderTrainerDashboardView(payload);
        break;
      }
    }
  };
  ws.onerror = event => {
    console.log(['WebSocket.onerror'], event);
  };
});
