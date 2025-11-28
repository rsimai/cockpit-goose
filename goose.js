console.log('Goose script started');

const GOOSE_PORT = 3000;
const GOOSE_IP = '127.0.0.1';
const GOOSE_URL = `http://${GOOSE_IP}:${GOOSE_PORT}`;
const goose_iframe = document.getElementById('goose-iframe');

function set_iframe_src() {
  goose_iframe.src = GOOSE_URL;
  console.log('goose-iframe src set');
}

function show_error(title, error) {
    console.error(title, error);
    goose_iframe.src = "about:blank";
    const error_doc = goose_iframe.contentDocument;
    error_doc.open();
    error_doc.write(`<h1>${title}</h1>`);
    if (error) {
        error_doc.write("<pre>" + JSON.stringify(error, null, 2) + "</pre>");
    }
    error_doc.close();
}

function spawn_process(disable_keyring = false) {
    console.log('Spawning goose web process', disable_keyring ? 'with keyring disabled' : '');

    const ready_message = `http://${GOOSE_IP}:${GOOSE_PORT}`;
    let process_output = "";
    let ready = false;

    const timeout = setTimeout(() => {
        if (!ready) {
            show_error("Timeout waiting for goose web process to be ready", { output: process_output });
        }
    }, 30000);

    const spawn_options = { err: "out" };
    if (disable_keyring) {
        spawn_options.environ = ["GOOSE_DISABLE_KEYRING=true"];
    }

    cockpit.spawn(['goose', 'web'], spawn_options)
        .stream(output => {
            console.log("goose web:", output);
            process_output += output;
            if (!ready && process_output.includes(ready_message)) {
                ready = true;
                clearTimeout(timeout);
                console.log("Goose web process is ready");
                set_iframe_src();
            }
        })
        .catch(error => {
            if (!ready) {
                clearTimeout(timeout);
                if (!disable_keyring && process_output.includes("Failed to access keyring")) {
                    console.log("Keyring access failed, retrying with GOOSE_DISABLE_KEYRING=true");
                    spawn_process(true);
                } else {
                    show_error('Failed to spawn goose web process', error);
                }
            }
        });
}

// First, try to connect directly, in case it's already running
const http_check = cockpit.http(GOOSE_PORT, { address: GOOSE_IP });
http_check.get("/")
  .then(() => {
    console.log("Goose web process already running");
    set_iframe_src();
  })
  .catch(() => {
    console.log("Goose web process not running, starting it now");
    spawn_process();
  });