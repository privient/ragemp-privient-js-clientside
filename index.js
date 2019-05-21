var currentStatus = false;

mp.events.add('SocketLogger', (args) => {
    mp.events.callRemote('SocketMessage', args);
});

mp.events.add('SocketEvent', (arg) => {
    mp.gui.chat.push(arg);
})

mp.events.add('IsSocketReady', (arg) => {
    if (currentStatus != arg) {
        currentStatus = arg;
        mp.events.callRemote('SocketStatus', arg);
    }
});

mp.events.add('GetDataRequest', (args) => {
    var dataRequest = {
        route: 'GetData',
        data: {
            appname: args
        }
    }

    var jsonRequest = JSON.stringify(dataRequest);
    mp.gui.execute(`connection.send('${jsonRequest}');`)
});

mp.events.add('CreateNewData', (json) => {
    mp.gui.execute(`connection.send('${json}')`);
});

mp.events.add('SaveData', (appName, data) => {
    var saveDataRequest = {
        route: 'SetData',
        update: true,
        data: {
            appname: appName,
            data: data
        }
    }

    var jsonRequest = JSON.stringify(saveDataRequest);
    mp.gui.execute(`connection.send('${jsonRequest}')`);
});

mp.gui.execute(`
    const url = 'ws://localhost:5555';
    const connection = new WebSocket(url);

    var connStatus = setInterval(() => {
        if (connection.readyState == connection.CLOSED) {
            mp.trigger('SocketEvent', 'Please open your Privient client.');
            mp.trigger('IsSocketReady', false);
            return;
        }

        if (connection.readyState == connection.CONNECTING) {
            mp.trigger('SocketEvent', 'Please wait while we connect...');
            mp.trigger('IsSocketReady', false);
            return;
        }

        if (connection.readyState == connection.OPEN) {
            mp.trigger('SocketEvent', 'Privient client detected. Requesting data...');
            mp.trigger('IsSocketReady', true);
            clearInterval(connStatus);
        }
    }, 500);

    connection.onmessage = e => {
        console.log(e);
        mp.trigger('SocketLogger', e.data);
    }
`);