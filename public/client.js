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
  };
  const renderIssueReceivedView = () => {
    renderTemplateById('issueReceived');
  };
  const renderIssueTakenView = trainerName => {
    renderTemplateById('issueTaken');
  };
  const renderHintReceivedView = hint => {
    renderTemplateById('hintReceived');
  };
  const renderTrainerDashboardView = data => {
    renderTemplateById('trainerDashboard');
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
  };

  socket.onerror = event => {
    console.error(['WebSocket.onerror'], event);
  };
});
