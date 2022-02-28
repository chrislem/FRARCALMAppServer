const { spawn } = require("child_process");

async function passthru(exe, args, options, socket) {
    return new Promise((resolve, reject) => {
        const env = Object.create(process.env);
        /*const child = spawn(exe, args, {
            ...options,
            env: {
                ...env,
                ...options.env,
            },
        });*/
        const child = spawn(exe, args);
        child.stdout.setEncoding('utf8');
        child.stderr.setEncoding('utf8');
        child.stdout.on('data', data => {socket.emit('notification', data);
                    console.log(data);            
                    });
        child.stderr.on('data', data => {socket.emit('notification', data)
        console.log(data);            
    });
        child.on('error', error => reject(error));
        child.on('close', exitCode => {
            socket.emit('notification', "process Done");
            resolve(exitCode);
        });
    });
}

exports.passthru = passthru;
