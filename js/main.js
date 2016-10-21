//Lチカ用にLEDポートとLEDの値のためのグローバル変数を定義
var ledPort;
var ledValue=0;

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

    //リンクをクリックした時のイベントを設定する関数
    addEventLink();
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
