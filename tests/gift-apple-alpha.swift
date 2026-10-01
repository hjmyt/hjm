import AppKit
import WebKit
let app = NSApplication.shared
app.setActivationPolicy(.accessory)
class Check: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
    var web: WKWebView!
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        print(message.body)
        if let data = message.body as? [String:Any], let error = data["error"] { print(error); exit(1) }
        exit(0)
    }
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        webView.evaluateJavaScript("""
        void(async()=>{
          const results=[];
          for(const [id,gift] of [['feihong','baoshi_comfort'],['baoshi','feihong_comfort'],['shiyuan','heartfelt_encore']]){
            characterSelect.value=id;syncGifts(gift);replayGift();
            const start=performance.now();
            while(!(document.querySelector('.gift-encore-video')?.currentTime>.8)){
              if(performance.now()-start>12000)throw Error('Video timed out: '+gift);
              await new Promise(r=>setTimeout(r,60));
            }
            const v=document.querySelector('.gift-encore-video');
            if(!v.currentSrc.endsWith('.mov'))throw Error('Apple selected non-HEVC: '+v.currentSrc);
            if(!document.querySelector('.is-encore-ready'))throw Error('Alpha rejected: '+gift);
            const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;
            const x=c.getContext('2d');x.drawImage(v,0,0);const p=x.getImageData(0,0,c.width,c.height).data;
            let clear=0,solid=0;for(let i=3;i<p.length;i+=4){if(p[i]<8)clear++;if(p[i]>245)solid++;}
            if(p[3]>8||clear<10000||solid<10000)throw Error('Lost alpha: '+gift+' '+p[3]+' '+clear+' '+solid);
            results.push({gift,src:v.currentSrc,corner:p[3],clear,solid});GiftEffects.stop();
          }
          window.webkit.messageHandlers.result.postMessage({passed:true,results});
        })().catch(e=>window.webkit.messageHandlers.result.postMessage({error:String(e)}));
        """, completionHandler: nil)
    }
}
let check=Check(),config=WKWebViewConfiguration()
config.mediaTypesRequiringUserActionForPlayback=[]
config.userContentController.add(check,name:"result")
let web=WKWebView(frame:NSRect(x:0,y:0,width:800,height:900),configuration:config)
check.web=web;web.navigationDelegate=check
let window=NSWindow(contentRect:NSRect(x:80,y:80,width:800,height:900),styleMask:[.titled,.closable],backing:.buffered,defer:false)
window.title="礼物透明视频兼容性验证"
window.contentView=web;window.makeKeyAndOrderFront(nil);app.activate(ignoringOtherApps:true)
web.load(URLRequest(url:URL(string:CommandLine.arguments[1])!))
DispatchQueue.main.asyncAfter(deadline:.now()+50){print("WebKit timeout");exit(1)}
app.run()
