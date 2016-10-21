//Lチカ用にLEDポートとLEDの値のためのグローバル変数を定義
var ledPort;
var ledValue=0;
//タクトスイッチ用にbtnポートのためのグローバル変数を定義  
var btnPort;

// task.js ライブラリ
const { spawn, sleep } = task;
// document 内のリソースが読み終わるのを待つ
document.addEventListener("DOMContentLoaded", () => {
  
  // task.js の spawn 関数内では Promise が同期的に記述できる
  spawn(function() {
    // GPIO へのアクセサを取得
    const gpioAccessor = yield navigator.requestGPIOAccess();
    //GPIO198(CHIRIMEN CN1-9)をLチカ用のGPIOポートとして利用する
    ledPort = gpioAccessor.ports.get(198);
    //ledPortを出力として利用する
    yield ledPort.export("out");

    //GPIO199(CHIRIMEN CN1-10)をタクトスイッチ用のGPIOポート  
    btnPort = gpioAccessor.ports.get(199);
    //btnPortを入力として利用する
    yield btnPort.export("in");

    //元々のdetailの中身を変数に入れておく
    var originalContents = document.getElementById("detail").innerHTML;
    //btnPortの値に変化があった時(タクトスイッチが押された時)の処理を規定
    btnPort.onchange = function(btnValue){
      //タクトスイッチが押し込まれている時(GPIOの値が0の時)の処理 
      if(!btnValue){
        //id=detailのdivタグの中身を書き換える
        document.getElementById("detail").innerHTML = "ちりめん（縮緬、クレープ織り、仏: crêpe）は、絹を平織りにして作った織物。 from Wiki";
      }else{
        //タクトスイッチを離した時、元々のdetailの中身に戻す  
        document.getElementById("detail").innerHTML = originalContents;
      }
      //getRandomWiki();
    };

    //リンクをクリックした時のイベントを設定する関数
    addEventLink();

    // I2C へのアクセサを取得
    const accessor = yield navigator.requestI2CAccess();
    // I2C 0 ポートを使うので、0 を指定してポートを取得
    const port = accessor.ports.get(0);
    // SRF02 超音波センサの初期アドレス 0x70 を指定して slave オブジェクトを取得
    const slave = yield port.open(0x70);
    //ループ
    for (;;) {
      // ここからは各 I2C デバイスによって制御方法が異なる
      // SRF02 では以下のようにして距離を取得
      yield slave.write8(0x00, 0x00);
      yield sleep(1);
      slave.write8(0x00, 0x51);
      yield sleep(70);
      const highBit = yield slave.read8(0x02, true);
      const lowBit = yield slave.read8(0x03, true);
      // 距離
      const distance = (highBit << 8) + lowBit;

      // 確認用に console.log に表示
      console.log(distance);
      // HTML 画面に距離を表示
      document.querySelector("#distance").textContent = distance;
      
      // 距離センサの値によって画面をスクロールさせる関数
      scroll(distance);

      // 次のセンシングまで 1000ms 待つ
      yield sleep(1000);
    }
  });

});

function addEventLink(){
  //ドキュメント内のaタグを全て取得
  Array.from(document.querySelectorAll("a"),  (e) => {
    //取得した要素(aタグ)にtouchstartイベントを設定(CHIRIMENではマウスイベントはtouchイベントに置き換えられる)
    e.addEventListener("touchstart",()=>{
      //LEDを点灯させる
      ledPort.write(1);
      //一致時間(1000ミリ秒)後の処理を記述
      setTimeout(()=>{
        //LEDを消灯させる
        ledPort.write(0);
      },1000);
    });
  });
}

function scroll(val){
  //ドキュメントの高さを取得
  var ch = document.body.scrollHeight;
  //距離センサの値の扱う範囲を15から50の間とする
  const minVal = 15;
  const maxVal = 50;
  //距離センサの値が50より大きい時、何もしない
  if(val > maxVal){
    return;
  }
  //距離センサが15より小さいときは、minValの値で固定する
  if(val < minVal){
    val = minVal;
  }
  //スクロールする位置を決定する   
  var sx = ch * (1 - (val - minVal)/(maxVal - minVal));
  //指定の位置にスクロールさせる    
  window.scrollTo(0,sx);
}


/*
function parseWiki(json){
  console.log("parseWiki");
  var html;
  for(i in json.query.pages){
    html = json.query.pages[i].revisions[0]["*"];
  }
  var div = document.getElementById("contents");
  div.innerHTML = html;
  addEventLink();
}
function getWiki(query){
  console.log("getWiki");
  $.ajax({
    type: "get",
    dataType: "jsonp",
    url: "https://ja.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&titles="+query+"&rvprop=content&rvparse",
    success: parseWiki
  });

}

function getRandomWiki(){
  $.ajax({
    type: "get",
    dataType: "jsonp",
    url: "http://ja.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=1&format=json",
    success: function(json) {
      console.log(json);
      var title = json.query.random[0].title;
      getWiki(title);
    }
  });
}

function addEventLink(){
  Array.from(document.querySelectorAll("a"),  (e) => {
    console.log(e.href);
    e.href = "#contents";
    e.addEventListener("touchstart",()=>{
      console.log("touchstart");
      ledPort.write(1);
      setTimeout(()=>{
        console.log("led turn off");
        ledPort.write(0);
      },1000);
    });
  });
}
*/
/*
function scroll(val){
  var ch = document.body.scrollHeight;
  console.log("ch=",ch);
  const minVal = 15;
  const maxVal = 50;
  if(val > maxVal){
    return;
  }
  if(val < minVal){
    val = minVal;
  }
  var sx = ch * (1 - (val - minVal)/(maxVal - minVal));
  
  $('html,body').animate({scrollTop: sx}, 500, 'swing');
  //not jquery
  //window.scrollTo(0,sx);
}
*/
