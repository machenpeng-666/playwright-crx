/*
 * @Description:
 * @Autor: peterma
 * @Date: 2024-07-02 15:59:20
 * @LastEditors: peterma
 * @LastEditTime: 2024-07-05 16:57:56
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
  window.postMessage("555555---suiji", "*"); // "*" 表
  chrome.runtime.onConnect.addListener((port) => {
    _port = port;
    window.postMessage("函数内发送", "*");
    port.onMessage.addListener(async (msg) => {
      if (!("type" in msg) || msg.type !== "recorder") return;
      // console.log("插件信息", msg);
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
          console.log("发送消息source", msg);
          window.postMessage(msg, "*"); // "*" 表示任何源都可以接收消息，但在生产环境中应指定具体源以增强安全性
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
