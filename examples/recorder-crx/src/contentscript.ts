/*
 * @Description:
 * @Autor: peterma
 * @Date: 2024-07-02 15:59:20
 * @LastEditors: peterma
 * @LastEditTime: 2024-07-04 17:40:26
 */

// if not running as a chrome extension, skip this...
console.log("this is content scripts");
if (typeof chrome !== "undefined" && chrome.runtime) {
  console.log(chrome, "chrome");

  let _port: chrome.runtime.Port | undefined;

  const wnd: any = window;

  wnd.dispatch = async function _onDispatch(data: any) {
    _port?.postMessage({ type: "recorderEvent", ...data });
  };
  //发送消息
  var myPort = chrome.runtime.connect();
  window.addEventListener(
    "message",
    (event) => {
      // We only accept messages from ourselves
      if (event.source !== window) {
        return;
      }

      if (event.data.type && event.data.type === "FROM_PAGE") {
        console.log("Content script received---: " + event.data.text);
        myPort.postMessage(event.data.text);
      }
    },
    false
  );
  console.log(chrome.runtime.onConnect, "chrome.runtime.onConnect");

  chrome.runtime.onConnect.addListener((port) => {
    _port = port;

    port.onMessage.addListener(async (msg) => {
      if (!("type" in msg) || msg.type !== "recorder") return;
      console.log("插件信息", msg);
      //@ts-ignore
      window.myTestMsg = msg;
      switch (msg.method) {
        case "setPaused":
          wnd.playwrightSetPaused(msg.paused);
          break;
        case "setMode":
          wnd.playwrightSetMode(msg.mode);
          break;
        case "setSources":
          wnd.playwrightSetSources(msg.sources);
          break;
        case "updateCallLogs":
          wnd.playwrightUpdateLogs(msg.callLogs);
          break;
        case "setSelector":
          wnd.playwrightSetSelector(msg.selector, msg.userGesture);
          break;
        case "setFileIfNeeded":
          wnd.playwrightSetFileIfNeeded(msg.file);
          break;
      }
    });

    port.onDisconnect.addListener(() => {
      _port = undefined;
    });
  });
}
