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
    btnPort.onchange = (btnValue) => {
      //タクトスイッチが押し込まれている時(GPIOの値が0の時)の処理 
      if(!btnValue){
        //id=detailのdivタグの中身を書き換える
        document.getElementById("detail").innerHTML = "ちりめん（縮緬、クレープ織り、仏: crêpe）は、絹を平織りにして作った織物。 from Wiki";
      }else{
        //タクトスイッチを離した時、元々のdetailの中身に戻す  
        document.getElementById("detail").innerHTML = originalContents;
      }
    };

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
