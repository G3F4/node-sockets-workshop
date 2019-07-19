document.addEventListener('DOMContentLoaded', () => {
  const renderTemplateById = id => {
    const rootNode = getElementById('root');
    const template = getElementById(id);
    const node = template.content.cloneNode(true);

    rootNode.innerHTML = '';
    rootNode.appendChild(node);
  };
  const getElementById = id => getElementById(id);
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
});
