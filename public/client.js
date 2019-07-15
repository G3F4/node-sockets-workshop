document.addEventListener('DOMContentLoaded', () => {
  const contentNode = document.createElement('div');
  const headerNode = document.createElement('h1');
  const headerTextNode = document.createTextNode('WebSockets boilerplate!');
  const counterWrapperNode = document.createElement('div');
  const counterTextWrapperNode = document.createElement('div');
  const counterButtonWrapperNode = document.createElement('div');
  const counterButtonNode = document.createElement('button');
  const counterButtonTextNode = document.createTextNode('Increment');
  const counterTextNode = document.createTextNode(`Counter: `);

  headerNode.setAttribute('class', 'header');
  counterWrapperNode.setAttribute('class', 'counter');

  headerNode.appendChild(headerTextNode);

  counterTextWrapperNode.appendChild(counterTextNode);
  counterWrapperNode.appendChild(counterTextWrapperNode);

  counterButtonNode.appendChild(counterButtonTextNode);
  counterButtonWrapperNode.appendChild(counterButtonNode);
  counterWrapperNode.appendChild(counterButtonWrapperNode);

  contentNode.appendChild(headerNode);
  contentNode.appendChild(counterWrapperNode);

  document.getElementById('root').appendChild(contentNode);

  const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss': 'ws'}://${document.location.href.split('//')[1]}`);

  ws.onopen = event => {
    console.log(['WebSocket.onopen'], event);
  };
  ws.onclose = event => {
    console.log(['WebSocket.onclose'], event);
  };
  ws.onmessage = event => {
    const { action, data } = JSON.parse(event.data);
    console.log(['WebSocket.onmessage'], { action, data });

    if (action === 'update') {
      counterTextWrapperNode.innerHTML = `Counter: ${data}`;
    }
  };
  ws.onerror = event => {
    console.log(['WebSocket.onerror'], event);
  };

  counterButtonNode.addEventListener('click', () => {
    console.log(['increment']);

    ws.send(JSON.stringify({ action: 'increment', data: null }));
  });
});
