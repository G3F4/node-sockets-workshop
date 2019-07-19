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
  };
  const renderParticipantLoginView = () => {
    renderTemplateById('participantLogin');
  };
  const renderTrainerLoginView = () => {
    renderTemplateById('trainerLogin');
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
